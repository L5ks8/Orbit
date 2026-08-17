import discord
from discord.ext import commands
import aiohttp

class BotProfile(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="setavatar", hidden=True)
    @commands.is_owner()
    async def set_avatar(self, ctx: commands.Context, url: str = None):
        if url is None and len(ctx.message.attachments) > 0:
            url = ctx.message.attachments[0].url
        elif url is None:
            return await ctx.send(embed=discord.Embed(description="Please provide a URL or attach an image.", color=discord.Color.red()))
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as r:
                if r.status == 200:
                    data = await r.read()
                    try:
                        await self.bot.user.edit(avatar=data)
                        await ctx.send(embed=discord.Embed(description="Avatar updated successfully.", color=0x2B2D31))
                    except Exception as e:
                        await ctx.send(embed=discord.Embed(description=f"Failed to update avatar: {e}", color=discord.Color.red()))
                else:
                    await ctx.send(embed=discord.Embed(description="Failed to download image.", color=discord.Color.red()))

    @commands.command(name="resetavatar", hidden=True)
    @commands.is_owner()
    async def reset_avatar(self, ctx: commands.Context):
        try:
            await self.bot.user.edit(avatar=None)
            await ctx.send(embed=discord.Embed(description="Avatar reset successfully.", color=0x2B2D31))
        except Exception as e:
            await ctx.send(embed=discord.Embed(description=f"Failed to reset avatar: {e}", color=discord.Color.red()))

    @commands.command(name="setusername", hidden=True)
    @commands.is_owner()
    async def set_username(self, ctx: commands.Context, *, name: str):
        try:
            await self.bot.user.edit(username=name)
            await ctx.send(embed=discord.Embed(description=f"Username updated to **{name}**.", color=0x2B2D31))
        except Exception as e:
            await ctx.send(embed=discord.Embed(description=f"Failed to update username: {e}", color=discord.Color.red()))

    @commands.command(name="resetusername", hidden=True)
    @commands.is_owner()
    async def reset_username(self, ctx: commands.Context):
        # Default name is 'Orbit' but it could be rate limited.
        try:
            await self.bot.user.edit(username="Orbit")
            await ctx.send(embed=discord.Embed(description="Username reset to **Orbit**.", color=0x2B2D31))
        except Exception as e:
            await ctx.send(embed=discord.Embed(description=f"Failed to reset username: {e}", color=discord.Color.red()))

async def setup(bot: commands.Bot):
    await bot.add_cog(BotProfile(bot))
