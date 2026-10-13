import discord
from discord.ext import commands
from .blacklist import BlacklistCommand
from .remove import UnblacklistCommand
from .view import BlacklistListCog

async def setup(bot: commands.Bot):
    await bot.add_cog(BlacklistCommand(bot))
    await bot.add_cog(UnblacklistCommand(bot))
    await bot.add_cog(BlacklistListCog(bot))
