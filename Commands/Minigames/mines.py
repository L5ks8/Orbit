import random
import math
import discord
from discord import app_commands
from discord.ext import commands
from Commands.Economy._storage import (
    load_economy_config,
    get_user_balance,
    add_user_balance,
    remove_user_balance
)

def get_mines_multiplier(mines: int, clicks: int, house_edge: float = 0.95) -> float:
    if clicks == 0:
        return 1.0
    total_spots = 16
    safe_spots = total_spots - mines
    if clicks > safe_spots:
        return 0.0
    prob = math.comb(safe_spots, clicks) / math.comb(total_spots, clicks)
    mult = house_edge / prob
    return round(mult, 2)

class MinesSession:
    def __init__(self, player: discord.abc.User, bet_amount: int, mines_count: int, guild_id: int = 0):
        self.player = player
        self.bet_amount = bet_amount
        self.mines_count = mines_count
        self.guild_id = guild_id
        
        # 0 to 15 representing the 4x4 grid (16 spots)
        self.grid_state = ["hidden"] * 16 # "hidden", "safe", "mine"
        
        # Place mines
        spots = list(range(16))
        random.shuffle(spots)
        self.mine_locations = spots[:mines_count]
        
        self.clicks = 0
        self.game_over = False
        self.outcome_text = "Click a tile to start finding gems!"
        self.current_mult = 1.0
        self.base_xp = 0
        self.money_processed = False

    def click(self, index: int):
        if self.game_over or self.grid_state[index] != "hidden":
            return
            
        if index in self.mine_locations:
            # Hit a mine
            self.game_over = True
            self.grid_state[index] = "mine"
            self.outcome_text = f"**BOOM!** You hit a mine and lost `{self.bet_amount:,}`."
            self.current_mult = 0.0
            self.reveal_all()
        else:
            # Safe
            self.clicks += 1
            self.grid_state[index] = "safe"
            self.current_mult = get_mines_multiplier(self.mines_count, self.clicks)
            
            if self.clicks == (16 - self.mines_count):
                self.game_over = True
                self.outcome_text = "**JACKPOT!** You found all gems!"
                self.base_xp = 100
                self.reveal_all()
            else:
                payout = int(self.bet_amount * self.current_mult)
                self.outcome_text = f"**Safe!** Current multiplier: `{self.current_mult}x`\nCashout now for `{payout:,}` or keep going!"

    def cashout(self):
        self.game_over = True
        self.base_xp = 20 + (self.clicks * 5)
        payout = int(self.bet_amount * self.current_mult)
        profit = payout - self.bet_amount
        self.outcome_text = f"**Cashed Out!** You walked away with `{payout:,}` *(Net: +{profit:,})*!"
        self.reveal_all()

    def reveal_all(self):
        for i in range(16):
            if self.grid_state[i] == "hidden":
                if i in self.mine_locations:
                    self.grid_state[i] = "mine_revealed"
                else:
                    self.grid_state[i] = "safe_revealed"

