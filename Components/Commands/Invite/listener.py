import discord
from discord.ext import commands
from .invitelistener import InviteTrackerListener

async def setup(bot: commands.Bot):
    await bot.add_cog(InviteTrackerListener(bot))
