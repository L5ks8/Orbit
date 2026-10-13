import discord
from discord.ext import commands
from discord import app_commands

remind_group = app_commands.Group(name="remind", description="Manage personal and server reminders.")

async def setup(bot: commands.Bot):
    bot.tree.add_command(remind_group)
