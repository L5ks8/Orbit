import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button
from Commands.OwnerOnly._monitor import get_live_logs, record_command

class LiveLogsLayoutView(LayoutView):
    def __init__(self, owner: discord.abc.User):
        super().__init__(timeout=None)
        logs = get_live_logs(20)
        logs_str = "\n".join(logs) if logs else "`[System]` Zero log events recorded yet."

        header_str = f"### Orbit Live System Event Stream\n**Authorized Developer:** {owner.mention}"
        self.container = Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=logs_str)
        )
        self.add_item(self.container)

        btn_close = Button(label="Close Logs View", style=discord.ButtonStyle.secondary)

        async def _close_cb(interaction: discord.Interaction):
            try:
                await interaction.message.delete()
            except Exception:
                pass

        btn_close.callback = _close_cb
        self.add_item(ActionRow(btn_close))


class LiveLogsCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="livelogs", hidden=True)
    @commands.is_owner()
    async def livelogs_cmd(self, ctx: commands.Context):
        record_command("livelogs", str(ctx.author))
        if ctx.guild is not None:
            try:
                await ctx.message.delete()
            except Exception:
                pass
        view = LiveLogsLayoutView(ctx.author)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

    @livelogs_cmd.error
    async def livelogs_error(self, ctx: commands.Context, error):
        pass


async def setup(bot: commands.Bot):
    await bot.add_cog(LiveLogsCommand(bot))
