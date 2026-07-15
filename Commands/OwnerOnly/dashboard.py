import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button
from Commands.OwnerOnly._monitor import get_system_metrics, record_command

class DashboardLayoutView(LayoutView):
    def __init__(self, bot: commands.Bot, owner: discord.abc.User):
        super().__init__(timeout=None)
        metrics = get_system_metrics(bot)

        header_str = f"### Orbit High-Speed Performance & Cache Dashboard\n**Authorized Developer:** {owner.mention} | **RAM Hit Rate:** `{metrics['cache_hit_rate']}%`"
        content_str = (
            f"**In-Memory RAM Cache Statistics:**\n"
            f"> **Cache Hits (Zero Disk Read):** `{metrics['cache_hits']}`\n"
            f"> **Cache Misses (First Disk Read):** `{metrics['cache_misses']}`\n"
            f"> **Cache Writes (Synchronized Save):** `{metrics['cache_writes']}`\n\n"
            f"**Message & Command Throughput:**\n"
            f"> **Total Messages Processed:** `{metrics['messages']}`\n"
            f"> **Total Commands Executed:** `{metrics['commands']}`\n\n"
            f"**Asyncio & OS Concurrency:**\n"
            f"> **Active Asyncio Tasks:** `{metrics['asyncio_tasks']}`\n"
            f"> **Active OS Python Threads:** `{metrics['threads']}`\n"
            f"> **Connected Cluster Shards:** `{metrics['shards']}` (`{metrics['ping_ms']} ms avg`)"
        )

        self.container = Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=content_str)
        )
        self.add_item(self.container)

        btn_close = Button(label="Close Dashboard", style=discord.ButtonStyle.secondary)

        async def _close_cb(interaction: discord.Interaction):
            try:
                await interaction.message.delete()
            except Exception:
                pass

        btn_close.callback = _close_cb
        self.add_item(ActionRow(btn_close))


class DashboardCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="dashboard", hidden=True)
    @commands.is_owner()
    async def dashboard_cmd(self, ctx: commands.Context):
        record_command("dashboard", str(ctx.author))
        if ctx.guild is not None:
            try:
                await ctx.message.delete()
            except Exception:
                pass
        view = DashboardLayoutView(self.bot, ctx.author)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

    @dashboard_cmd.error
    async def dashboard_error(self, ctx: commands.Context, error):
        pass


async def setup(bot: commands.Bot):
    await bot.add_cog(DashboardCommand(bot))
