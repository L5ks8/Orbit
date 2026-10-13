import discord
from discord.ext import commands
from .help import HelpCommandCog

async def setup(bot: commands.Bot):
    await bot.add_cog(HelpCommandCog(bot))
