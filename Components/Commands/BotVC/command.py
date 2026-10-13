import discord
from discord.ext import commands
from .botvc import BotVCCommand

async def setup(bot: commands.Bot):
    await bot.add_cog(BotVCCommand(bot))
