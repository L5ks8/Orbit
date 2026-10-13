import discord
from discord.ext import commands
from .voice import voice_group
from .ban import VcBanCommand
from .limit import VcLimitCommand
from .lock import VcLockCommand
from .massmove import MassMoveCog
from .move import MoveCommand
from .mute import VcMuteCommand
from .unban import VcUnbanCommand
from .unlock import VcUnlockCommand
from .unmute import VcUnmuteCommand

async def setup(bot: commands.Bot):
    bot.tree.add_command(voice_group)
    await bot.add_cog(VcBanCommand(bot))
    await bot.add_cog(VcLimitCommand(bot))
    await bot.add_cog(VcLockCommand(bot))
    await bot.add_cog(MassMoveCog(bot))
    await bot.add_cog(MoveCommand(bot))
    await bot.add_cog(VcMuteCommand(bot))
    await bot.add_cog(VcUnbanCommand(bot))
    await bot.add_cog(VcUnlockCommand(bot))
    await bot.add_cog(VcUnmuteCommand(bot))
