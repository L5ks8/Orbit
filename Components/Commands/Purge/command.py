import discord
from discord.ext import commands
from .purge import PurgeCog

async def setup(bot: commands.Bot):
    await bot.add_cog(PurgeCog(bot))
