import os
import asyncio
import discord
from Components.Commands._utils import ORBIT_COLOR, make_v2_card
from Components.emojis import Emojis
from discord.ext import commands

class RestartCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="restart", aliases=["reboot", "shutdown"], hidden=True)
    @commands.is_owner()
    async def restart_cmd(self, ctx: commands.Context):
        await ctx.defer(ephemeral=True)
        body = f"# Orbit System Reboot Initiated\n\n**Action:** Closing Discord Gateway session and terminating process...\n\n*Render will automatically boot a fresh Orbit instance within seconds.*"
        card = make_v2_card(body, color=ORBIT_COLOR)
        if card:
            await ctx.send(view=card, allowed_mentions=discord.AllowedMentions.none())
        else:
            embed = discord.Embed(
                title="Orbit System Reboot Initiated",
                description="**Action:** Closing Discord Gateway session and terminating process...\n\n*Render will automatically boot a fresh Orbit instance within seconds.*",
                color=ORBIT_COLOR
            )
            await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())
        
        await self.bot.close()

    @restart_cmd.error
    async def restart_error(self, ctx: commands.Context, error):
        pass

async def setup(bot: commands.Bot):
    await bot.add_cog(RestartCommand(bot))
