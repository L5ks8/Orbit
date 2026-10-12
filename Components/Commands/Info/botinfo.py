import discord
from discord.ext import commands
import time

class BotInfoCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        if not hasattr(bot, 'start_time'):
            bot.start_time = time.time()

    @commands.hybrid_command(name="botinfo", aliases=["bi"], description="Display information about the bot.")
    async def botinfo_cmd(self, ctx: commands.Context):
        servers = len(self.bot.guilds)
        users = sum(g.member_count for g in self.bot.guilds if g.member_count)
        uptime = int(self.bot.start_time)

        import os
        dashboard_url = os.environ.get("BASE_URL") or "https://orbitbot.xyz"
        support_url = "https://discord.gg/orbit"
        shard_id = ctx.guild.shard_id if ctx.guild and hasattr(ctx.guild, 'shard_id') else 0
        signature_color = discord.Color(0x5865F2)

        try:
            from discord.ui import LayoutView, Container, TextDisplay, ActionRow, Button
            view = LayoutView(timeout=120)
            body = (
                f"# 🪐 Orbit System Information\n\n"
                f"**Servers** `{servers:,}` · **Users** `{users:,}`\n\n"
                f"**Uptime** <t:{uptime}:R> (<t:{uptime}:f>)"
            )
            btn_dash = Button(label="Dashboard", style=discord.ButtonStyle.link, url=dashboard_url)
            btn_sup = Button(label="Support Server", style=discord.ButtonStyle.link, url=support_url)
            container = Container(
                TextDisplay(content=body),
                ActionRow(btn_dash, btn_sup),
                accent_color=signature_color
            )
            view.add_item(container)
            view.add_item(TextDisplay(content=f"-# Shard #{shard_id} • Cluster #0 • Powered by Orbit"))
            return await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())
        except Exception:
            pass

        embed = discord.Embed(color=signature_color)
        if self.bot.user:
            embed.set_author(name=self.bot.user.name, icon_url=self.bot.user.display_avatar.url)
        else:
            embed.set_author(name="Orbit")

        bot_info = (
            f"**Servers:** {servers:,}\n"
            f"**Users:** {users:,}\n"
            f"**Uptime:** <t:{uptime}:R>"
        )
        embed.add_field(name="Bot Information", value=bot_info, inline=True)
        links = (
            f"[Dashboard]({dashboard_url})\n"
            f"[Support Server]({support_url})"
        )
        embed.add_field(name="Links", value=links, inline=True)
        embed.set_footer(text=f"Cluster #0 • Shard #{shard_id}")
        await ctx.send(embed=embed)

async def setup(bot: commands.Bot):
    await bot.add_cog(BotInfoCommand(bot))
