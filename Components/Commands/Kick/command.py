import discord
from discord.ext import commands
from .kick import KickCommand

async def setup(bot: commands.Bot):
    await bot.add_cog(KickCommand(bot))
