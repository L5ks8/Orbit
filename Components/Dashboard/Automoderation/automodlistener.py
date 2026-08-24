import discord
import time
import datetime
from discord.ext import commands
from Components.Dashboard.Automoderation._storage import load_automod_config
from Components.Commands.Warn._storage import add_warning, get_user_warnings
from Components.Commands.Whitelist._storage import is_whitelisted
from Components.Dashboard.Automoderation.log_storage import log_event


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
                        from Components.Commands.Warn._storage import clear_user_warnings
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
        elif action == "softban" and member.id != member.guild.owner_id:
            escalation_str = "Softbanned (Banned and unbanned to delete messages)"
            try:
                await member.ban(reason=reason, delete_message_days=7)
                await member.unban(reason="AutoMod: Softban unban")
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
            embed = discord.Embed(title="Orbit AutoMod Triggered", color=discord.Color.orange())
            embed.add_field(name="Target", value=f"{message.author.mention} (`{message.author.id}`)", inline=False)
            embed.add_field(name="Reason", value=reason, inline=True)
            embed.add_field(name="Action Taken", value=f"`{action.upper()}` (Total Warnings: {warn_count})", inline=True)
            if escalation_str:
                embed.add_field(name="Escalation", value=f"`{escalation_str}`", inline=False)
            try:
                await message.channel.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())
            except Exception:
                pass
            try:
                await log_event(message.guild, "auto_moderation", "AutoMod Triggered", f"**User:** {message.author.mention}\n**Reason:** {reason}\n**Action Taken:** {action.upper()}\n**Escalation:** {escalation_str}", target_channel_obj=message.channel)
            except Exception:
                pass
            try:
                from Components.Commands.ModLog._modlog_storage import add_modlog
                add_modlog(message.guild.id, message.author.id, self.bot.user.id, f"AutoMod ({action.capitalize()})", reason)
            except Exception:
                pass

        banned_cfg = config.get("banned_words", {})
        if banned_cfg.get("enabled", False) and not is_exempt(banned_cfg):
            filter_level = banned_cfg.get("filter_level", "relaxed")
            allowed_words = banned_cfg.get("allowed_words", [])
            custom_words = banned_cfg.get("words", [])
            
            # Predefined word lists based on filter level
            profanity_basic = ["fuck", "shit", "bitch", "asshole", "cunt", "nigger", "nigga", "faggot", "whore", "slut", "dick", "cock", "pussy"]
            profanity_strict = profanity_basic + ["bastard", "motherfucker", "twat", "wanker", "prick", "retard", "dyke", "tranny", "kys", "kill yourself"]
            profanity_maximum = profanity_strict + ["crap", "damn", "ass", "piss", "boobs", "tits", "vagina", "penis", "cum", "jizz", "wank"]
            
            words_to_check = set(custom_words)
            if filter_level == "moderate":
                words_to_check.update(profanity_basic)
            elif filter_level == "strict":
                words_to_check.update(profanity_strict)
            elif filter_level == "maximum":
                words_to_check.update(profanity_maximum)
                
            safe_content_lower = content_lower
            for aw in allowed_words:
                if not aw.strip(): continue
                safe_content_lower = safe_content_lower.replace(aw.strip().lower(), " " * len(aw.strip()))

            import re
            for w in words_to_check:
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
                
                if re.search(pattern, safe_content_lower):
                    await do_action(banned_cfg, f"AutoMod: Banned word detected ({w})")
                    return

        invites_cfg = config.get("anti_invites", {})
        if invites_cfg.get("enabled", False) and not is_exempt(invites_cfg):
            invite_links = ["discord.gg/", "discord.com/invite/", "dsc.gg/", "invite.gg/"]
            if any(inv in content_lower for inv in invite_links):
                await do_action(invites_cfg, "AutoMod: Discord invite detected")
                return

        link_cfg = config.get("anti_link", {})
        if link_cfg.get("enabled", False) and not is_exempt(link_cfg):
            import re
            url_pattern = re.compile(r'https?://(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)')
            urls = url_pattern.findall(content_lower)
            
            if urls:
                allowed_domains = link_cfg.get("allowed_domains", [])
                blocked_domains = link_cfg.get("blocked_domains", [])
                allow_media = link_cfg.get("allow_media", False)
                allow_gifs = link_cfg.get("allow_gifs", False)
                
                if allow_media:
                    allowed_domains.extend(["cdn.discordapp.com", "media.discordapp.net"])
                if allow_gifs:
                    allowed_domains.extend(["tenor.com", "giphy.com"])
                
                for url in urls:
                    is_allowed = any(ad.strip() in url for ad in allowed_domains if ad.strip())
                    is_blocked = any(bd.strip() in url for bd in blocked_domains if bd.strip())
                    
                    if is_allowed:
                        continue
                        
                    if is_blocked or not blocked_domains:
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

            self.spam_cache[gid][uid] = [(t, m_id) for t, m_id in self.spam_cache[gid][uid] if now - t <= t_win]
            self.spam_cache[gid][uid].append((now, message.id))

            if len(self.spam_cache[gid][uid]) >= m_msgs:
                msg_ids = [m_id for t, m_id in self.spam_cache[gid][uid]]
                self.spam_cache[gid][uid] = []
                
                try:
                    messages_to_delete = [discord.Object(id=m_id) for m_id in msg_ids]
                    await message.channel.delete_messages(messages_to_delete)
                except Exception:
                    pass

                await do_action(spam_cfg, f"AutoMod: Message flood ({m_msgs}+ messages in {t_win}s)", delete_msg=False)
                return



    @commands.Cog.listener()
    async def on_member_join(self, member: discord.Member):
        if not member.guild:
            return

        config = load_automod_config(member.guild.id)
        if not config.get("enabled", False):
            return

        # Anti-Bot Add
        if member.bot:
            bot_cfg = config.get("anti_bot", {})
            if bot_cfg.get("enabled", False):
                from Components.Database.mongodb import get_config
                settings = get_config("Settings", member.guild.id) or {}
                bot_adders = settings.get("bot_adders", [])
                
                # Check audit logs for bot add
                try:
                    inviter = None
                    async for entry in member.guild.audit_logs(limit=5, action=discord.AuditLogAction.bot_add):
                        if entry.target.id == member.id:
                            inviter = entry.user
                            break
                    
                    if inviter:
                        if str(inviter.id) not in bot_adders and inviter.id != member.guild.owner_id:
                            # Kick the bot immediately
                            try:
                                await member.kick(reason="AutoMod: Anti-Bot Add triggered")
                            except:
                                pass
                            
                            # Punish the inviter
                            action = bot_cfg.get("action", "kick")
                            escalation_str, warn_count = await self._apply_action(inviter, action, 5, "AutoMod: Unauthorized bot invite")
                            embed = discord.Embed(title="Orbit AutoMod Triggered", color=discord.Color.orange())
                            embed.add_field(name="Target", value=f"{inviter.mention} (`{inviter.id}`)", inline=False)
                            embed.add_field(name="Reason", value="Unauthorized Bot Invite", inline=True)
                            embed.add_field(name="Action Taken", value=f"`{action.upper()}` (Total Warnings: {warn_count})", inline=True)
                            if escalation_str:
                                embed.add_field(name="Escalation", value=f"`{escalation_str}`", inline=False)
                            
                            try:
                                # Try to find a system channel to send notice to, or general
                                channel = member.guild.system_channel
                                if not channel:
                                    for c in member.guild.text_channels:
                                        if c.permissions_for(member.guild.me).send_messages:
                                            channel = c
                                            break
                                if channel:
                                    await channel.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())
                            except Exception:
                                pass
                            
                            try:
                                await log_event(member.guild, "auto_moderation", "AutoMod Triggered (Anti-Bot)", f"**User:** {inviter.mention}\n**Reason:** Unauthorized Bot Invite\n**Action Taken:** {action.upper()}\n**Escalation:** {escalation_str}")
                            except Exception:
                                pass
                except Exception as e:
                    print(f"Error checking anti-bot: {e}")

            return

        if is_whitelisted(member.guild.id, member.id):
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
                    from Components.Commands.Verify._storage import load_verify_config
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




