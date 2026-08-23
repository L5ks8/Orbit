import discord
from discord.ext import commands


class PingCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="ping", description="Shows the bot latency.")
    async def ping(self, ctx: commands.Context):
        ms = round(self.bot.latency * 1000)
        embed = discord.Embed(
            title="Pong",
            description=f"**Latency:** `{ms} ms`",
            color=discord.Color.blue()
        )
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    await bot.add_cog(PingCommand(bot))

