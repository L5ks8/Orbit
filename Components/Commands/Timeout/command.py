import discord
from discord.ext import commands
from .timeout import TimeoutCommand
from .untimeout import UntimeoutCommand

async def setup(bot: commands.Bot):
    await bot.add_cog(TimeoutCommand(bot))
    await bot.add_cog(UntimeoutCommand(bot))
