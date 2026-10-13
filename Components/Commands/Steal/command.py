import discord
from discord.ext import commands
from .steal import StealCog

async def setup(bot: commands.Bot):
    await bot.add_cog(StealCog(bot))
