import discord
from discord import app_commands
from discord.ext import commands
from Components.Commands._utils import ORBIT_COLOR, InteractionContext
from Components.emojis import Emojis

class PingCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(name="ping", description="Shows the bot latency.")
    async def ping(self, interaction: discord.Interaction):
        ctx = InteractionContext(interaction)
        ms = round(self.bot.latency * 1000)

        embed = discord.Embed(
            title="Pong!",
            description=f"**Latency:** `{ms} ms`",
            color=ORBIT_COLOR
        )
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    await bot.add_cog(PingCommand(bot))
