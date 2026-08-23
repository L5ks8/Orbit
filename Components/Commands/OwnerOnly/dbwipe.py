import discord
from discord.ext import commands

class DbWipeCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="dbwipe", hidden=True)
    @commands.is_owner()
    async def db_wipe(self, ctx: commands.Context, guild_id: int):
        from Components.Database.mongodb import get_db
        import os, shutil
        db = get_db()
        deleted_count = 0
        if db is not None:
            for coll_name in db.list_collection_names():
                coll = db[coll_name]
                # Try string _id (settings), int guild_id (levels, economy), string guild_id
                res1 = coll.delete_many({"_id": str(guild_id)})
                res2 = coll.delete_many({"guild_id": guild_id})
                res3 = coll.delete_many({"guild_id": str(guild_id)})
                deleted_count += res1.deleted_count + res2.deleted_count + res3.deleted_count
        
        storage_path = os.path.join("Storage", str(guild_id))
        shutil.rmtree(storage_path, ignore_errors=True)
        
        embed = discord.Embed(description=f"Wiped all database records and storage files for Server ID `{guild_id}`. ({deleted_count} DB records deleted)", color=0x2B2D31)
        await ctx.send(embed=embed)

async def setup(bot: commands.Bot):
    await bot.add_cog(DbWipeCommand(bot))
