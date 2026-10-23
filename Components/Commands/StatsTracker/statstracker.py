import discord
from discord.ext import commands
from datetime import datetime, timezone
import time
from Components.Database.mongodb import get_db

class StatsTracker(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.voice_join_times = {}
        self.voice_join_channels = {}

    def _increment_stat(self, guild_id: int, stat_name: str, amount: int = 1, user_id: int = None, channel_id: int = None, extra_incs: dict = None):
        db = get_db()
        if db is None:
            return
            
        now_utc = datetime.now(timezone.utc)
        today_str = now_utc.strftime("%Y-%m-%d")
        doc_id = f"{guild_id}_{today_str}"
        
        update_data = {
            "$inc": {stat_name: amount},
            "$setOnInsert": {
                "guild_id": guild_id,
                "date": today_str
            }
        }
        
        if stat_name == "messages":
            hour_key = now_utc.strftime("%H")
            update_data["$inc"][f"hours.{hour_key}"] = amount
            if user_id:
                update_data["$inc"][f"user_messages.{user_id}"] = amount

        if channel_id:
            if stat_name == "voice_minutes":
                update_data["$inc"][f"voice_channels.{channel_id}"] = amount
            else:
                update_data["$inc"][f"channels.{channel_id}"] = amount

        if stat_name == "voice_minutes" and user_id:
            update_data["$inc"][f"user_voice.{user_id}"] = amount

        if extra_incs:
            for k, v in extra_incs.items():
                update_data["$inc"][k] = update_data["$inc"].get(k, 0) + v
            
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
            
        guild_id = message.guild.id
        extra_incs = {}
        if message.mentions:
            for m in message.mentions:
                if not m.bot:
                    extra_incs[f"mentioned_users.{m.id}"] = extra_incs.get(f"mentioned_users.{m.id}", 0) + 1

        self._increment_stat(guild_id, "messages", 1, message.author.id, message.channel.id, extra_incs=extra_incs)
        
        if not hasattr(self.bot, 'recent_messages'):
            self.bot.recent_messages = {}
            
        if guild_id not in self.bot.recent_messages:
            self.bot.recent_messages[guild_id] = []
            
        now = time.time()
        self.bot.recent_messages[guild_id].append(now)
        
        cutoff = now - 3900
        self.bot.recent_messages[guild_id] = [ts for ts in self.bot.recent_messages[guild_id] if ts > cutoff]

    @commands.Cog.listener()
    async def on_raw_reaction_add(self, payload: discord.RawReactionActionEvent):
        if not payload.guild_id or (payload.member and payload.member.bot):
            return
        db = get_db()
        if db is None:
            return
        now_utc = datetime.now(timezone.utc)
        today_str = now_utc.strftime("%Y-%m-%d")
        doc_id = f"{payload.guild_id}_{today_str}"
        inc_fields = {
            "reactions": 1,
            f"reaction_channels.{payload.channel_id}": 1
        }
        target_uid = getattr(payload, "message_author_id", None) or payload.user_id
        if target_uid:
            inc_fields[f"reacted_users.{target_uid}"] = 1
        try:
            db["GuildStats"].update_one(
                {"_id": doc_id},
                {
                    "$inc": inc_fields,
                    "$setOnInsert": {"guild_id": payload.guild_id, "date": today_str}
                },
                upsert=True
            )
        except Exception:
            pass

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

        uid = str(member.id)
        if before.channel is None and after.channel is not None:
            if not after.afk and not after.self_deaf and not after.deaf:
                self.voice_join_times[uid] = time.time()
                self.voice_join_channels[uid] = after.channel.id
                
        elif before.channel is not None and after.channel is None:
            join_time = self.voice_join_times.pop(uid, None)
            ch_id = self.voice_join_channels.pop(uid, before.channel.id)
            if join_time:
                elapsed_minutes = int((time.time() - join_time) / 60)
                if elapsed_minutes > 0:
                    self._increment_stat(member.guild.id, "voice_minutes", elapsed_minutes, user_id=member.id, channel_id=ch_id)
                    
        elif before.channel is not None and after.channel is not None:
            if after.afk or after.self_deaf or after.deaf:
                join_time = self.voice_join_times.pop(uid, None)
                ch_id = self.voice_join_channels.pop(uid, before.channel.id)
                if join_time:
                    elapsed_minutes = int((time.time() - join_time) / 60)
                    if elapsed_minutes > 0:
                        self._increment_stat(member.guild.id, "voice_minutes", elapsed_minutes, user_id=member.id, channel_id=ch_id)
            else:
                if before.channel.id != after.channel.id and uid in self.voice_join_times:
                    join_time = self.voice_join_times[uid]
                    elapsed_minutes = int((time.time() - join_time) / 60)
                    if elapsed_minutes > 0:
                        self._increment_stat(member.guild.id, "voice_minutes", elapsed_minutes, user_id=member.id, channel_id=before.channel.id)
                    self.voice_join_times[uid] = time.time()
                    self.voice_join_channels[uid] = after.channel.id
                elif uid not in self.voice_join_times:
                    self.voice_join_times[uid] = time.time()
                    self.voice_join_channels[uid] = after.channel.id

async def setup(bot):
    await bot.add_cog(StatsTracker(bot))
