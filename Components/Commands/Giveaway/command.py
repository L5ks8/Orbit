import discord
from discord.ext import commands
from .giveaway import GiveawayCommand
from .gend import GiveawayEndCommand
from .greroll import GiveawayRerollCommand

async def setup(bot: commands.Bot):
    await bot.add_cog(GiveawayCommand(bot))
    await bot.add_cog(GiveawayEndCommand(bot))
    await bot.add_cog(GiveawayRerollCommand(bot))
