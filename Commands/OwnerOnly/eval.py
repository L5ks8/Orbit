import io
import textwrap
import traceback
import contextlib
import typing
import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button

class EvalOutputLayout(LayoutView):
    def __init__(self, code_snippet: str, output: str, success: bool):
        super().__init__()
        status = "Success" if success else "Runtime Error"
        
        display_code = code_snippet if len(code_snippet) <= 300 else code_snippet[:300] + "..."
        display_out = output if len(output) <= 1200 else output[:1200] + "\n... (truncated)"
        if not display_out.strip():
            display_out = "(No output returned)"

        self.container = Container(
            TextDisplay(content=f"### Orbit Live Eval (`{status}`)"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Input:**\n```py\n{display_code}\n```\n**Output:**\n```py\n{display_out}\n```")
        )
        self.add_item(self.container)

        btn_close = Button(label="Close Eval", style=discord.ButtonStyle.secondary)

        async def _close_cb(interaction: discord.Interaction):
            try:
                await interaction.message.delete()
            except Exception:
                pass

        btn_close.callback = _close_cb
        self.add_item(ActionRow(btn_close))

class EvalCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self._last_result = None

    def _cleanup_code(self, content: str) -> str:
        if content.startswith("```") and content.endswith("```"):
            lines = content.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            return "\n".join(lines)
        return content.strip("` \n")

    @commands.command(name="eval", description="Owner Only: Evaluates Python code block.")
    @commands.is_owner()
    async def eval_cmd(self, ctx: commands.Context, *, body: str):
        cleaned_body = self._cleanup_code(body)
        env: dict[str, typing.Any] = {
            "bot": self.bot,
            "ctx": ctx,
            "channel": ctx.channel,
            "author": ctx.author,
            "guild": ctx.guild,
            "message": ctx.message,
            "_": self._last_result
        }

        wrapped = f"async def __eval_func():\n{textwrap.indent(cleaned_body, '    ')}"
        stdout = io.StringIO()

        try:
            exec(wrapped, env)
        except Exception as e:
            view = EvalOutputLayout(cleaned_body, traceback.format_exc(), False)
            return await ctx.send(view=view)

        func = typing.cast(typing.Callable[[], typing.Coroutine[typing.Any, typing.Any, typing.Any]], env["__eval_func"])
        try:
            with contextlib.redirect_stdout(stdout):
                ret = await func()
        except Exception as e:
            value = stdout.getvalue()
            out_str = f"{value}{traceback.format_exc()}"
            view = EvalOutputLayout(cleaned_body, out_str, False)
            return await ctx.send(view=view)

        value = stdout.getvalue()
        if ret is None:
            if value:
                self._last_result = value
                view = EvalOutputLayout(cleaned_body, value, True)
                await ctx.send(view=view)
            else:
                view = EvalOutputLayout(cleaned_body, "None", True)
                await ctx.send(view=view)
        else:
            self._last_result = ret
            out_str = f"{value}{ret}"
            view = EvalOutputLayout(cleaned_body, out_str, True)
            await ctx.send(view=view)

    @eval_cmd.error
    async def eval_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.NotOwner):
            pass
        else:
            await ctx.send(f"Eval syntax error: {error}")

async def setup(bot: commands.Bot):
    await bot.add_cog(EvalCommand(bot))

