import discord
from discord.ext import commands


class PingCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="ping", description="Shows the bot latency.")
    async def ping(self, ctx: commands.Context):
        from Embeds import get_command_embed
        kwargs = get_command_embed(ctx.guild.id if ctx.guild else None, "ping", latency=self.bot.latency)
        await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    await bot.add_cog(PingCommand(bot))

