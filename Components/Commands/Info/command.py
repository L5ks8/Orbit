import discord
from discord.ext import commands
from .botinfo import BotInfoCommand
from .bots import BotsListCommand
from .calculate import CalculateCommand
from .serverinfo import ServerInfoCommand
from .userinfo import UserInfoCommand

async def setup(bot: commands.Bot):
    await bot.add_cog(BotInfoCommand(bot))
    await bot.add_cog(BotsListCommand(bot))
    await bot.add_cog(CalculateCommand(bot))
    await bot.add_cog(ServerInfoCommand(bot))
    await bot.add_cog(UserInfoCommand(bot))
