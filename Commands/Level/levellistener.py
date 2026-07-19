import time
import re
import discord
from discord.ext import commands, tasks
from Commands.Level._storage import (
    load_level_config, get_user_xp, set_user_xp, add_xp,
    increment_stat, level_from_xp, xp_progress,
    get_leaderboard, delete_user_xp
)

class LevelListenerCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        # Cooldown dicts: {guild_id: {user_id: timestamp}}
        self._msg_cooldowns = {}
        self._cmd_cooldowns = {}
        self._react_cooldowns = {}
        # Voice tracking: {guild_id: {user_id: join_timestamp}}
        self._voice_join_times = {}
        self.voice_xp_loop.start()
        self.leaderboard_loop.start()

    def cog_unload(self):
        self.voice_xp_loop.cancel()
        self.leaderboard_loop.cancel()

    def _check_cooldown(self, cooldowns: dict, guild_id: int, user_id: int, cooldown_seconds: int) -> bool:
        key = (guild_id, user_id)
        now = time.time()
        if key in cooldowns and now - cooldowns[key] < cooldown_seconds:
            return False
        cooldowns[key] = now
        return True

    def _is_blocked(self, config: dict, channel_id: int, member: discord.Member) -> bool:
        ch_mode = config.get("channel_mode", "blacklist")
        blocked_channels = config.get("blocked_channels", [])
        if ch_mode == "blacklist" and str(channel_id) in blocked_channels:
            return True
        if ch_mode == "whitelist" and str(channel_id) not in blocked_channels:
            return True

        ro_mode = config.get("role_mode", "blacklist")
        blocked_roles = config.get("blocked_roles", [])
        member_role_ids = [str(r.id) for r in member.roles]
        if ro_mode == "blacklist":
            if any(rid in blocked_roles for rid in member_role_ids):
                return True
        elif ro_mode == "whitelist":
            if not any(rid in blocked_roles for rid in member_role_ids):
                return True
        return False

    def _calculate_multiplier(self, config: dict, member: discord.Member, channel_id: int) -> float:
        base = config.get("xp_multiplier", 1.0)
        role_boosters = config.get("role_boosters", [])
        channel_boosters = config.get("channel_boosters", [])
        stack = config.get("role_boosters_stack", True)

        member_role_ids = [str(r.id) for r in member.roles]
        role_mult = 0
        for b in role_boosters:
            if b.get("role_id") in member_role_ids:
                if stack:
                    role_mult += (b.get("multiplier", 1) - 1)
                else:
                    role_mult = max(role_mult, b.get("multiplier", 1) - 1)

        ch_mult = 0
        for b in channel_boosters:
            if str(channel_id) == b.get("channel_id"):
                ch_mult = max(ch_mult, b.get("multiplier", 1) - 1)

        return base * (1 + role_mult + ch_mult)

    async def _handle_level_up(self, member: discord.Member, channel: discord.TextChannel, old_level: int, new_level: int, config: dict):
        if old_level >= new_level:
            return

        guild = member.guild
        earned_roles = []

        # Assign level roles
        level_roles = config.get("level_roles", [])
        stack = config.get("level_roles_stack", False)
        roles_to_add = []
        roles_to_remove = []

        for lr in sorted(level_roles, key=lambda x: int(x.get("level", 0))):
            lr_level = int(lr.get("level", 0))
            role = guild.get_role(int(lr.get("role_id", 0)))
            if not role:
                continue
            if lr_level <= new_level:
                if role not in member.roles:
                    roles_to_add.append(role)
                    earned_roles.append(role.mention)
                if not stack and lr_level < new_level:
                    # Remove lower level roles if not stacking
                    pass
            elif not stack and role in member.roles:
                roles_to_remove.append(role)

        if not stack:
            # Only keep the highest level role
            highest_role = None
            for lr in sorted(level_roles, key=lambda x: int(x.get("level", 0)), reverse=True):
                lr_level = int(lr.get("level", 0))
                if lr_level <= new_level:
                    role = guild.get_role(int(lr.get("role_id", 0)))
                    if role:
                        highest_role = role
                        break
            for lr in level_roles:
                role = guild.get_role(int(lr.get("role_id", 0)))
                if role and role in member.roles and role != highest_role:
                    roles_to_remove.append(role)

        try:
            if roles_to_add:
                await member.add_roles(*roles_to_add, reason="Level Up")
            if roles_to_remove:
                await member.remove_roles(*roles_to_remove, reason="Level System: Role Cleanup")
        except Exception:
            pass

        # Send level up message
        content = config.get("levelup_message_content", "{user_mention}")
        title = config.get("levelup_embed_title", "🎉 Level Up!")
        desc = config.get("levelup_embed_description", "")
        author = config.get("levelup_embed_author", "")
        footer = config.get("levelup_embed_footer", "")
        image = config.get("levelup_embed_image", "")
        show_avatar = config.get("levelup_show_avatar", True)
        conditional = config.get("levelup_conditional", "")

        # Variable replacement
        def replace_vars(text):
            text = text.replace("{user_mention}", member.mention)
            text = text.replace("{user_globalname}", member.global_name or member.display_name)
            text = text.replace("{level}", str(new_level))
            text = text.replace("{roles}", ", ".join(earned_roles) if earned_roles else "None")
            return text

        content = replace_vars(content)
        title = replace_vars(title)
        desc = replace_vars(desc)

        # Parse conditional messages
        if conditional:
            # {earned: text} - shown only when roles are earned
            earned_matches = re.findall(r'\{earned:\s*(.+?)\}', conditional)
            if earned_matches and earned_roles:
                for m in earned_matches:
                    desc += "\n" + replace_vars(m)

            # {level[X]: text} - shown only at level X
            level_matches = re.findall(r'\{level\[(\d+)\]:\s*(.+?)\}', conditional)
            for lvl_str, text in level_matches:
                if int(lvl_str) == new_level:
                    desc += "\n" + replace_vars(text)

        embed = discord.Embed(title=title, description=desc, color=0x3B82F6)
        if author:
            embed.set_author(name=replace_vars(author))
        if footer:
            embed.set_footer(text=replace_vars(footer))
        if image:
            embed.set_image(url=image)
        if show_avatar:
            embed.set_thumbnail(url=member.display_avatar.url)

        # Determine target channel
        target_ch_setting = config.get("levelup_channel", "current")
        target_ch = channel
        if target_ch_setting != "current":
            try:
                ch = guild.get_channel(int(target_ch_setting))
                if ch:
                    target_ch = ch
            except (ValueError, TypeError):
                pass

        try:
            await target_ch.send(content=content, embed=embed)
        except Exception:
            pass

    async def _check_stat_roles(self, member: discord.Member, stat_type: str, new_value: int, config: dict):
        stat_key = f"stat_roles_{stat_type}"
        stat_roles = config.get(stat_key, [])
        stack = config.get(f"{stat_key}_stack", False)

        guild = member.guild
        roles_to_add = []
        roles_to_remove = []

        for sr in sorted(stat_roles, key=lambda x: int(x.get("count", 0))):
            count = int(sr.get("count", 0))
            role = guild.get_role(int(sr.get("role_id", 0)))
            if not role:
                continue
            if new_value >= count:
                if role not in member.roles:
                    roles_to_add.append(role)
            elif not stack and role in member.roles:
                roles_to_remove.append(role)

        if not stack:
            highest_role = None
            for sr in sorted(stat_roles, key=lambda x: int(x.get("count", 0)), reverse=True):
                if new_value >= int(sr.get("count", 0)):
                    role = guild.get_role(int(sr.get("role_id", 0)))
                    if role:
                        highest_role = role
                        break
            for sr in stat_roles:
                role = guild.get_role(int(sr.get("role_id", 0)))
                if role and role in member.roles and role != highest_role:
                    roles_to_remove.append(role)

        try:
            if roles_to_add:
                await member.add_roles(*roles_to_add, reason=f"Stat Role ({stat_type})")
            if roles_to_remove:
                await member.remove_roles(*roles_to_remove, reason=f"Stat Role Cleanup ({stat_type})")
        except Exception:
            pass

    # ─── Message XP ───────────────────────────────────────────────────────────
    @commands.Cog.listener()
    async def on_message(self, message: discord.Message):
        if message.author.bot or not message.guild:
            return

        config = load_level_config(message.guild.id)
        if not config.get("enabled", False) or not config.get("msg_xp_enabled", True):
            return

        member = message.author
        if self._is_blocked(config, message.channel.id, member):
            return

        cooldown = config.get("msg_xp_cooldown", 60)
        if not self._check_cooldown(self._msg_cooldowns, message.guild.id, member.id, cooldown):
            return

        amount = config.get("msg_xp_amount", 20)
        multiplier = self._calculate_multiplier(config, member, message.channel.id)
        xp_earned = int(amount * multiplier)

        old_level, new_level, _ = add_xp(message.guild.id, member.id, xp_earned)
        increment_stat(message.guild.id, member.id, "message_count")

        if new_level > old_level:
            await self._handle_level_up(member, message.channel, old_level, new_level, config)

        # Check stat roles
        data = get_user_xp(message.guild.id, member.id)
        await self._check_stat_roles(member, "msg", data.get("message_count", 0), config)

    # ─── Reaction XP ──────────────────────────────────────────────────────────
    @commands.Cog.listener()
    async def on_raw_reaction_add(self, payload: discord.RawReactionActionEvent):
        if not payload.guild_id or payload.member is None or payload.member.bot:
            return

        config = load_level_config(payload.guild_id)
        if not config.get("enabled", False) or not config.get("react_xp_enabled", True):
            return

        member = payload.member
        if self._is_blocked(config, payload.channel_id, member):
            return

        cooldown = config.get("react_xp_cooldown", 300)
        if not self._check_cooldown(self._react_cooldowns, payload.guild_id, member.id, cooldown):
            return

        amount = config.get("react_xp_amount", 15)
        multiplier = self._calculate_multiplier(config, member, payload.channel_id)
        xp_earned = int(amount * multiplier)

        old_level, new_level, _ = add_xp(payload.guild_id, member.id, xp_earned)
        increment_stat(payload.guild_id, member.id, "reaction_count")

        if new_level > old_level:
            channel = self.bot.get_channel(payload.channel_id)
            if channel:
                await self._handle_level_up(member, channel, old_level, new_level, config)

        data = get_user_xp(payload.guild_id, member.id)
        await self._check_stat_roles(member, "react", data.get("reaction_count", 0), config)

    # ─── Voice XP (loop every 60s) ────────────────────────────────────────────
    @commands.Cog.listener()
    async def on_voice_state_update(self, member: discord.Member, before: discord.VoiceState, after: discord.VoiceState):
        if member.bot:
            return

        config = load_level_config(member.guild.id)
        if not config.get("enabled", False) or not config.get("voice_xp_enabled", False):
            return

        guild_id = member.guild.id
        if guild_id not in self._voice_join_times:
            self._voice_join_times[guild_id] = {}

        # User joined a voice channel
        if before.channel is None and after.channel is not None:
            self._voice_join_times[guild_id][member.id] = time.time()

        # User left a voice channel
        elif before.channel is not None and after.channel is None:
            self._voice_join_times[guild_id].pop(member.id, None)

    @tasks.loop(seconds=60)
    async def voice_xp_loop(self):
        for guild in self.bot.guilds:
            config = load_level_config(guild.id)
            if not config.get("enabled", False) or not config.get("voice_xp_enabled", False):
                continue

            ignore_muted = config.get("voice_xp_ignore_muted", True)
            ignore_solo = config.get("voice_xp_ignore_solo", False)
            amount = config.get("voice_xp_amount", 6)

            for vc in guild.voice_channels:
                human_members = [m for m in vc.members if not m.bot]

                for member in human_members:
                    if ignore_muted and (member.voice.self_mute or member.voice.self_deaf or member.voice.mute or member.voice.deaf):
                        continue
                    if ignore_solo and len(human_members) < 2:
                        continue
                    if self._is_blocked(config, vc.id, member):
                        continue

                    multiplier = self._calculate_multiplier(config, member, vc.id)
                    xp_earned = int(amount * multiplier)

                    old_level, new_level, _ = add_xp(guild.id, member.id, xp_earned)
                    increment_stat(guild.id, member.id, "voice_minutes")

                    if new_level > old_level:
                        # Find a text channel to send level up
                        ch_setting = config.get("levelup_channel", "current")
                        target_ch = guild.system_channel or (guild.text_channels[0] if guild.text_channels else None)
                        if ch_setting != "current":
                            try:
                                ch = guild.get_channel(int(ch_setting))
                                if ch:
                                    target_ch = ch
                            except (ValueError, TypeError):
                                pass
                        if target_ch:
                            await self._handle_level_up(member, target_ch, old_level, new_level, config)

                    data = get_user_xp(guild.id, member.id)
                    await self._check_stat_roles(member, "voice", data.get("voice_minutes", 0), config)

    @voice_xp_loop.before_loop
    async def before_voice_xp_loop(self):
        await self.bot.wait_until_ready()

    # ─── Reset on Leave / Ban ─────────────────────────────────────────────────
    @commands.Cog.listener()
    async def on_member_remove(self, member: discord.Member):
        config = load_level_config(member.guild.id)
        if config.get("reset_on_leave", False):
            delete_user_xp(member.guild.id, member.id)

    @commands.Cog.listener()
    async def on_member_ban(self, guild: discord.Guild, user: discord.User):
        config = load_level_config(guild.id)
        if config.get("reset_on_ban", False):
            delete_user_xp(guild.id, user.id)

    # ─── Rejoin Role Restore ──────────────────────────────────────────────────
    @commands.Cog.listener()
    async def on_member_join(self, member: discord.Member):
        if member.bot:
            return

        config = load_level_config(member.guild.id)
        if not config.get("enabled", False) or not config.get("level_roles_rejoin", False):
            return

        data = get_user_xp(member.guild.id, member.id)
        if not data or data.get("total_xp", 0) == 0:
            return

        level = level_from_xp(data["total_xp"])
        level_roles = config.get("level_roles", [])
        stack = config.get("level_roles_stack", False)

        roles_to_add = []
        if stack:
            for lr in level_roles:
                if int(lr.get("level", 0)) <= level:
                    role = member.guild.get_role(int(lr.get("role_id", 0)))
                    if role:
                        roles_to_add.append(role)
        else:
            # Only the highest
            for lr in sorted(level_roles, key=lambda x: int(x.get("level", 0)), reverse=True):
                if int(lr.get("level", 0)) <= level:
                    role = member.guild.get_role(int(lr.get("role_id", 0)))
                    if role:
                        roles_to_add.append(role)
                        break

        if roles_to_add:
            try:
                await member.add_roles(*roles_to_add, reason="Level System: Rejoin Role Restore")
            except Exception:
                pass

    # ─── Hourly Leaderboard ───────────────────────────────────────────────────
    @tasks.loop(hours=1)
    async def leaderboard_loop(self):
        for guild in self.bot.guilds:
            config = load_level_config(guild.id)
            if not config.get("enabled", False):
                continue

            lb_channel_id = config.get("leaderboard_channel", "")
            if not lb_channel_id:
                continue

            try:
                channel = guild.get_channel(int(lb_channel_id))
            except (ValueError, TypeError):
                continue

            if not channel:
                continue

            top = get_leaderboard(guild.id, 10)
            if not top:
                continue

            color_hex = config.get("leaderboard_color", "#3B82F6")
            try:
                color = int(color_hex.lstrip("#"), 16)
            except ValueError:
                color = 0x3B82F6

            desc_lines = []
            for i, entry in enumerate(top, 1):
                uid = entry.get("user_id")
                xp = entry.get("total_xp", 0)
                lvl = level_from_xp(xp)
                member = guild.get_member(uid)
                name = member.display_name if member else f"User#{uid}"
                medal = ["🥇", "🥈", "🥉"][i-1] if i <= 3 else f"`#{i}`"
                desc_lines.append(f"{medal} **{name}** — Level {lvl} • {xp:,} XP")

            embed = discord.Embed(
                title="🏆 XP Leaderboard",
                description="\n".join(desc_lines),
                color=color
            )
            embed.set_footer(text=f"Updated hourly • {guild.name}")

            try:
                await channel.send(embed=embed)
            except Exception:
                pass

    @leaderboard_loop.before_loop
    async def before_leaderboard_loop(self):
        await self.bot.wait_until_ready()


async def setup(bot: commands.Bot):
    await bot.add_cog(LevelListenerCog(bot))
