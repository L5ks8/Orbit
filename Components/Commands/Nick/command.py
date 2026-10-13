import discord
from discord.ext import commands
from .nick import NickCommand

async def setup(bot: commands.Bot):
    await bot.add_cog(NickCommand(bot))
