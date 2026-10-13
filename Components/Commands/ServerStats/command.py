import discord
from discord.ext import commands
from .serverstats import ServerStats

async def setup(bot: commands.Bot):
    await bot.add_cog(ServerStats(bot))
