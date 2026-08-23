import discord
from discord.ext import commands

class ClearCacheCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="clearcache", hidden=True)
    @commands.is_owner()
    async def clear_cache(self, ctx: commands.Context):
        try:
            import bot
            bot.PREFIX_CACHE.clear()
            cleared = "Prefix Cache"
        except Exception as e:
            cleared = f"Failed to clear cache: {e}"
        embed = discord.Embed(description=f"**Caches Cleared:**\n- {cleared}", color=0x2B2D31)
        await ctx.send(embed=embed)

async def setup(bot: commands.Bot):
    await bot.add_cog(ClearCacheCommand(bot))
