import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button
from Commands.OwnerOnly._monitor import get_error_log, clear_errors, record_command

class ErrorsLayoutView(LayoutView):
    def __init__(self, owner: discord.abc.User):
        super().__init__(timeout=None)
        self.owner = owner
        self.build_ui()

    def build_ui(self):
        self.clear_items()
        errs = get_error_log()

        if not errs:
            err_text = "**Zero System Errors Caught!** All background tasks, command handlers, and storage loops are operating smoothly."
        else:
            lines = []
            for e in errs[:8]:
                lines.append(f"`[{e['timestamp']}]` **[{e['source']}]** — `{e['message'][:90]}`")
            err_text = f"**Caught Error Ring Buffer ({len(errs)} stored):**\n" + "\n".join(lines)
            if errs[0].get("traceback"):
                err_text += f"\n\n**Latest Traceback Detail ({errs[0]['source']}):**\n```python\n{errs[0]['traceback'][:800]}\n```"

        self.container = Container(
            TextDisplay(content=f"### Orbit System Error Inspector\n**Authorized Developer:** {self.owner.mention}"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=err_text)
        )
        self.add_item(self.container)

        btn_clear = Button(label="Clear Error Buffer", style=discord.ButtonStyle.danger, disabled=not errs)
        btn_close = Button(label="Close Errors View", style=discord.ButtonStyle.secondary)

        async def _clear_cb(interaction: discord.Interaction):
            clear_errors()
            self.build_ui()
            await interaction.response.edit_message(view=self)

        async def _close_cb(interaction: discord.Interaction):
            try:
                await interaction.message.delete()
            except Exception:
                pass

        btn_clear.callback = _clear_cb
        btn_close.callback = _close_cb
        self.add_item(ActionRow(btn_clear, btn_close))


class ErrorsCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="errors", hidden=True)
    @commands.is_owner()
    async def errors_cmd(self, ctx: commands.Context):
        record_command("errors", str(ctx.author))
        if ctx.guild is not None:
            try:
                await ctx.message.delete()
            except Exception:
                pass
        view = ErrorsLayoutView(ctx.author)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

    @errors_cmd.error
    async def errors_error(self, ctx: commands.Context, error):
        pass


async def setup(bot: commands.Bot):
    await bot.add_cog(ErrorsCommand(bot))
