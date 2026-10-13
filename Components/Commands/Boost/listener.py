import discord
from discord.ext import commands
from .boostlistener import BoostListener

async def setup(bot: commands.Bot):
    await bot.add_cog(BoostListener(bot))
