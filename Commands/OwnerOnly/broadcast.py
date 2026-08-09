import discord
from discord.ext import commands
import asyncio

class Broadcast(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="broadcast", hidden=True)
    @commands.is_owner()
    async def broadcast_cmd(self, ctx: commands.Context, *, message: str):
        """Send a message to all server owners."""
        confirm_embed = discord.Embed(
            title="📢 Confirm Broadcast",
            description=f"Are you sure you want to send this message to **{len(self.bot.guilds)}** server owners?\n\n**Message:**\n{message}",
            color=0xF59E0B
        )
        msg = await ctx.send(embed=confirm_embed)
        await msg.add_reaction("✅")
        await msg.add_reaction("❌")
        
        def check(r, u):
            return u.id == ctx.author.id and str(r.emoji) in ["✅", "❌"] and r.message.id == msg.id
            
        try:
            reaction, _ = await self.bot.wait_for("reaction_add", timeout=30.0, check=check)
        except asyncio.TimeoutError:
            await msg.edit(content="Broadcast timed out.", embed=None)
            return
            
        if str(reaction.emoji) == "❌":
            await msg.edit(content="Broadcast cancelled.", embed=None)
            return
            
        await msg.edit(content="Starting broadcast... this may take a while.", embed=None)
        
        success = 0
        failed = 0
        
        # To avoid rate limits and too much memory blocking, do this slowly
        for guild in self.bot.guilds:
            if guild.owner:
                try:
                    await guild.owner.send(message)
                    success += 1
                except discord.Forbidden:
                    failed += 1
                except discord.HTTPException:
                    failed += 1
                await asyncio.sleep(0.5) 
                
        result_embed = discord.Embed(
            title="✅ Broadcast Complete",
            description=f"**Success:** {success}\n**Failed (DMs disabled):** {failed}",
            color=0x22C55E
        )
        await ctx.send(embed=result_embed)

async def setup(bot):
    await bot.add_cog(Broadcast(bot))
