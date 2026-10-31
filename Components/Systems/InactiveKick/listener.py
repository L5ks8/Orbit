import asyncio
import time
import datetime
import discord
from discord.ext import commands, tasks
from typing import Dict
from Components.Systems.InactiveKick._storage import load_inactive_kick_config

class InactiveKickListener(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        # guild_id -> { user_id: timestamp }
        self.last_activity: Dict[int, Dict[int, float]] = {}
        # guild_id -> { user_id: timestamp }
        self.warned_users: Dict[int, Dict[int, float]] = {}
        # Track when bot started tracking for fresh timer
        self.tracking_started_at: Dict[int, float] = {}
        self.check_loop.start()

    def cog_unload(self):
        self.check_loop.cancel()

    def record_activity(self, guild_id: int, user_id: int):
        if guild_id not in self.last_activity:
            self.last_activity[guild_id] = {}
        self.last_activity[guild_id][user_id] = time.time()
        # Clear warning if member became active again
        if guild_id in self.warned_users and user_id in self.warned_users[guild_id]:
            self.warned_users[guild_id].pop(user_id, None)

    @commands.Cog.listener()
    async def on_message(self, message: discord.Message):
        if not message.guild or message.author.bot:
            return
        self.record_activity(message.guild.id, message.author.id)

    @commands.Cog.listener()
    async def on_voice_state_update(self, member: discord.Member, before: discord.VoiceState, after: discord.VoiceState):
        if member.bot or not member.guild:
            return
        if after.channel is not None:
            self.record_activity(member.guild.id, member.id)

    @tasks.loop(minutes=30)
    async def check_loop(self):
        await self.bot.wait_until_ready()
        now = time.time()

        for guild in list(self.bot.guilds):
            try:
                # Yield control to the asyncio event loop between guilds so heartbeats and events run smoothly
                await asyncio.sleep(0.05)

                cfg = await asyncio.to_thread(load_inactive_kick_config, guild.id)
                if not cfg.get("enabled", False):
                    continue

                min_server_size = cfg.get("min_server_size", 10)
                if (guild.member_count or len(guild.members)) < min_server_size:
                    continue

                days = cfg.get("days", 30)
                warn_hours = cfg.get("warn_before_hours", 24)
                action = cfg.get("action", "kick")
                dm_warning_enabled = cfg.get("dm_warning_enabled", True)
                count_voice = cfg.get("count_voice", True)
                ignore_any_role = cfg.get("ignore_any_role", False)
                historical_tracking = cfg.get("historical_tracking", False)
                exempt_roles = set(str(r) for r in cfg.get("exempt_roles", []))
                warning_template = cfg.get(
                    "warning_message",
                    "Hey {user}! You've been inactive in **{server}** for {days} days. You'll be removed in {hours} hours unless you send a message or join a voice channel."
                )
                log_channel_id = cfg.get("log_channel_id")

                if guild.id not in self.tracking_started_at:
                    self.tracking_started_at[guild.id] = now

                guild_activity = self.last_activity.setdefault(guild.id, {})
                guild_warned = self.warned_users.setdefault(guild.id, {})

                kick_threshold_seconds = days * 86400
                warn_threshold_seconds = kick_threshold_seconds - (warn_hours * 3600)

                for i, member in enumerate(list(guild.members)):
                    if i % 30 == 0:
                        await asyncio.sleep(0)
                    if member.bot:
                        continue
                    if member.id == guild.owner_id:
                        continue
                    from Components.Commands._utils import is_immune
                    if is_immune(guild.id, member):
                        continue

                    # Ignore members with any assigned role (besides @everyone)
                    if ignore_any_role and len(member.roles) > 1:
                        continue

                    # Check exempt roles
                    if exempt_roles and any(str(r.id) in exempt_roles for r in member.roles):
                        continue

                    # If voice active counts
                    if count_voice and member.voice and member.voice.channel:
                        guild_activity[member.id] = now
                        guild_warned.pop(member.id, None)
                        continue

                    last_seen = guild_activity.get(member.id)
                    if last_seen is None:
                        if historical_tracking:
                            if member.joined_at:
                                last_seen = member.joined_at.timestamp()
                            else:
                                last_seen = self.tracking_started_at[guild.id]
                        else:
                            # Fresh timer starts when module turned on
                            last_seen = self.tracking_started_at[guild.id]
                        guild_activity[member.id] = last_seen

                    inactive_seconds = now - last_seen

                    # 1. Warning Check
                    if dm_warning_enabled and inactive_seconds >= warn_threshold_seconds and inactive_seconds < kick_threshold_seconds:
                        if member.id not in guild_warned:
                            try:
                                formatted_msg = warning_template.replace("{user}", member.mention) \
                                                                .replace("@user", member.mention) \
                                                                .replace("{server}", guild.name) \
                                                                .replace("@server", guild.name) \
                                                                .replace("{days}", str(days)) \
                                                                .replace("@days", str(days)) \
                                                                .replace("{hours}", str(warn_hours)) \
                                                                .replace("@hours", str(warn_hours))
                                formatted_msg += f"\n-# Sent from {guild.name}"
                                await member.send(formatted_msg)
                                guild_warned[member.id] = now
                            except Exception as dm_err:
                                # DMs might be closed
                                guild_warned[member.id] = now

                    # 2. Inactive Action Threshold Check
                    elif inactive_seconds >= kick_threshold_seconds:
                        reason = f"Orbit Inactive Kick: Inactive for {days} days"
                        try:
                            if action == "kick":
                                await member.kick(reason=reason)
                                action_name = "Kicked"
                            elif action == "timeout":
                                await member.timeout(datetime.timedelta(days=7), reason=reason)
                                action_name = "Timed out (7d)"
                            elif action == "prune":
                                non_default_roles = [r for r in member.roles if not r.is_default()]
                                if non_default_roles:
                                    await member.remove_roles(*non_default_roles, reason=reason)
                                action_name = "Roles Removed"
                            else:
                                await member.kick(reason=reason)
                                action_name = "Kicked"

                            # Send log message if configured
                            if log_channel_id:
                                try:
                                    log_ch = guild.get_channel(int(log_channel_id))
                                    if log_ch:
                                        embed = discord.Embed(
                                            title="Inactive Member Removed",
                                            description=f"**Member:** {member.mention} (`{member.id}`)\n"
                                                        f"**Action:** {action_name}\n"
                                                        f"**Inactive Period:** {days} days",
                                            color=0xEF4444,
                                            timestamp=datetime.datetime.now(datetime.timezone.utc)
                                        )
                                        embed.set_footer(text="Orbit Inactive Kick")
                                        await log_ch.send(embed=embed)
                                except Exception:
                                    pass

                            # Reset tracking for member
                            guild_activity.pop(member.id, None)
                            guild_warned.pop(member.id, None)

                        except discord.Forbidden:
                            pass
                        except Exception as act_err:
                            print(f"[InactiveKick] Action failed on member {member.id}: {act_err}")

            except Exception as guild_err:
                print(f"[InactiveKick] Error checking guild {guild.id}: {guild_err}")

    @check_loop.before_loop
    async def before_check_loop(self):
        await self.bot.wait_until_ready()

    @check_loop.error
    async def check_loop_error(self, error):
        print(f"[InactiveKick] Internal error in check_loop task: {error}")
        await asyncio.sleep(5)
        if not self.check_loop.is_running():
            try:
                self.check_loop.restart()
            except Exception:
                pass

async def setup(bot: commands.Bot):
    await bot.add_cog(InactiveKickListener(bot))
