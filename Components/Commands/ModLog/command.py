import discord
from discord.ext import commands
from .modlog import ModLogCommand

async def setup(bot: commands.Bot):
    await bot.add_cog(ModLogCommand(bot))
