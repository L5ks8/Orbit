import discord
from discord.ext import commands
from .dm import DMCommand

async def setup(bot: commands.Bot):
    await bot.add_cog(DMCommand(bot))
