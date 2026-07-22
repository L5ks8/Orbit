import random
import discord
from discord import app_commands
from discord.ext import commands
from Commands.Economy._storage import (
    load_economy_config,
    get_user_balance,
    add_user_balance,
    remove_user_balance
)

def get_towers_multiplier(row: int, house_edge: float = 0.95) -> float:
    # row is 1-indexed (1 to 4)
    # Win probability per row is 2/3.
    # Cumulative probability for row R is (2/3)^R
    if row == 0:
        return 1.0
    prob = (2/3) ** row
    mult = house_edge / prob
    return round(mult, 2)

class TowersSession:
    def __init__(self, player: discord.abc.User, bet_amount: int, guild_id: int = 0):
        self.player = player
        self.bet_amount = bet_amount
        self.guild_id = guild_id
        
        # 4 rows, bottom is row 0, top is row 3
        # We store bomb indices for each row (0, 1, or 2)
        self.bomb_locations = [random.randint(0, 2) for _ in range(4)]
        
        # Grid state: list of 4 rows, each is a list of 3 strings: "hidden", "safe", "bomb"
        self.grid_state = [["hidden"] * 3 for _ in range(4)]
        
        self.current_row = 0 # Starts at bottom (row 0)
        self.game_over = False
        self.outcome_text = "Start from the bottom row! Pick a safe tile to climb."
        self.current_mult = 1.0
        self.base_xp = 0
        self.money_processed = False

    def click(self, row: int, col: int):
        if self.game_over or row != self.current_row:
            return
            
        if self.bomb_locations[row] == col:
            # Hit a bomb
            self.game_over = True
            self.grid_state[row][col] = "bomb"
            self.outcome_text = f"**KABOOM!** You hit a bomb on row {row+1} and lost `{self.bet_amount:,}`."
            self.current_mult = 0.0
            self.reveal_all()
        else:
            # Safe
            self.grid_state[row][col] = "safe"
            self.current_row += 1
            self.current_mult = get_towers_multiplier(self.current_row)
            
            if self.current_row == 4:
                self.game_over = True
                self.outcome_text = "**TOP OF THE TOWER!** You reached the peak!"
                self.base_xp = 150
                self.reveal_all()
            else:
                payout = int(self.bet_amount * self.current_mult)
                self.outcome_text = f"**Safe!** Current multiplier: `{self.current_mult}x`\nCashout now for `{payout:,}` or keep climbing!"

    def cashout(self):
        self.game_over = True
        self.base_xp = 20 + (self.current_row * 10)
        payout = int(self.bet_amount * self.current_mult)
        profit = payout - self.bet_amount
        self.outcome_text = f"**Cashed Out!** You walked away with `{payout:,}` *(Net: +{profit:,})*!"
        self.reveal_all()

    def reveal_all(self):
        for r in range(4):
            for c in range(3):
                if self.grid_state[r][c] == "hidden":
                    if self.bomb_locations[r] == c:
                        self.grid_state[r][c] = "bomb_revealed"
                    else:
                        self.grid_state[r][c] = "safe_revealed"

class TowersLayoutView(discord.ui.View):
    def __init__(self, session: TowersSession, guild_id: int = 0):
        super().__init__(timeout=300)
        self.session = session
        self.guild_id = guild_id or session.guild_id
        self._build_ui()

    def _build_ui(self):
        self.clear_items()
        
        for r in reversed(range(4)):
            ui_row = 3 - r
            for c in range(3):
                state = self.session.grid_state[r][c]
                is_active_row = (r == self.session.current_row) and not self.session.game_over
                
                if state == "hidden":
                    style = discord.ButtonStyle.primary if is_active_row else discord.ButtonStyle.secondary
                    btn = discord.ui.Button(style=style, label="?", custom_id=f"tower_{r}_{c}", disabled=not is_active_row, row=ui_row)
                elif state == "safe":
                    btn = discord.ui.Button(style=discord.ButtonStyle.success, emoji="✅", custom_id=f"tower_{r}_{c}", disabled=True, row=ui_row)
                elif state == "bomb":
                    btn = discord.ui.Button(style=discord.ButtonStyle.danger, emoji="💀", custom_id=f"tower_{r}_{c}", disabled=True, row=ui_row)
                elif state == "safe_revealed":
                    btn = discord.ui.Button(style=discord.ButtonStyle.secondary, emoji="✅", custom_id=f"tower_{r}_{c}", disabled=True, row=ui_row)
                elif state == "bomb_revealed":
                    btn = discord.ui.Button(style=discord.ButtonStyle.secondary, emoji="💀", custom_id=f"tower_{r}_{c}", disabled=True, row=ui_row)
                    
                if state == "hidden" and is_active_row:
                    btn.callback = self.make_callback(r, c)
                    
                self.add_item(btn)
                
        # 5th Row: Cashout / Play Again
        if not self.session.game_over:
            payout = int(self.session.bet_amount * self.session.current_mult)
            btn_cashout = discord.ui.Button(label=f"Cashout ({payout:,})", style=discord.ButtonStyle.success, custom_id="cashout", disabled=(self.session.current_row == 0), row=4)
            
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
                self.session = TowersSession(self.session.player, self.session.bet_amount, self.guild_id)
                self._build_ui()
                await interaction.edit_original_response(**self.get_kwargs())
                
            btn_new.callback = _new_cb
            self.add_item(btn_new)

    def make_callback(self, row: int, col: int):
        async def _cb(interaction: discord.Interaction):
            if interaction.user.id != self.session.player.id:
                return await interaction.response.send_message("This is not your game!", ephemeral=True)
            
            await interaction.response.defer()
            self.session.click(row, col)
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

        if payout > self.session.bet_amount:
            profit = payout - self.session.bet_amount
            # Only append if not already in the text (like cashout)
            if "Cashed Out!" not in self.session.outcome_text:
                self.session.outcome_text += f"\n💰 **Won:** {sym} {payout:,} *(Net: +{sym} {profit:,})*"
        elif payout == self.session.bet_amount:
            self.session.outcome_text += f"\n💰 **Returned:** {sym} {payout:,}"

        if self.session.base_xp > 0 and interaction.guild and interaction.user:
            from Commands.Level._storage import grant_minigame_xp
            xp_earned = await grant_minigame_xp(interaction.guild, interaction.user, interaction.channel, self.session.base_xp)
            if xp_earned > 0:
                self.session.outcome_text += f" *(✨ +{xp_earned} XP)*"

    def get_kwargs(self):
        from Embeds import get_command_embed
        return get_command_embed(
            self.guild_id, "towers", msg_type="game",
            player=self.session.player,
            outcome_text=self.session.outcome_text,
            current_row=self.session.current_row,
            current_mult=self.session.current_mult,
            bet_amount=self.session.bet_amount,
            view=self
        )

class TowersCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="towers", description="Play a game of Towers (`/towers <bet>`).")
    @app_commands.describe(bet="Amount of money to bet (e.g. 50)")
    async def towers_cmd(self, ctx: commands.Context, bet: int = 10):
        await ctx.defer()
        
        if not ctx.guild:
            return await ctx.send("This command must be run inside a server.")

        if bet < 1:
            return await ctx.send("Bet amount must be at least 1.")

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

        session = TowersSession(ctx.author, bet, ctx.guild.id)
        view = TowersLayoutView(session, guild_id=ctx.guild.id)
        
        await ctx.send(**view.get_kwargs(), allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    await bot.add_cog(TowersCommand(bot))
