import discord
from discord.ext import commands
from .statstracker import StatsTracker

async def setup(bot: commands.Bot):
    await bot.add_cog(StatsTracker(bot))
