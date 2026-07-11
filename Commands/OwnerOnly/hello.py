import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button
from Commands.OwnerOnly._monitor import record_command

class HelloLayoutView(LayoutView):
    def __init__(self, owner: discord.abc.User):
        super().__init__()
        self.container = Container(
            TextDisplay(content="### Orbit Owner Verification"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content="hallo")
        )
        self.add_item(self.container)

        btn_close = Button(label="Close Notice", style=discord.ButtonStyle.secondary)

        async def _close_cb(interaction: discord.Interaction):
            try:
                await interaction.message.delete()
            except Exception:
                pass

        btn_close.callback = _close_cb
        self.add_item(ActionRow(btn_close))


class HelloCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="hello", hidden=True)
    @commands.is_owner()
    async def hello_cmd(self, ctx: commands.Context):
        record_command("hello", str(ctx.author))
        if ctx.guild is not None:
            try:
                await ctx.message.delete()
            except Exception:
                pass
        view = HelloLayoutView(ctx.author)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

    @hello_cmd.error
    async def hello_error(self, ctx: commands.Context, error):
        pass


async def setup(bot: commands.Bot):
    await bot.add_cog(HelloCommand(bot))
