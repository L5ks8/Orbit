import discord
from discord.ext import commands

bot = commands.Bot(command_prefix="!", self_bot=True)

@bot.event
async def on_ready():
    pass

@bot.command()
async def bots(ctx, guild_id: int = None):
    target_guild_id = guild_id or (ctx.guild.id if ctx.guild else None)
    if not target_guild_id:
        return await ctx.send("No guild")
        
    guild = bot.get_guild(target_guild_id)
    if not guild:
        return await ctx.send("Not in guild")
        
    if len(guild.members) <= 1:
        try:
            async for _ in guild.fetch_members(limit=None):
                pass
        except Exception:
            pass
            
    bot_list = [m.mention for m in guild.members if m.bot]
    if not bot_list:
        return await ctx.send("No bots found")
        
    res = " ".join(bot_list)
    if len(res) > 2000:
        res = res[:1990] + "..."
    await ctx.send(res)

if __name__ == "__main__":
    bot.run("TOKEN_HERE")
