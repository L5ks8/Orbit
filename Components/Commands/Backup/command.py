import discord
from discord.ext import commands
from .backup import BackupCommand

async def setup(bot: commands.Bot):
    await bot.add_cog(BackupCommand(bot))
