import os
import asyncio
import discord
from discord.ext import commands

class RestartCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="restart", aliases=["reboot", "shutdown"], description="Owner Only: Reboots the bot process.")
    @commands.is_owner()
    async def restart_cmd(self, ctx: commands.Context):
        async with ctx.typing():
            embed = discord.Embed(
                title="Orbit System Reboot Initiated",
                description="**Action:** Closing Discord Gateway session and terminating process...\n\n*Render will automatically boot a fresh Orbit instance within seconds.*",
                color=0x2B2D31
            )
            await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())
            
            await self.bot.close()

    @restart_cmd.error
    async def restart_error(self, ctx: commands.Context, error):
        pass

async def setup(bot: commands.Bot):
    await bot.add_cog(RestartCommand(bot))
