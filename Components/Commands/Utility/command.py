import discord
from discord.ext import commands
from .birthday import Birthday
from .snipe import Snipe
from .translate import Translate

async def setup(bot: commands.Bot):
    await bot.add_cog(Birthday(bot))
    await bot.add_cog(Snipe(bot))
    await bot.add_cog(Translate(bot))
