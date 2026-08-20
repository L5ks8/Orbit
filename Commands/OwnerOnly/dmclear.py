import asyncio
import discord
from discord.ext import commands

class DmClearCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="dmclear", hidden=True)
    @commands.is_owner()
    async def dmclear_cmd(self, ctx: commands.Context, limit: int = 100):
        dm_channel = ctx.author.dm_channel
        if dm_channel is None:
            try:
                dm_channel = await ctx.author.create_dm()
            except Exception:
                return

        if limit <= 0 or limit > 1000:
            limit = 1000

        deleted_count = 0
        async for msg in dm_channel.history(limit=limit):
            if msg.author.id == self.bot.user.id:
                try:
                    await msg.delete()
                    deleted_count += 1
                    await asyncio.sleep(0.5)
                except Exception:
                    pass

        if ctx.guild is not None:
            try:
                await ctx.message.delete()
            except Exception:
                pass

        try:
            embed = discord.Embed(
                title="Orbit DM Cleanup Complete",
                description=f"Cleaned up `{deleted_count}` Orbit message(s) from our DM history.",
                color=0x2B2D31
            )
            await ctx.author.send(embed=embed)
        except Exception:
            pass

    @dmclear_cmd.error
    async def dmclear_error(self, ctx: commands.Context, error):
        pass

async def setup(bot: commands.Bot):
    await bot.add_cog(DmClearCommand(bot))
