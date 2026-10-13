import discord
from discord.ext import commands
from .whitelist import WhitelistCommand
from .remove import UnwhitelistCommand
from .view import CheckWhitelistCommand

async def setup(bot: commands.Bot):
    await bot.add_cog(WhitelistCommand(bot))
    await bot.add_cog(UnwhitelistCommand(bot))
    await bot.add_cog(CheckWhitelistCommand(bot))
