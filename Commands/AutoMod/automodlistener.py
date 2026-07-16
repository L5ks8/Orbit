import discord
import time
import datetime
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Database.storagehandler import load_automod_config
from Database.storagehandler import add_warning, get_user_warnings
from Database.storagehandler import is_whitelisted

class AutoModNoticeLayout(LayoutView):
    def __init__(self, user: discord.Member, reason: str, action_taken: str, warn_count: int, escalation_str: str = ""):
        super().__init__()
        header = f"### Orbit AutoMod Triggered\n**Target:** {user.mention} (`{user.id}`)"
        body = f"**Reason:** {reason}\n**Action Taken:** `{action_taken.upper()}` (`Total Warnings: {warn_count}`)"
        if escalation_str:
            body += f"\n**Escalation:** `{escalation_str}`"

        self.container = Container(
            TextDisplay(content=header),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=body)
        )
        self.add_item(self.container)


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

    @commands.Cog.listener()
    async def on_message(self, message: discord.Message):
        if not message.guild or message.author.bot:
            return

        if is_whitelisted(message.guild.id, message.author.id):
            return

        config = await load_automod_config(message.guild.id)
        if not config.get("enabled", False):
            return

        link_cfg = config["anti_link"]
        if link_cfg.get("enabled", False):
            content_lower = message.content.lower()
            if any(domain in content_lower for domain in ["discord.gg/", "discord.com/invite/", "dsc.gg/", "invite.gg/"]):
                try:
                    await message.delete()
                except Exception:
                    pass

                reason = "AutoMod: Unauthorized Discord invite link posted"
                action = link_cfg.get("action", "warn")
                warn_count = len(get_user_warnings(message.guild.id, message.author.id))
                escalation_str = ""

                if action == "warn":
                    add_warning(message.guild.id, message.author.id, reason, self.bot.user.id)
                    warn_count += 1
                    td, escalation_str = self._get_escalation(warn_count)
                    if td and isinstance(message.author, discord.Member) and message.author.id != message.guild.owner_id:
                        try:
                            await message.author.timeout(td, reason=reason)
                        except Exception:
                            pass
                elif action == "timeout" and isinstance(message.author, discord.Member) and message.author.id != message.guild.owner_id:
                    td = datetime.timedelta(seconds=300)
                    escalation_str = "Timed out for 5 minutes"
                    try:
                        await message.author.timeout(td, reason=reason)
                    except Exception:
                        pass

                view = AutoModNoticeLayout(message.author, reason, action, warn_count, escalation_str)
                try:
                    await message.channel.send(view=view, allowed_mentions=discord.AllowedMentions.none())
                except Exception:
                    pass
                return

        spam_cfg = config["anti_spam"]
        if spam_cfg.get("enabled", False):
            m_mentions = spam_cfg.get("max_mentions", 4)
            m_msgs = spam_cfg.get("max_messages", 5)
            t_win = spam_cfg.get("time_window_sec", 3)

            is_mass_mention = len(message.mentions) >= m_mentions
            is_flood = False

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
                is_flood = True
                self.spam_cache[gid][uid] = []

            if is_mass_mention or is_flood:
                try:
                    await message.delete()
                except Exception:
                    pass

                reason = "AutoMod: Mass mentions detected" if is_mass_mention else f"AutoMod: Message flood across channels ({m_msgs}+ messages in {t_win}s)"
                action = spam_cfg.get("action", "warn")
                warn_count = len(get_user_warnings(message.guild.id, message.author.id))
                escalation_str = ""

                if action == "warn":
                    add_warning(message.guild.id, message.author.id, reason, self.bot.user.id)
                    warn_count += 1
                    td, escalation_str = self._get_escalation(warn_count)
                    if td and isinstance(message.author, discord.Member) and message.author.id != message.guild.owner_id:
                        try:
                            await message.author.timeout(td, reason=reason)
                        except Exception:
                            pass
                elif action == "timeout" and isinstance(message.author, discord.Member) and message.author.id != message.guild.owner_id:
                    t_sec = spam_cfg.get("timeout_duration_sec", 300)
                    td = datetime.timedelta(seconds=t_sec)
                    escalation_str = f"Timed out for {t_sec // 60} minutes"
                    try:
                        await message.author.timeout(td, reason=reason)
                    except Exception:
                        pass

                view = AutoModNoticeLayout(message.author, reason, action, warn_count, escalation_str)
                try:
                    await message.channel.send(view=view, allowed_mentions=discord.AllowedMentions.none())
                except Exception:
                    pass
                return

    @commands.Cog.listener()
    async def on_member_join(self, member: discord.Member):
        if not member.guild or member.bot:
            return

        if is_whitelisted(member.guild.id, member.id):
            return

        config = await load_automod_config(member.guild.id)
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
                        await member.send(f"You were automatically kicked from **{member.guild.name}** because your Discord account is too new (`{age_days} days old`, minimum required: `{min_days} days`).")
                    except Exception:
                        pass
                    try:
                        await member.kick(reason=reason)
                        print(f"[AUTOMOD] Kicked suspicious alt {member} ({member.id}) from {member.guild.name} (Age: {age_days}d)")
                    except Exception as e:
                        print(f"[AUTOMOD ERROR] Could not kick alt {member.id}: {e}")
                elif action == "verify":
                    from Database.storagehandler import load_verify_config
                    v_cfg = load_verify_config(member.guild.id)
                    unverified_role_id = v_cfg.get("unverified_role_id")
                    if unverified_role_id:
                        role = member.guild.get_role(unverified_role_id)
                        if role:
                            try:
                                await member.add_roles(role, reason=reason)
                            except Exception:
                                pass

async def setup(bot: commands.Bot):
    await bot.add_cog(AutoModListener(bot))
