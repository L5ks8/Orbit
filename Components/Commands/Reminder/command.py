import discord
from discord.ext import commands
from .reminder import remind_group
from . import set
from . import cancel
from . import list

async def setup(bot: commands.Bot):
    bot.tree.add_command(remind_group)
