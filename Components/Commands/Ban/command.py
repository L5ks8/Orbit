import discord
from discord.ext import commands
from .ban import BanCommand
from .checkban import CheckBanCommand
from .massban import MassBanCog
from .softban import SoftbanCommand
from .tempban import TempBanCog
from .unban import UnbanCommand

async def setup(bot: commands.Bot):
    await bot.add_cog(BanCommand(bot))
    await bot.add_cog(CheckBanCommand(bot))
    await bot.add_cog(MassBanCog(bot))
    await bot.add_cog(SoftbanCommand(bot))
    await bot.add_cog(TempBanCog(bot))
    await bot.add_cog(UnbanCommand(bot))
