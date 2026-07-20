import discord
import time
import datetime
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.AutoMod._storage import load_automod_config
from Commands.Warn._storage import add_warning, get_user_warnings
from Commands.Whitelist._storage import is_whitelisted
from Commands.Log._storage import log_event

class AutoModNoticeLayout(discord.ui.View):
    def __init__(self, user: discord.Member, reason: str, action_taken: str, warn_count: int, escalation_str: str = ""):
        super().__init__()

class AutoModListener(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.spam_cache = {}

    def _get_escalation(self, warn_count: int) -> tuple:
        if warn_count < 5:
            return None, ""
        elif warn_count == 5:
            return datetime.timedelta(days=1), "Timed out for 1 DAY (Reached 5 Warnings)"
        elif warn_count == 6:
            return datetime.timedelta(days=3), "Timed out for 3 DAYS (Reached 6 Warnings)"
        else:
            return datetime.timedelta(days=7), f"Timed out for 7 DAYS (Reached {warn_count} Warnings)"

    async def _apply_action(self, member: discord.Member, action: str, timeout_min: int, reason: str) -> str:
        """Apply a moderation action and return the escalation/description string."""
        escalation_str = ""
        warn_count = len(get_user_warnings(member.guild.id, member.id))

        if action == "warn":
            add_warning(member.guild.id, member.id, reason, self.bot.user.id)
            warn_count += 1
            if member.id != member.guild.owner_id:
                td = None
                if warn_count == 2:
                    td = datetime.timedelta(minutes=15)
                    escalation_str = "+15m Timeout (2 Warnings)"
                elif warn_count == 3:
                    td = datetime.timedelta(minutes=45)
                    escalation_str = "+45m Timeout (3 Warnings)"
                elif warn_count == 4:
                    td = datetime.timedelta(days=1)
                    escalation_str = "+1d Timeout (4 Warnings)"
                elif warn_count == 5:
                    td = datetime.timedelta(days=3)
                    escalation_str = "+3d Timeout (5 Warnings)"
                elif warn_count >= 6:
                    escalation_str = "Kicked & Warns Reset (6 Warnings)"
                    try:
                        await member.kick(reason=f"AutoMod: Reached {warn_count} warnings")
                        from Commands.Warn._storage import clear_user_warnings
                        clear_user_warnings(member.guild.id, member.id)
                    except Exception:
                        pass
                
                if td:
                    try:
                        new_until = discord.utils.utcnow() + td
                        if member.is_timed_out() and member.timed_out_until:
                            new_until = member.timed_out_until + td
                        
                        max_until = discord.utils.utcnow() + datetime.timedelta(days=28)
                        if new_until > max_until:
                            new_until = max_until
                            
                        await member.timeout(new_until, reason=f"AutoMod: {warn_count} warnings")
                    except Exception:
                        pass
        elif action == "timeout" and member.id != member.guild.owner_id:
            secs = timeout_min * 60
            td = datetime.timedelta(seconds=secs)
            escalation_str = f"Timed out for {timeout_min} minute(s)"
            try:
                await member.timeout(td, reason=reason)
            except Exception:
                pass
        elif action == "kick" and member.id != member.guild.owner_id:
            escalation_str = "Kicked from server"
            try:
                await member.kick(reason=reason)
            except Exception:
                pass
        elif action == "ban" and member.id != member.guild.owner_id:
            escalation_str = "Permanently banned"
            try:
                await member.ban(reason=reason, delete_message_days=0)
            except Exception:
                pass

        return escalation_str, warn_count

    @commands.Cog.listener()
    async def on_message(self, message: discord.Message):
        if not message.guild or message.author.bot:
            return

        if message.author.guild_permissions.administrator or message.author.guild_permissions.manage_guild:
            return

        if is_whitelisted(message.guild.id, message.author.id):
            return

        config = load_automod_config(message.guild.id)
        if not config.get("enabled", False):
            return

        global_channels = config.get("exempt_channels", [])
        global_roles = config.get("exempt_roles", [])
        if str(message.channel.id) in global_channels:
            return
        if any(str(r.id) in global_roles for r in message.author.roles):
            return

        content_lower = message.content.lower()
        
        def is_exempt(cfg):
            if str(message.channel.id) in cfg.get("exempt_channels", []):
                return True
            if any(str(r.id) in cfg.get("exempt_roles", []) for r in message.author.roles):
                return True
            return False
        
        async def do_action(cfg, reason, delete_msg=True):
            if delete_msg:
                try:
                    await message.delete()
                except Exception:
                    pass
            action = cfg.get("action", "warn")
            timeout_min = cfg.get("timeout_duration_min", 5)
            escalation_str, warn_count = await self._apply_action(message.author, action, timeout_min, reason)
            from Embeds import get_command_embed
            kwargs = get_command_embed(message.guild.id, "automod", msg_type="notice", user_mention=message.author.mention, user_id=message.author.id, reason=reason, action_taken=action, warn_count=warn_count, escalation_str=escalation_str)
            try:
                await message.channel.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())
            except Exception:
                pass
            try:
                await log_event(message.guild, "auto_moderation", "AutoMod Triggered", f"**User:** {message.author.mention}\n**Reason:** {reason}\n**Action Taken:** {action.upper()}\n**Escalation:** {escalation_str}", target_channel_obj=message.channel)
            except Exception:
                pass

        banned_cfg = config.get("banned_words", {})
        if banned_cfg.get("enabled", False) and not is_exempt(banned_cfg):
            words = banned_cfg.get("words", [])
            import re
            for w in words:
                w = w.strip()
                if not w: continue
                # Handle asterisk wildcards
                if w.startswith("*") and w.endswith("*"):
                    pattern = re.escape(w[1:-1])
                elif w.startswith("*"):
                    pattern = re.escape(w[1:]) + r"\b"
                elif w.endswith("*"):
                    pattern = r"\b" + re.escape(w[:-1])
                else:
                    pattern = r"\b" + re.escape(w) + r"\b"
                
                if re.search(pattern, content_lower):
                    await do_action(banned_cfg, "AutoMod: Banned word detected")
                    return

        invites_cfg = config.get("anti_invites", {})
        if invites_cfg.get("enabled", False) and not is_exempt(invites_cfg):
            invite_links = ["discord.gg/", "discord.com/invite/", "dsc.gg/", "invite.gg/"]
            if any(inv in content_lower for inv in invite_links):
                await do_action(invites_cfg, "AutoMod: Discord invite detected")
                return

        link_cfg = config.get("anti_link", {})
        if link_cfg.get("enabled", False) and not is_exempt(link_cfg):
            blocked = link_cfg.get("blocked_domains", [])

            if blocked:
                if any(domain in content_lower for domain in blocked if domain):
                    await do_action(link_cfg, "AutoMod: Unauthorized link detected")
                    return
            else:
                
                if "http://" in content_lower or "https://" in content_lower:
                    await do_action(link_cfg, "AutoMod: Unauthorized link detected")
                    return

        caps_cfg = config.get("anti_caps", {})
        if caps_cfg.get("enabled", False) and not is_exempt(caps_cfg):
            content_alpha = [c for c in message.content if c.isalpha()]
            if len(content_alpha) > 8:
                upper_count = sum(1 for c in content_alpha if c.isupper())
                if upper_count / len(content_alpha) > 0.7:
                    await do_action(caps_cfg, "AutoMod: Excessive caps detected")
                    return

        mention_cfg = config.get("mention_spam", {})
        if mention_cfg.get("enabled", False) and not is_exempt(mention_cfg):
            max_mentions = mention_cfg.get("max_mentions", 4)
            if len(message.mentions) >= max_mentions:
                await do_action(mention_cfg, f"AutoMod: Mass mentions detected ({len(message.mentions)})")
                return

        spam_cfg = config.get("anti_spam", {})
        if spam_cfg.get("enabled", False) and not is_exempt(spam_cfg):
            m_msgs = spam_cfg.get("max_messages", 5)
            t_win = spam_cfg.get("time_window_sec", 3)

            now = time.time()
            gid = message.guild.id
            uid = message.author.id
            if gid not in self.spam_cache:
                self.spam_cache[gid] = {}
            if uid not in self.spam_cache[gid]:
                self.spam_cache[gid][uid] = []

            self.spam_cache[gid][uid] = [t for t in self.spam_cache[gid][uid] if now - t <= t_win]
            self.spam_cache[gid][uid].append(now)

            if len(self.spam_cache[gid][uid]) >= m_msgs:
                self.spam_cache[gid][uid] = []
                await do_action(spam_cfg, f"AutoMod: Message flood ({m_msgs}+ messages in {t_win}s)")
                return

    @commands.Cog.listener()
    async def on_member_join(self, member: discord.Member):
        if not member.guild or member.bot:
            return

        if is_whitelisted(member.guild.id, member.id):
            return

        config = load_automod_config(member.guild.id)
        if not config.get("enabled", False):
            return

        alt_cfg = config["anti_alt"]
        if alt_cfg.get("enabled", False):
            min_days = alt_cfg.get("min_age_days", 3)
            now = datetime.datetime.now(datetime.timezone.utc)
            age_days = (now - member.created_at).days

            if age_days < min_days:
                action = alt_cfg.get("action", "kick")
                reason = f"AutoMod Anti-Alt: Account age ({age_days} days) < required minimum ({min_days} days)"

                if action == "kick":
                    try:
                        await member.send(f"You were automatically kicked from **{member.guild.name}** because your Discord account is too new (`{age_days} days old`, minimum: `{min_days} days`).")
                    except Exception:
                        pass
                    try:
                        await member.kick(reason=reason)
                    except Exception as e:
                        print(f"[AUTOMOD ERROR] Could not kick alt {member.id}: {e}")
                elif action == "ban":
                    try:
                        await member.send(f"You were automatically banned from **{member.guild.name}** because your Discord account is too new (`{age_days} days old`, minimum: `{min_days} days`).")
                    except Exception:
                        pass
                    try:
                        await member.ban(reason=reason, delete_message_days=0)
                    except Exception as e:
                        print(f"[AUTOMOD ERROR] Could not ban alt {member.id}: {e}")
                elif action == "verify":
                    from Commands.Verify._storage import load_verify_config
                    v_cfg = load_verify_config(member.guild.id)
                    unverified_role_id = v_cfg.get("remove_role_id") or v_cfg.get("unverified_role_id")
                    if unverified_role_id:
                        role = member.guild.get_role(int(unverified_role_id))
                        if role:
                            try:
                                await member.add_roles(role, reason=reason)
                            except Exception:
                                pass
                try:
                    await log_event(member.guild, "auto_moderation", "Anti-Alt Triggered", f"**User:** {member.mention}\n**Reason:** {reason}\n**Action Taken:** {action.upper()}")
                except Exception:
                    pass

async def setup(bot: commands.Bot):
    await bot.add_cog(AutoModListener(bot))

