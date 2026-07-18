import random
import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button

SYMBOLS = ["ðŸ’", "ðŸ‹", "ðŸŠ", "ðŸ‡", "ðŸ””", "ðŸ’Ž", "7ï¸âƒ£"]

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

        if s1 == s2 == s3 == "7ï¸âƒ£":
            self.outcome_text = "**JACKPOT 777!** Mega Casino Payout (`10x Win`)!"
        elif s1 == s2 == s3 == "ðŸ’Ž":
            self.outcome_text = "**DIAMOND TRIPLE!** High Roller Payout (`5x Win`)!"
        elif s1 == s2 == s3:
            self.outcome_text = f"**TRIPLE MATCH (`{s1}`)!** Classic Payout (`3x Win`)!"
        elif s1 == s2 or s2 == s3 or s1 == s3:
            self.outcome_text = "**DOUBLE MATCH!** Small Payout (`1.5x Win`)!"
        else:
            self.outcome_text = "**NO MATCH!** Better luck on the next spin!"

class SlotsLayoutView(LayoutView):
    def __init__(self, session: SlotsSession):
        super().__init__(timeout=300)
        self.session = session
        self.build_ui()

    def build_ui(self):
        self.clear_items()
        r1 = " | ".join(self.session.grid[0])
        r2 = " | ".join(self.session.grid[1])
        r3 = " | ".join(self.session.grid[2])

        reels_str = (
            f"  [ {r1} ]\n"
            f"> **[ {r2} ]** *(Center Payline)*\n"
            f"  [ {r3} ]"
        )

        self.container = Container(
            TextDisplay(content=f"### Orbit V2 Casino: Slot Machine\n**Player:** {self.session.player.mention}"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Machine Reels:**\n{reels_str}"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"### {self.session.outcome_text}")
        )
        self.add_item(self.container)

        btn_spin = Button(label="Spin Again", style=discord.ButtonStyle.primary)
        btn_exit = Button(label="Exit Machine", style=discord.ButtonStyle.secondary)

        async def _spin_cb(interaction: discord.Interaction):
            if interaction.user.id != self.session.player.id:
                return await interaction.response.send_message("This slot machine belongs to someone else! Use `/slots` to spin your own machine.", ephemeral=True)
            self.session.spin()
            self.build_ui()
            await interaction.response.edit_message(view=self)

        async def _exit_cb(interaction: discord.Interaction):
            if interaction.user.id != self.session.player.id:
                return await interaction.response.send_message("This slot machine belongs to someone else! Use `/slots` to spin your own machine.", ephemeral=True)
            self.clear_items()
            self.container = Container(
                TextDisplay(content=f"### Orbit V2 Casino: Slot Machine\n**Player:** {self.session.player.mention}"),
                Separator(spacing=discord.SeparatorSpacing.small),
                TextDisplay(content="**Thanks for playing at the Orbit V2 Casino!** Machine closed.")
            )
            self.add_item(self.container)
            await interaction.response.edit_message(view=self)

        btn_spin.callback = _spin_cb
        btn_exit.callback = _exit_cb
        self.add_item(ActionRow(btn_spin, btn_exit))

class SlotsCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="slots", description="Spin the interactive V2 Casino Slot Machine (`/slots`).")
    async def slots_cmd(self, ctx: commands.Context):
        session = SlotsSession(ctx.author)
        view = SlotsLayoutView(session)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    await bot.add_cog(SlotsCommand(bot))

