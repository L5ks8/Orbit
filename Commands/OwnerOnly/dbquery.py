import discord
from discord.ext import commands
from Database.mongodb import get_db
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
        
        # Clean codeblock formatting if present
        if query.startswith("```") and query.endswith("```"):
            query = "\n".join(query.split("\n")[1:-1])
        elif query.startswith("`") and query.endswith("`"):
            query = query.strip("`")
            
        # Optional: remove python marker if used
        if query.startswith("py\n") or query.startswith("python\n"):
            query = "\n".join(query.split("\n")[1:])
            
        try:
            # We use eval for expressions (like find, count_documents, etc)
            # Example query: list(db.guilds.find({}).limit(2))
            result = eval(query, {"db": db, "get_db": get_db, "discord": discord})
            
            # Convert result to string or JSON
            try:
                formatted = json.dumps(result, indent=2, default=str)
                code_lang = "json"
            except Exception:
                formatted = str(result)
                code_lang = "py"
                
            if len(formatted) > 1900:
                formatted = formatted[:1900] + "\n... (truncated)"
                
            await ctx.send(f"**Result:**\n```{code_lang}\n{formatted}\n```")
        except Exception as e:
            err = "".join(traceback.format_exception_only(type(e), e))
            await ctx.send(f"**Error:**\n```py\n{err}\n```")

async def setup(bot):
    await bot.add_cog(DBQuery(bot))