class MinesLayoutView(discord.ui.View):
    def __init__(self, session: MinesSession, guild_id: int = 0):
        super().__init__(timeout=300)
        self.session = session
        self.guild_id = guild_id or session.guild_id
        self._build_ui()

    def _build_ui(self):
        self.clear_items()
        
        # 4x4 Grid
        for i in range(16):
            state = self.session.grid_state[i]
            ui_row = i // 4
            
            if state == "hidden":
                btn = discord.ui.Button(style=discord.ButtonStyle.secondary, label="?", custom_id=f"mine_{i}", disabled=self.session.game_over, row=ui_row)
            elif state == "safe":
                btn = discord.ui.Button(style=discord.ButtonStyle.success, emoji="💎", custom_id=f"mine_{i}", disabled=True, row=ui_row)
            elif state == "mine":
                btn = discord.ui.Button(style=discord.ButtonStyle.danger, emoji="💣", custom_id=f"mine_{i}", disabled=True, row=ui_row)
            elif state == "safe_revealed":
                btn = discord.ui.Button(style=discord.ButtonStyle.secondary, emoji="💎", custom_id=f"mine_{i}", disabled=True, row=ui_row)
            elif state == "mine_revealed":
                btn = discord.ui.Button(style=discord.ButtonStyle.secondary, emoji="💣", custom_id=f"mine_{i}", disabled=True, row=ui_row)
                
            # Attach callback for hidden buttons
            if state == "hidden" and not self.session.game_over:
                btn.callback = self.make_callback(i)
                
            self.add_item(btn)
            
        # 5th Row: Cashout / Play Again
        if not self.session.game_over:
            payout = int(self.session.bet_amount * self.session.current_mult)
            btn_cashout = discord.ui.Button(label=f"Cashout ({payout:,})", style=discord.ButtonStyle.primary, custom_id="cashout", disabled=(self.session.clicks == 0), row=4)
            
            async def _cashout_cb(interaction: discord.Interaction):
                if interaction.user.id != self.session.player.id:
                    return await interaction.response.send_message("This is not your game!", ephemeral=True)
                await interaction.response.defer()
                self.session.cashout()
                await self.process_payout_and_xp(interaction)
                self._build_ui()
                await interaction.edit_original_response(**self.get_kwargs())
                
            btn_cashout.callback = _cashout_cb
            self.add_item(btn_cashout)
        else:
            btn_new = discord.ui.Button(label=f"Play Again ({self.session.bet_amount:,})", style=discord.ButtonStyle.primary, custom_id="play_again", row=4)
            
            async def _new_cb(interaction: discord.Interaction):
                if interaction.user.id != self.session.player.id:
                    return await interaction.response.send_message("This is not your game!", ephemeral=True)
                
                await interaction.response.defer()
                gid = interaction.guild_id or self.guild_id
                cfg = load_economy_config(gid)
                sym = cfg.get("currency_symbol", "🪙")

                bal = get_user_balance(gid, interaction.user.id)
                if bal < self.session.bet_amount:
                    return await interaction.followup.send(f"You don't have enough money for this bet! Balance: **{sym} {bal:,}**")

                remove_user_balance(gid, interaction.user.id, self.session.bet_amount)
                self.session = MinesSession(self.session.player, self.session.bet_amount, self.session.mines_count, self.guild_id)
                self._build_ui()
                await interaction.edit_original_response(**self.get_kwargs())
                
            btn_new.callback = _new_cb
            self.add_item(btn_new)

    def make_callback(self, index: int):
        async def _cb(interaction: discord.Interaction):
            if interaction.user.id != self.session.player.id:
                return await interaction.response.send_message("This is not your game!", ephemeral=True)
            
            await interaction.response.defer()
            self.session.click(index)
            if self.session.game_over:
                await self.process_payout_and_xp(interaction)
            
            self._build_ui()
            await interaction.edit_original_response(**self.get_kwargs())
        return _cb

    async def process_payout_and_xp(self, interaction: discord.Interaction):
        if not self.session.game_over or self.session.money_processed:
            return
            
        self.session.money_processed = True
        gid = interaction.guild_id or self.guild_id
        cfg = load_economy_config(gid)
        sym = cfg.get("currency_symbol", "🪙")

        payout = int(self.session.bet_amount * self.session.current_mult)
        if payout > 0:
            add_user_balance(gid, interaction.user.id, payout)

        if self.session.base_xp > 0 and interaction.guild and interaction.user:
            from Commands.Level._storage import grant_minigame_xp
            xp_earned = await grant_minigame_xp(interaction.guild, interaction.user, interaction.channel, self.session.base_xp)
            if xp_earned > 0:
                self.session.outcome_text += f" *(✨ +{xp_earned} XP)*"

    def get_kwargs(self):
        from Embeds import get_command_embed
        return get_command_embed(
            self.guild_id, "mines", msg_type="game",
            player=self.session.player,
            outcome_text=self.session.outcome_text,
            mines_count=self.session.mines_count,
            current_mult=self.session.current_mult,
            bet_amount=self.session.bet_amount,
            view=self
        )

class MinesCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="mines", description="Play a game of Mines (`/mines <bet> <mines_count>`).")
    @app_commands.describe(
        bet="Amount of money to bet (e.g. 50)",
        mines_count="Number of mines (1-15, default is 3)"
    )
    async def mines_cmd(self, ctx: commands.Context, bet: int = 10, mines_count: int = 3):
        await ctx.defer()
        
        if not ctx.guild:
            return await ctx.send("This command must be run inside a server.")

        if bet < 1:
            return await ctx.send("Bet amount must be at least 1.")
            
        if mines_count < 1 or mines_count > 15:
            return await ctx.send("Mines count must be between 1 and 15.")

        cfg = load_economy_config(ctx.guild.id)
        sym = cfg.get("currency_symbol", "🪙")

        if cfg.get("bet_limit_enabled", True):
            max_bet = cfg.get("bet_limit_amount", 10000)
            if bet > max_bet:
                return await ctx.send(f"The maximum bet limit on this server is **{sym} {max_bet:,}**.")

        bal = get_user_balance(ctx.guild.id, ctx.author.id)
        if bal < bet:
            return await ctx.send(f"You don't have enough money! Your balance is **{sym} {bal:,}**.")

        remove_user_balance(ctx.guild.id, ctx.author.id, bet)

        session = MinesSession(ctx.author, bet, mines_count, ctx.guild.id)
        view = MinesLayoutView(session, guild_id=ctx.guild.id)
        
        await ctx.send(**view.get_kwargs(), allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    await bot.add_cog(MinesCommand(bot))
