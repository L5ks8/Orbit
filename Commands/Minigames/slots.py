import random
import discord
from discord.ext import commands


SYMBOLS = ["🍒", "🍋", "🍉", "🍇", "🔔", "💎", "7️⃣"]

class SlotsSession:
    def __init__(self, player: discord.abc.User):
        self.player = player
        self.grid = []
        self.outcome_text = ""
        self.spin()

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
        elif s1 == s2 == s3 == "💎":
            self.outcome_text = "**DIAMOND TRIPLE!** High Roller Payout (`5x Win`)!"
        elif s1 == s2 == s3:
            self.outcome_text = f"**TRIPLE MATCH (`{s1}`)!** Classic Payout (`3x Win`)!"
        elif s1 == s2 or s2 == s3 or s1 == s3:
            self.outcome_text = "**DOUBLE MATCH!** Small Payout (`1.5x Win`)!"
        else:
            self.outcome_text = "**NO MATCH!** Better luck on the next spin!"

class SlotsLayoutView(discord.ui.View):
    def __init__(self, session: SlotsSession):
        super().__init__(timeout=300)
        self.session = session
        self.closed = False

    def get_kwargs(self):
        if self.closed:
            from Embeds import get_command_embed
            return get_command_embed(
                0, "slots", msg_type="closed",
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

        btn_spin = discord.ui.Button(label="Spin Again", style=discord.ButtonStyle.primary)
        btn_exit = discord.ui.Button(label="Exit Machine", style=discord.ButtonStyle.secondary)

        async def _spin_cb(interaction: discord.Interaction):
            if interaction.user.id != self.session.player.id:
                return await interaction.response.send_message("This slot machine belongs to someone else! Use `/slots` to spin your own machine.", ephemeral=True)
            self.session.spin()
            await interaction.response.edit_message(**self.get_kwargs())

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
            0, "slots", msg_type="game",
            player=self.session.player, reels_str=reels_str,
            outcome_text=self.session.outcome_text, components=components
        )

class SlotsCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="slots", description="Spin the interactive V2 Casino Slot Machine (`/slots`).")
    async def slots_cmd(self, ctx: commands.Context):
        session = SlotsSession(ctx.author)
        view = SlotsLayoutView(session)
        await ctx.send(**view.get_kwargs(), allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    await bot.add_cog(SlotsCommand(bot))

