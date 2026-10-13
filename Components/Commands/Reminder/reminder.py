import discord
from discord.ext import commands
from Components.Commands.Reminder.remind import remind_group

reminder_group = remind_group

async def setup(bot: commands.Bot):
    pass
