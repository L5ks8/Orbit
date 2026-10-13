import discord
from discord.ext import commands
from discord import app_commands

role_group = app_commands.Group(name="role", description="Server role management commands.", default_permissions=discord.Permissions(manage_roles=True))

async def setup(bot: commands.Bot):
    bot.tree.add_command(role_group)
