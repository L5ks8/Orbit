import discord
from discord.ext import commands
from .reminderlistener import ReminderListener

async def setup(bot: commands.Bot):
    await bot.add_cog(ReminderListener(bot))
