import discord
from discord.ext import commands
from .blacklistlistener import BlacklistListener

async def setup(bot: commands.Bot):
    await bot.add_cog(BlacklistListener(bot))
