import discord
from discord.ext import commands

class PingListener(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

async def setup(bot: commands.Bot):
    await bot.add_cog(PingListener(bot))
