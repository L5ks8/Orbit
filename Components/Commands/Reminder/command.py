import discord
from discord.ext import commands
from .reminder import remind_group

async def setup(bot: commands.Bot):
    bot.tree.add_command(remind_group)
