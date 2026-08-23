import os
import io
import json
import asyncio
import textwrap
import traceback
import contextlib
import typing
import discord
from discord.ext import commands
from discord.ui import View, Button, Modal, TextInput
from Components.Commands.OwnerOnly._monitor import record_command
from Components.Commands._utils import make_embed

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
        ret = None

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

        result_embed = discord.Embed(
            title=f"Console Execution (`{status}`)",
            description=f"**Executed Code:**\n```python\n{display_code}\n```\n**Output:**\n```python\n{display_out}\n```",
            color=0x2B2D31
        )

        result_view = View(timeout=300)
        btn_close_res = Button(label="Close Result", style=discord.ButtonStyle.secondary)

        async def _close_res_cb(inter: discord.Interaction):
            try:
                await inter.message.delete()
            except Exception:
                pass

        btn_close_res.callback = _close_res_cb
        result_view.add_item(btn_close_res)

        try:
            await interaction.followup.send(embed=result_embed, view=result_view, ephemeral=True)
        except Exception:
            pass

class ConsoleView(View):
    def __init__(self, bot: commands.Bot, owner: discord.abc.User):
        super().__init__(timeout=None)
        self.bot = bot

        btn_term = Button(label="Launch Interactive Terminal", style=discord.ButtonStyle.primary)
        btn_close = Button(label="Close Console", style=discord.ButtonStyle.secondary)

        async def _term_cb(interaction: discord.Interaction):
            if interaction.user.id != owner.id:
                return await interaction.response.send_message(embed=make_embed("Not allowed.", discord.Color.red()), ephemeral=True)
            modal = ConsoleEvalModal(self.bot)
            await interaction.response.send_modal(modal)

        async def _close_cb(interaction: discord.Interaction):
            if interaction.user.id != owner.id:
                return await interaction.response.send_message(embed=make_embed("Not allowed.", discord.Color.red()), ephemeral=True)
            try:
                await interaction.message.delete()
            except Exception:
                pass

        btn_term.callback = _term_cb
        btn_close.callback = _close_cb

        self.add_item(btn_term)
        self.add_item(btn_close)

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
                
        embed = discord.Embed(
            title="Orbit Live Interactive Python Console",
            description=(
                "Execute live async Python snippets, inspect internal bot state, sync slash commands, or modify database items directly in the live runtime.\n\n"
                "Click the **Launch Interactive Terminal** button below to open the modal terminal input window!"
            ),
            color=0x2B2D31
        )
        embed.set_footer(text=f"Authorized Developer: {ctx.author}")
        
        view = ConsoleView(self.bot, ctx.author)
        await ctx.send(embed=embed, view=view, allowed_mentions=discord.AllowedMentions.none())

    @console_cmd.error
    async def console_error(self, ctx: commands.Context, error):
        if not isinstance(error, commands.NotOwner):
            await ctx.send(embed=make_embed(f"Console error: {error}", discord.Color.red()), allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    await bot.add_cog(ConsoleCommand(bot))