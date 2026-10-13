import discord
from discord.ext import commands
from .say import SayCommand

async def setup(bot: commands.Bot):
    await bot.add_cog(SayCommand(bot))
