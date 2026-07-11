import discord
from discord.ext import commands
from Commands.Warn._group import _do_warn_add, warn_group

class WarnCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

class WarnPrefixFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="warnadd", aliases=["wadd"], hidden=True)
    @commands.has_permissions(moderate_members=True)
    async def warn_add_prefix(self, ctx: commands.Context, user: discord.Member, *, reason: str = "No reason provided."):
        await _do_warn_add(ctx, user, reason)

async def setup(bot: commands.Bot):
    await bot.add_cog(WarnCommand(bot))
    await bot.add_cog(WarnPrefixFallback(bot))
