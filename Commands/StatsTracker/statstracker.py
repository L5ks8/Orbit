import discord
from discord.ext import commands
from datetime import datetime, timezone
from Database.mongodb import get_db

class StatsTracker(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    def _increment_stat(self, guild_id: int, stat_name: str, amount: int = 1):
        db = get_db()
        if db is None:
            return
            
        today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        doc_id = f"{guild_id}_{today_str}"
        
        try:
            db["GuildStats"].update_one(
                {"_id": doc_id},
                {
                    "$inc": {stat_name: amount},
                    "$setOnInsert": {
                        "guild_id": guild_id,
                        "date": today_str
                    }
                },
                upsert=True
            )
        except Exception as e:
            print(f"Failed to increment stat {stat_name} for {guild_id}: {e}")

    @commands.Cog.listener()
    async def on_message(self, message: discord.Message):
        if not message.guild or message.author.bot:
            return
        self._increment_stat(message.guild.id, "messages")

    @commands.Cog.listener()
    async def on_member_join(self, member: discord.Member):
        self._increment_stat(member.guild.id, "joins")

    @commands.Cog.listener()
    async def on_member_remove(self, member: discord.Member):
        self._increment_stat(member.guild.id, "leaves")

async def setup(bot):
    await bot.add_cog(StatsTracker(bot))
