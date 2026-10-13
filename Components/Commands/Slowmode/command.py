import discord
from discord.ext import commands
from .slowmode import slowmode_group
from .reset import SlowmodeRemoveCommand
from .set import SlowmodeSetCommand

async def setup(bot: commands.Bot):
    bot.tree.add_command(slowmode_group)
    await bot.add_cog(SlowmodeRemoveCommand(bot))
    await bot.add_cog(SlowmodeSetCommand(bot))
