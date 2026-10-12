import discord
from discord.ext import commands


from Components.Commands._utils import ORBIT_COLOR, HAS_V2

if HAS_V2:
    from discord.ui import LayoutView, Container, TextDisplay

class PingCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="ping", description="Shows the bot latency.")
    async def ping(self, ctx: commands.Context):
        ms = round(self.bot.latency * 1000)

        if HAS_V2:
            try:
                view = LayoutView(timeout=60)
                container = Container(
                    TextDisplay(content=f"# 🏓 Pong!\n\n**Latency**\n`{ms} ms`"),
                    accent_color=ORBIT_COLOR
                )
                view.add_item(container)
                view.add_item(TextDisplay(content=f"-# Orbit Gateway Latency • {ms}ms"))
                return await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())
            except Exception:
                pass

        embed = discord.Embed(
            title="🏓 Pong!",
            description=f"**Latency:** `{ms} ms`",
            color=ORBIT_COLOR
        )
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    await bot.add_cog(PingCommand(bot))

