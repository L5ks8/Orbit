import discord
from discord.ext import commands
from .ping import PingCommand

async def setup(bot: commands.Bot):
    await bot.add_cog(PingCommand(bot))
