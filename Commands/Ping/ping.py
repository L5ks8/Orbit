utf-8import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator

class PingLayout(LayoutView):
    def __init__(self, latency: float):
        super().__init__()
        ms = round(latency * 1000)
        self.container = Container(
            TextDisplay(content="### Pong"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Latency:** `{ms} ms`")
        )
        self.add_item(self.container)

class PingCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="ping", description="Shows the bot latency.")
    async def ping(self, ctx: commands.Context):
        view = PingLayout(self.bot.latency)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    await bot.add_cog(PingCommand(bot))
