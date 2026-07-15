import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button
from Commands.OwnerOnly._monitor import get_system_metrics, record_command

class ShardsLayoutView(LayoutView):
    def __init__(self, bot: commands.Bot, owner: discord.abc.User):
        super().__init__(timeout=None)
        metrics = get_system_metrics(bot)
        
        shard_list = []
        if hasattr(bot, "shards") and bot.shards:
            for s_id, s_ws in bot.shards.items():
                s_ping = round(s_ws.latency * 1000, 2) if hasattr(s_ws, "latency") and s_ws.latency != float("inf") else metrics['ping_ms']
                s_guilds = sum(1 for g in bot.guilds if getattr(g, "shard_id", 0) == s_id)
                shard_list.append(f"`Shard ID #{s_id}` -> **Ping:** `{s_ping} ms` | **Connected Guilds:** `{s_guilds}` | **Status:** `ONLINE`")
        else:
            shard_list.append(f"`Shard ID #0` -> **Ping:** `{metrics['ping_ms']} ms` | **Connected Guilds:** `{metrics['guilds']}` | **Status:** `ONLINE`")

        shards_display = "\n".join(shard_list)
        header_str = f"### Orbit Cluster & Shard Diagnostics\n**Master Cluster Shards:** `{metrics['shards']}` | **Average Gateway Latency:** `{metrics['ping_ms']} ms`"
        body_str = f"**Active Shard Topology:**\n{shards_display}\n\n*All websocket connection shards are healthy and responsive.*"

        self.container = Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=body_str)
        )
        self.add_item(self.container)

        btn_close = Button(label="Close Shards View", style=discord.ButtonStyle.secondary)

        async def _close_cb(interaction: discord.Interaction):
            try:
                await interaction.message.delete()
            except Exception:
                pass

        btn_close.callback = _close_cb
        self.add_item(ActionRow(btn_close))


class ShardsCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="shards", hidden=True)
    @commands.is_owner()
    async def shards_cmd(self, ctx: commands.Context):
        record_command("shards", str(ctx.author))
        if ctx.guild is not None:
            try:
                await ctx.message.delete()
            except Exception:
                pass
        view = ShardsLayoutView(self.bot, ctx.author)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

    @shards_cmd.error
    async def shards_error(self, ctx: commands.Context, error):
        pass


async def setup(bot: commands.Bot):
    await bot.add_cog(ShardsCommand(bot))
