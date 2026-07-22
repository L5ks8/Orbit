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

SYMBOLS = ["🍒", "🍋", "🍉", "🍇", "🔔", "💎", "7️⃣"]

class SlotsSession:
    def __init__(self, player: discord.abc.User, bet_amount: int, guild_id: int = 0):
        self.player = player
        self.bet_amount = bet_amount
        self.guild_id = guild_id
        self.grid = []
        self.outcome_text = ""
        self.base_xp = 0
        self.payout_mult = 0.0

    def spin(self):
        self.grid = [
            [random.choice(SYMBOLS) for _ in range(3)],
            [random.choice(SYMBOLS) for _ in range(3)],
            [random.choice(SYMBOLS) for _ in range(3)]
        ]
        center = self.grid[1]
        s1, s2, s3 = center[0], center[1], center[2]

        if s1 == s2 == s3 == "7️⃣":
            self.outcome_text = "**JACKPOT 777!** Mega Casino Payout (`10x Win`)!"
            self.base_xp = 500
            self.payout_mult = 10.0
        elif s1 == s2 == s3 == "💎":
            self.outcome_text = "**DIAMOND TRIPLE!** High Roller Payout (`5x Win`)!"
            self.base_xp = 300
            self.payout_mult = 5.0
        elif s1 == s2 == s3:
            self.outcome_text = f"**TRIPLE MATCH (`{s1}`)!** Classic Payout (`3x Win`)!"
            self.base_xp = 150
            self.payout_mult = 3.0
        elif s1 == s2 or s2 == s3 or s1 == s3:
            self.outcome_text = "**DOUBLE MATCH!** Small Payout (`1.5x Win`)!"
            self.base_xp = 50
            self.payout_mult = 1.5
        else:
            self.outcome_text = "**NO MATCH!** Better luck on the next spin!"
            self.base_xp = 0
            self.payout_mult = 0.0

class SlotsLayoutView(discord.ui.View):
    def __init__(self, session: SlotsSession, guild_id: int = 0):
        super().__init__(timeout=300)
        self.session = session
        self.guild_id = guild_id or session.guild_id
        self.closed = False

    def get_kwargs(self):
        if self.closed:
            from Embeds import get_command_embed
            return get_command_embed(
                self.guild_id, "slots", msg_type="closed",
                player=self.session.player
            )
            
        r1 = " | ".join(self.session.grid[0])
        r2 = " | ".join(self.session.grid[1])
        r3 = " | ".join(self.session.grid[2])

        reels_str = (
            f"  [ {r1} ]\n"
            f"> **[ {r2} ]** *(Center Payline)*\n"
            f"  [ {r3} ]"
        )

        btn_spin = discord.ui.Button(label=f"Spin Again ({self.session.bet_amount:,})", style=discord.ButtonStyle.primary)
        btn_exit = discord.ui.Button(label="Exit Machine", style=discord.ButtonStyle.secondary)

        async def _spin_cb(interaction: discord.Interaction):
            if interaction.user.id != self.session.player.id:
                return await interaction.response.send_message("This is not your slot machine! Use `/slots` to spin your own.", ephemeral=True)
            
            await interaction.response.defer()
            gid = interaction.guild_id or self.guild_id
            cfg = load_economy_config(gid)
            sym = cfg.get("currency_symbol", "🪙")
            bet = self.session.bet_amount

            bal = get_user_balance(gid, interaction.user.id)
            if bal < bet:
                return await interaction.followup.send(f"You don't have enough money for this bet! Balance: **{sym} {bal:,}**")

            remove_user_balance(gid, interaction.user.id, bet)
            self.session = SlotsSession(self.session.player, bet_amount=self.session.bet_amount, guild_id=self.guild_id)
            self.session.spin()

            payout = int(bet * self.session.payout_mult)
            if payout > 0:
                add_user_balance(gid, interaction.user.id, payout)

            if payout > bet:
                profit = payout - bet
                self.session.outcome_text += f"\n💰 **Won:** {sym} {payout:,} *(Net: +{sym} {profit:,})*"
            elif payout == bet:
                self.session.outcome_text += f"\n💰 **Returned:** {sym} {payout:,}"
            else:
                self.session.outcome_text += f"\n💸 **Lost:** {sym} {bet:,}"

            if self.session.base_xp > 0 and interaction.guild and interaction.user:
                from Commands.Level._storage import grant_minigame_xp
                xp_earned = await grant_minigame_xp(interaction.guild, interaction.user, interaction.channel, self.session.base_xp)
                if xp_earned > 0:
                    self.session.outcome_text += f" *(✨ +{xp_earned} XP)*"

            await interaction.edit_original_response(**self.get_kwargs())

        async def _exit_cb(interaction: discord.Interaction):
            if interaction.user.id != self.session.player.id:
                return await interaction.response.send_message("This slot machine belongs to someone else! Use `/slots` to spin your own machine.", ephemeral=True)
            self.closed = True
            await interaction.response.edit_message(**self.get_kwargs())

        btn_spin.callback = _spin_cb
        btn_exit.callback = _exit_cb
        
        components = [btn_spin, btn_exit]
        
        from Embeds import get_command_embed
        return get_command_embed(
            self.guild_id, "slots", msg_type="game",
            player=self.session.player, reels_str=reels_str,
            outcome_text=self.session.outcome_text, components=components
        )

class SlotsCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="slots", description="Bet money and spin the interactive V2 Casino Slot Machine (`/slots <bet>`).")
    @app_commands.describe(bet="Amount of money to bet (e.g. 50)")
    async def slots_cmd(self, ctx: commands.Context, bet: int = 10):
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

        session = SlotsSession(ctx.author, bet_amount=bet, guild_id=ctx.guild.id)
        session.spin()

        payout = int(bet * session.payout_mult)
        if payout > 0:
            add_user_balance(ctx.guild.id, ctx.author.id, payout)

        if payout > bet:
            profit = payout - bet
            session.outcome_text += f"\n💰 **Won:** {sym} {payout:,} *(Net: +{sym} {profit:,})*"
        elif payout == bet:
            session.outcome_text += f"\n💰 **Returned:** {sym} {payout:,}"
        else:
            session.outcome_text += f"\n💸 **Lost:** {sym} {bet:,}"

        if session.base_xp > 0 and ctx.guild and ctx.author:
            from Commands.Level._storage import grant_minigame_xp
            xp_earned = await grant_minigame_xp(ctx.guild, ctx.author, ctx.channel, session.base_xp)
            if xp_earned > 0:
                session.outcome_text += f" *(✨ +{xp_earned} XP)*"

        view = SlotsLayoutView(session, guild_id=ctx.guild.id)
        await ctx.send(**view.get_kwargs(), allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    await bot.add_cog(SlotsCommand(bot))


