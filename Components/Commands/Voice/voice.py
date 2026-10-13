import discord
from discord.ext import commands
from discord import app_commands

voice_group = app_commands.Group(name="voice", description="Voice channel controls")

async def setup(bot: commands.Bot):
    bot.tree.add_command(voice_group)
