import discord
from discord.ext import commands
from .backup import backup_group

async def setup(bot: commands.Bot):
    bot.tree.add_command(backup_group)
