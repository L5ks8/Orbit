import discord
from discord.ext import commands
from .channel import channel_group
from . import create
from . import delete
from .getchannel import GetChannelCog

async def setup(bot: commands.Bot):
    bot.tree.add_command(channel_group)
    await bot.add_cog(GetChannelCog(bot))
