import discord
from discord.ext import commands
from discord import app_commands

slowmode_group = app_commands.Group(name="slowmode", description="Channel slowmode commands.", default_permissions=discord.Permissions(manage_channels=True))

async def setup(bot: commands.Bot):
    bot.tree.add_command(slowmode_group)
