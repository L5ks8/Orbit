import discord
from discord.ext import commands
from datetime import datetime, timezone
import time
from Database.mongodb import get_db

class StatsTracker(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.voice_join_times = {}

    def _increment_stat(self, guild_id: int, stat_name: str, amount: int = 1, user_id: int = None):
        db = get_db()
        if db is None:
            return
            
        today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        doc_id = f"{guild_id}_{today_str}"
        
        update_data = {
            "$inc": {stat_name: amount},
            "$setOnInsert": {
                "guild_id": guild_id,
                "date": today_str
            }
        }
        if user_id:
            update_data["$addToSet"] = {"active_users": user_id}
            
        try:
            db["GuildStats"].update_one(
                {"_id": doc_id},
                update_data,
                upsert=True
            )
        except Exception as e:
            print(f"Failed to increment stat {stat_name} for {guild_id}: {e}")

    @commands.Cog.listener()
    async def on_message(self, message: discord.Message):
        if not message.guild or message.author.bot:
            return
        self._increment_stat(message.guild.id, "messages", 1, message.author.id)

    @commands.Cog.listener()
    async def on_member_join(self, member: discord.Member):
        self._increment_stat(member.guild.id, "joins")

    @commands.Cog.listener()
    async def on_member_remove(self, member: discord.Member):
        self._increment_stat(member.guild.id, "leaves")

    @commands.Cog.listener()
    async def on_voice_state_update(self, member: discord.Member, before: discord.VoiceState, after: discord.VoiceState):
        if member.bot:
            return
            
        # Track active users (joined voice)
        if after.channel and not before.channel:
            db = get_db()
            if db is not None:
                today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
                doc_id = f"{member.guild.id}_{today_str}"
                try:
                    db["GuildStats"].update_one(
                        {"_id": doc_id},
                        {"$addToSet": {"active_users": member.id}, "$setOnInsert": {"guild_id": member.guild.id, "date": today_str}},
                        upsert=True
                    )
                except:
                    pass

        # Track Voice Minutes
        uid = str(member.id)
        if before.channel is None and after.channel is not None:
            if not after.afk and not after.self_deaf and not after.deaf:
                self.voice_join_times[uid] = time.time()
                
        elif before.channel is not None and after.channel is None:
            join_time = self.voice_join_times.pop(uid, None)
            if join_time:
                elapsed_minutes = int((time.time() - join_time) / 60)
                if elapsed_minutes > 0:
                    self._increment_stat(member.guild.id, "voice_minutes", elapsed_minutes)
                    
        elif before.channel is not None and after.channel is not None:
            if after.afk or after.self_deaf or after.deaf:
                join_time = self.voice_join_times.pop(uid, None)
                if join_time:
                    elapsed_minutes = int((time.time() - join_time) / 60)
                    if elapsed_minutes > 0:
                        self._increment_stat(member.guild.id, "voice_minutes", elapsed_minutes)
            else:
                if uid not in self.voice_join_times:
                    self.voice_join_times[uid] = time.time()

async def setup(bot):
    await bot.add_cog(StatsTracker(bot))
