utf-8import os
import io
import json
import asyncio
import textwrap
import traceback
import contextlib
import typing
import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button, Modal, TextInput
from Commands.OwnerOnly._monitor import record_command

class ConsoleEvalModal(Modal, title="Interactive Python Console"):
    code_input = TextInput(
        label="Async Python Code / Command",
        style=discord.TextStyle.paragraph,
        placeholder="print('Hello Orbit')\nreturn len(bot.guilds)",
        required=True,
        max_length=2000
    )

    def __init__(self, bot: commands.Bot):
        super().__init__()
        self.bot = bot

    def _cleanup_code(self, content: str) -> str:
        if content.startswith("```") and content.endswith("```"):
            lines = content.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            return "\n".join(lines)
        return content.strip("` \n")

    async def on_submit(self, interaction: discord.Interaction):
        await interaction.response.defer(ephemeral=True)
        cleaned_body = self._cleanup_code(self.code_input.value)

        env: dict[str, typing.Any] = {
            "bot": self.bot,
            "interaction": interaction,
            "guild": interaction.guild,
            "channel": interaction.channel,
            "author": interaction.user,
            "discord": discord,
            "commands": commands,
            "os": os,
            "json": json,
            "asyncio": asyncio,
            "__import__": __import__
        }

        wrapped = f"async def __eval_func():\n{textwrap.indent(cleaned_body, '    ')}"
        stdout = io.StringIO()

        try:
            exec(wrapped, env)
            func = typing.cast(typing.Callable[[], typing.Coroutine[typing.Any, typing.Any, typing.Any]], env["__eval_func"])
            with contextlib.redirect_stdout(stdout):
                ret = await func()
        except Exception:
            out_str = f"{stdout.getvalue()}\n{traceback.format_exc()}"
            status = "Runtime Error"
        else:
            value = stdout.getvalue()
            if ret is None:
                out_str = value if value else "(No output returned)"
            else:
                out_str = f"{value}\nReturn Value -> {ret}"
            status = "Success"

        display_code = cleaned_body[:400]
        display_out = out_str[:1300]

        result_view = LayoutView(timeout=300)
        result_view.add_item(Container(
            TextDisplay(content=f"### Console Execution (`{status}`)"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Executed Code:**\n```python\n{display_code}\n```\n**Output:**\n```python\n{display_out}\n```")
        ))

        btn_close_res = Button(label="Close Result", style=discord.ButtonStyle.secondary)

        async def _close_res_cb(inter: discord.Interaction):
            try:
                await inter.message.delete()
            except Exception:
                pass

        btn_close_res.callback = _close_res_cb
        result_view.add_item(ActionRow(btn_close_res))

        try:
            await interaction.followup.send(view=result_view, ephemeral=True)
        except Exception:
            pass

class ConsoleLayoutView(LayoutView):
    def __init__(self, bot: commands.Bot, owner: discord.abc.User):
        super().__init__(timeout=None)
        self.bot = bot

        header_str = f"### Orbit Live Interactive Python Console\n**Authorized Developer:** {owner.mention}"
        content_str = (
            "Execute live async Python snippets, inspect internal bot state, sync slash commands, or modify database items directly in the live runtime.\n\n"
            "Click the **Launch Interactive Terminal** button below to open the modal terminal input window!"
        )

        btn_term = Button(label="Launch Interactive Terminal", style=discord.ButtonStyle.primary)
        btn_close = Button(label="Close Console", style=discord.ButtonStyle.secondary)

        async def _term_cb(interaction: discord.Interaction):
            modal = ConsoleEvalModal(self.bot)
            await interaction.response.send_modal(modal)

        async def _close_cb(interaction: discord.Interaction):
            try:
                await interaction.message.delete()
            except Exception:
                pass

        btn_term.callback = _term_cb
        btn_close.callback = _close_cb

        self.container = Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=content_str)
        )
        self.add_item(self.container)
        self.add_item(ActionRow(btn_term, btn_close))

class ConsoleCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="console", hidden=True)
    @commands.is_owner()
    async def console_cmd(self, ctx: commands.Context):
        record_command("console", str(ctx.author))
        if ctx.guild is not None:
            try:
                await ctx.message.delete()
            except Exception:
                pass
        view = ConsoleLayoutView(self.bot, ctx.author)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

    @console_cmd.error
    async def console_error(self, ctx: commands.Context, error):
        pass

async def setup(bot: commands.Bot):
    await bot.add_cog(ConsoleCommand(bot))
