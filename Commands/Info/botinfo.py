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
        embed = discord.Embed(color=0x2B2D31)
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
        dashboard_url = "https://orbit-498b.onrender.com"
        support_url = "https://discord.gg/orbit"
        links = (
            f"[Dashboard]({dashboard_url})\n"
            f"[Support Server]({support_url})"
        )
        embed.add_field(name="Links", value=links, inline=True)
        shard_id = ctx.guild.shard_id if ctx.guild and hasattr(ctx.guild, 'shard_id') else 0
        cluster_id = 0 
        embed.set_footer(text=f"Cluster #{cluster_id} • Shard #{shard_id}")
        await ctx.send(embed=embed)
async def setup(bot: commands.Bot):
    await bot.add_cog(BotInfoCommand(bot))