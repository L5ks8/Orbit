import discord
from discord.ext import commands

class GetIpCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

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
    await bot.add_cog(GetIpCommand(bot))
