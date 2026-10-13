import discord
from discord.ext import commands
from .warn import WarnCommand
from .checkwarns import CheckWarnsCog
from .clearwarns import ClearWarnsCog
from .remove import DelWarnCog

async def setup(bot: commands.Bot):
    await bot.add_cog(WarnCommand(bot))
    await bot.add_cog(CheckWarnsCog(bot))
    await bot.add_cog(ClearWarnsCog(bot))
    await bot.add_cog(DelWarnCog(bot))
