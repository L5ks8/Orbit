import discord
from discord.ext import commands
from .level import LevelCommandsCog
from .level_admin import LevelAdminCog

async def setup(bot: commands.Bot):
    await bot.add_cog(LevelCommandsCog(bot))
    await bot.add_cog(LevelAdminCog(bot))
