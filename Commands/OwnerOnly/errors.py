import discord
from discord.ext import commands
from discord.ui import View, Button
from Commands.OwnerOnly._monitor import get_error_log, clear_errors, record_command
from Commands._utils import make_embed

class ErrorsView(View):
    def __init__(self, owner: discord.abc.User):
        super().__init__(timeout=None)
        self.owner = owner
        self.build_ui()

    def get_embed(self) -> discord.Embed:
        errs = get_error_log()

        if not errs:
            err_text = "**Zero System Errors Caught!** All background tasks, command handlers, and storage loops are operating smoothly."
        else:
            lines = []
            for e in errs[:5]:
                clean_msg = str(e.get("message", ""))[:65]
                lines.append(f"`[{e.get('timestamp', '')}]` **[{e.get('source', '')}]** — `{clean_msg}`")
            err_text = f"**Caught Error Ring Buffer ({len(errs)} stored):**\n" + "\n".join(lines)
            
            latest_tb = errs[0].get("traceback", "")
            if latest_tb:
                err_text += f"\n\n**Latest Traceback ({errs[0].get('source', '')}):**\n```python\n{latest_tb[:450]}\n```"

            if len(err_text) > 3000:
                err_text = err_text[:3000] + "\n``` (truncated)"

        embed = discord.Embed(
            title="Orbit System Error Inspector",
            description=err_text,
            color=0x2B2D31
        )
        embed.set_footer(text=f"Authorized Developer: {self.owner}")
        return embed

    def build_ui(self):
        self.clear_items()
        errs = get_error_log()

        btn_clear = Button(label="Clear Error Buffer", style=discord.ButtonStyle.danger, disabled=not errs)
        btn_close = Button(label="Close Errors View", style=discord.ButtonStyle.secondary)

        async def _clear_cb(interaction: discord.Interaction):
            if interaction.user.id != self.owner.id:
                return await interaction.response.send_message(embed=make_embed("Not allowed.", discord.Color.red()), ephemeral=True)
            clear_errors()
            self.build_ui()
            await interaction.response.edit_message(embed=self.get_embed(), view=self)

        async def _close_cb(interaction: discord.Interaction):
            if interaction.user.id != self.owner.id:
                return await interaction.response.send_message(embed=make_embed("Not allowed.", discord.Color.red()), ephemeral=True)
            try:
                await interaction.message.delete()
            except Exception:
                pass

        btn_clear.callback = _clear_cb
        btn_close.callback = _close_cb
        
        self.add_item(btn_clear)
        self.add_item(btn_close)


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
        
        view = ErrorsView(ctx.author)
        await ctx.send(embed=view.get_embed(), view=view, allowed_mentions=discord.AllowedMentions.none())

    @errors_cmd.error
    async def errors_error(self, ctx: commands.Context, error):
        if not isinstance(error, commands.NotOwner):
            await ctx.send(embed=make_embed(f"Errors command failed: {error}", discord.Color.red()), allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    await bot.add_cog(ErrorsCommand(bot))