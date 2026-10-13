import discord
from discord.ext import commands
from .case import case_group
from .history import HistoryCog

async def setup(bot: commands.Bot):
    bot.tree.add_command(case_group)
    await bot.add_cog(HistoryCog(bot))
