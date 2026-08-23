import discord
from discord.ext import commands

class AnalyticsCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="analytics", aliases=["botstats"], hidden=True)
    async def analytics_cmd(self, ctx: commands.Context):
        if not await self.bot.is_owner(ctx.author):
            return await ctx.send(embed=discord.Embed(description="You must be the bot owner to use this command.", color=discord.Color.red()))
            
        try:
            from Components.Commands.OwnerOnly._monitor import get_system_metrics
            try:
                metrics = get_system_metrics(self.bot)
            except Exception as e:
                import traceback
                tb = traceback.format_exc()
                return await ctx.send(embed=discord.Embed(title="Metrics Error", description=f"```py\n{tb[:2000]}\n```", color=discord.Color.red()))
            
            embed = discord.Embed(title="Orbit Global Analytics", color=0x2B2D31)
            embed.add_field(name="Total Commands Run", value=f"`{metrics['commands']:,}`", inline=True)
            embed.add_field(name="Total Messages Seen", value=f"`{metrics['messages']:,}`", inline=True)
            embed.add_field(name="Error Count", value=f"`{metrics['error_count']}`", inline=True)
            
            embed.add_field(name="Servers", value=f"`{metrics['guilds']:,}`", inline=True)
            embed.add_field(name="Users", value=f"`{metrics['members']:,}`", inline=True)
            embed.add_field(name="Ping", value=f"`{metrics['ping_ms']}ms`", inline=True)
            
            embed.add_field(name="Cache Hits", value=f"`{metrics['cache_hits']:,}`", inline=True)
            embed.add_field(name="Cache Misses", value=f"`{metrics['cache_misses']:,}`", inline=True)
            embed.add_field(name="Hit Rate", value=f"`{metrics['cache_hit_rate']}%`", inline=True)
            
            embed.set_footer(text=f"Uptime: {metrics['uptime']}")
            await ctx.send(embed=embed)
        except Exception as e:
            import traceback
            tb = traceback.format_exc()
            await ctx.send(embed=discord.Embed(title="Command Error", description=f"```py\n{tb[:2000]}\n```", color=discord.Color.red()))

async def setup(bot: commands.Bot):
    await bot.add_cog(AnalyticsCommand(bot))
