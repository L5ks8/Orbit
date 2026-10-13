import discord
from discord.ext import commands
from .mute import MuteCommand
from .unmute import UnmuteCommand

async def setup(bot: commands.Bot):
    await bot.add_cog(MuteCommand(bot))
    await bot.add_cog(UnmuteCommand(bot))
