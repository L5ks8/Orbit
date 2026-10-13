import discord
from discord.ext import commands
from .avatar import AvatarCommand
from .banner import BannerCommand

async def setup(bot: commands.Bot):
    await bot.add_cog(AvatarCommand(bot))
    await bot.add_cog(BannerCommand(bot))
