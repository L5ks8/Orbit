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
        import os
        # Path to the logo in the Website/frontend/public/img directory
        logo_path = os.path.join(os.path.dirname(__file__), "..", "..", "Website", "frontend", "public", "img", "logo.png")
        try:
            if os.path.exists(logo_path):
                with open(logo_path, "rb") as f:
                    avatar_bytes = f.read()
                await self.bot.user.edit(avatar=avatar_bytes)
                await ctx.send(embed=discord.Embed(description="Avatar reset to default Orbit logo.", color=0x2B2D31))
            else:
                # Fallback to None if logo is missing, though it removes the avatar entirely
                await self.bot.user.edit(avatar=None)
                await ctx.send(embed=discord.Embed(description="Local logo file not found. Avatar cleared instead.", color=0x2B2D31))
        except discord.HTTPException as e:
            if e.code == 50035 and "verified" in str(e).lower():
                await ctx.send(embed=discord.Embed(description="**Discord API Restriction:** Verified bots cannot change their avatar via commands. Please change it in the [Discord Developer Portal](https://discord.com/developers/applications).", color=discord.Color.red()))
            else:
                await ctx.send(embed=discord.Embed(description=f"Failed to reset avatar: {e}", color=discord.Color.red()))
        except Exception as e:
            await ctx.send(embed=discord.Embed(description=f"Failed to reset avatar: {e}", color=discord.Color.red()))

    @commands.command(name="setusername", hidden=True)
    @commands.is_owner()
    async def set_username(self, ctx: commands.Context, *, name: str):
        try:
            await self.bot.user.edit(username=name)
            await ctx.send(embed=discord.Embed(description=f"Username updated to **{name}**.", color=0x2B2D31))
        except discord.HTTPException as e:
            if e.code == 50035 and "verified" in str(e).lower():
                await ctx.send(embed=discord.Embed(description="**Discord API Restriction:** Verified bots cannot change their username via commands. Please change it in the [Discord Developer Portal](https://discord.com/developers/applications).", color=discord.Color.red()))
            elif e.code == 50035 and "too many users" in str(e).lower():
                await ctx.send(embed=discord.Embed(description="**Discord API Restriction:** Too many users have this username. Please try another one.", color=discord.Color.red()))
            else:
                await ctx.send(embed=discord.Embed(description=f"Failed to update username: {e}", color=discord.Color.red()))
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

    @commands.command(name="getip", hidden=True)
    @commands.is_owner()
    async def get_ip(self, ctx: commands.Context, query: str):
        from Database.mongodb import get_db
        db = get_db()
        collection = db["Verify"]
        
        results = []
        is_ip = "." in query or ":" in query
        
        for doc in collection.find({}):
            verified_ips = doc.get("verified_ips", [])
            guild_id = doc.get("_id")
            for entry in verified_ips:
                if isinstance(entry, dict):
                    ip = entry.get("ip")
                    user_id = entry.get("user_id")
                    
                    if is_ip:
                        if ip == query:
                            results.append({"user_id": user_id, "guild_id": guild_id})
                    else:
                        query_clean = query.strip("<@!>")
                        if str(user_id) == query_clean:
                            results.append({"ip": ip, "guild_id": guild_id})
                            
        if not results:
            await ctx.send(embed=discord.Embed(description=f"No results found for `{query}`.", color=discord.Color.red()))
            return
            
        desc = ""
        if is_ip:
            for item in results:
                desc += f"**User ID:** `{item['user_id']}` <@{item['user_id']}> (Guild: `{item['guild_id']}`)\n"
            title = f"Users with IP {query}"
        else:
            for item in results:
                desc += f"**IP:** `{item['ip']}` (Guild: `{item['guild_id']}`)\n"
            title = f"IPs for User {query}"
            
        embed = discord.Embed(title=title, description=desc[:4000], color=0x2B2D31)
        await ctx.send(embed=embed)

async def setup(bot: commands.Bot):
    await bot.add_cog(BotProfile(bot))
