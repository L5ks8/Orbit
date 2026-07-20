import os
import asyncio
import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator

class RestartNoticeLayout(LayoutView):
    def __init__(self):
        super().__init__()
        content_str = (
            f"**Action:** Closing Discord Gateway session and terminating process...\n\n"
            f"*Render will automatically boot a fresh Orbit instance within seconds.*"
        )
        self.container = Container(
            TextDisplay(content="### Orbit System Reboot Initiated"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=content_str)
        )
        self.add_item(self.container)

class RestartCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="restart", aliases=["reboot", "shutdown"], description="Owner Only: Reboots the bot process.")
    @commands.is_owner()
    async def restart_cmd(self, ctx: commands.Context):
        async with ctx.typing():
            view = RestartNoticeLayout()
            await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

        try:
            await self.bot.close()
        except Exception:
            pass
        finally:
            await asyncio.sleep(1)
            os._exit(0)

    @restart_cmd.error
    async def restart_error(self, ctx: commands.Context, error):
        if not isinstance(error, commands.NotOwner):
            await ctx.send(f"Restart error: {error}", allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    await bot.add_cog(RestartCommand(bot))

