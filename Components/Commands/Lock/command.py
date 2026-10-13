import discord
from discord.ext import commands
from .lock import LockCommand
from .unlock import UnlockCommand

async def setup(bot: commands.Bot):
    await bot.add_cog(LockCommand(bot))
    await bot.add_cog(UnlockCommand(bot))
