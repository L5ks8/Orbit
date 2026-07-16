import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button
from Commands.OwnerOnly._monitor import get_system_metrics, record_command

class MonitorLayoutView(LayoutView):
    def __init__(self, bot: commands.Bot, owner: discord.abc.User):
        super().__init__(timeout=None)
        metrics = get_system_metrics(bot)

        header_str = f"### Orbit RAM & CPU Hardware Monitor\n**Uptime:** `{metrics['uptime']}` | **Operating System:** `{metrics['os_name']}`"
        content_str = (
            f"**Memory Allocation:**\n"
            f"> **Process RAM Usage:** `{metrics['ram_mb']} MB`\n"
            f"> **Total OS Virtual RAM:** `{metrics['total_ram_gb']} GB`\n\n"
            f"**Processor Load:**\n"
            f"> **Orbit Process CPU:** `{metrics['cpu_pct']}%`\n"
            f"> **System Overall CPU:** `{metrics['sys_cpu_pct']}%`\n\n"
            f"**Runtime Specs:**\n"
            f"> **Python Version:** `v{metrics['py_ver']}` | **Discord.py Version:** `v{metrics['dpy_ver']}`\n"
            f"> **Active OS Threads:** `{metrics['threads']}` | **Asyncio Tasks:** `{metrics['asyncio_tasks']}`"
        )

        self.container = Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=content_str)
        )
        self.add_item(self.container)

        btn_close = Button(label="Close Monitor View", style=discord.ButtonStyle.secondary)

        async def _close_cb(interaction: discord.Interaction):
            try:
                await interaction.message.delete()
            except Exception:
                pass

        btn_close.callback = _close_cb
        self.add_item(ActionRow(btn_close))


class MonitorCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="monitor", hidden=True)
    @commands.is_owner()
    async def monitor_cmd(self, ctx: commands.Context):
        record_command("monitor", str(ctx.author))
        if ctx.guild is not None:
            try:
                await ctx.message.delete()
            except Exception:
                pass
        view = MonitorLayoutView(self.bot, ctx.author)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

    @monitor_cmd.error
    async def monitor_error(self, ctx: commands.Context, error):
        pass


async def setup(bot: commands.Bot):
    await bot.add_cog(MonitorCommand(bot))
