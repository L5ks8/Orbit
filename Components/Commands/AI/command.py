import discord
from discord.ext import commands
from .ask import AskVoice

async def setup(bot: commands.Bot):
    await bot.add_cog(AskVoice(bot))
