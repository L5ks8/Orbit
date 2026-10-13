import discord
from discord.ext import commands
from .autoresponder import AutoResponderCog

async def setup(bot: commands.Bot):
    await bot.add_cog(AutoResponderCog(bot))
