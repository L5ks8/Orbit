import discord
from discord.ext import commands
from .poll import PollCommand
from .fastpoll import FastPollCommand
from .pollclose import PollCloseCommand

async def setup(bot: commands.Bot):
    await bot.add_cog(PollCommand(bot))
    await bot.add_cog(FastPollCommand(bot))
    await bot.add_cog(PollCloseCommand(bot))
