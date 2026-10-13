import discord
from discord.ext import commands
from discord import app_commands

channel_group = app_commands.Group(name="channel", description="Channel management commands.", default_permissions=discord.Permissions(manage_channels=True))

async def setup(bot: commands.Bot):
    bot.tree.add_command(channel_group)
