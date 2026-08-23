import discord
from discord.ext import commands

class WipeUserCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="wipeuser", hidden=True)
    @commands.is_owner()
    async def wipe_user(self, ctx: commands.Context, user_id: int):
        from Components.Database.mongodb import get_db
        db = get_db()
        deleted_count = 0
        if db is not None:
            for coll_name in db.list_collection_names():
                coll = db[coll_name]
                # Try string _id, int user_id, string user_id
                res1 = coll.delete_many({"_id": str(user_id)})
                res2 = coll.delete_many({"user_id": user_id})
                res3 = coll.delete_many({"user_id": str(user_id)})
                res4 = coll.delete_many({"author_id": user_id})
                res5 = coll.delete_many({"author_id": str(user_id)})
                deleted_count += res1.deleted_count + res2.deleted_count + res3.deleted_count + res4.deleted_count + res5.deleted_count
        
        embed = discord.Embed(description=f"Wiped all database records for User ID `{user_id}`. ({deleted_count} DB records deleted)", color=0x2B2D31)
        await ctx.send(embed=embed)

async def setup(bot: commands.Bot):
    await bot.add_cog(WipeUserCommand(bot))
