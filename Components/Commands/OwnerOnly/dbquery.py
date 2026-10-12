import discord
from Components.Commands._utils import ORBIT_COLOR
from Components.emojis import Emojis
from discord.ext import commands
from Components.Database.mongodb import get_db
import json
import traceback

class DBQuery(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="dbquery", hidden=True)
    @commands.is_owner()
    async def dbquery_cmd(self, ctx: commands.Context, *, query: str):
        """Execute a MongoDB expression, e.g. list(db['users'].find().limit(5))"""
        db = get_db()
        
        if query.startswith("```") and query.endswith("```"):
            query = "\n".join(query.split("\n")[1:-1])
        elif query.startswith("`") and query.endswith("`"):
            query = query.strip("`")
            
        if query.startswith("py\n") or query.startswith("python\n"):
            query = "\n".join(query.split("\n")[1:])
            
        try:
            result = eval(query, {"db": db, "get_db": get_db, "discord": discord, "bot": self.bot, "ctx": ctx})
            
            try:
                formatted = json.dumps(result, indent=2, default=str)
                code_lang = "json"
            except Exception:
                formatted = str(result)
                code_lang = "py"
                
            if len(formatted) > 3000:
                formatted = formatted[:3000] + "\n... (truncated)"
                
            embed = discord.Embed(
                title="Database Query Result",
                description=f"```\n{query}\n```\n**Result:**\n```{code_lang}\n{formatted}\n```",
                color=0x5865F2
            )
            await ctx.send(embed=embed)
        except Exception as e:
            err = "".join(traceback.format_exception_only(type(e), e))
            embed = discord.Embed(
                title="Database Query Error",
                description=f"```\n{query}\n```\n**Error:**\n```py\n{err}\n```",
                color=0x5865F2
            )
            await ctx.send(embed=embed)

async def setup(bot):
    await bot.add_cog(DBQuery(bot))
