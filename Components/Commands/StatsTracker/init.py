import discord
from discord.ext import commands
from .command import setup as setup_commands
from .listener import setup as setup_listeners

async def setup(bot: commands.Bot):
    await setup_commands(bot)
    await setup_listeners(bot)
