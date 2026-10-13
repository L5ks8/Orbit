import discord
from discord.ext import commands
from .image_filters import ImageFilters

async def setup(bot: commands.Bot):
    await bot.add_cog(ImageFilters(bot))
