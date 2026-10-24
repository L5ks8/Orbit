import time
import asyncio
import discord
from discord.ext import commands, tasks
from Components.Commands.Invite._storage import (
    get_invite_cache, set_invite_cache, refresh_invite_cache,
    record_invite, get_invite_info, get_inviter_stats, get_leaderboard,
    remove_invite_record
)
from Components.Systems.Automoderation.log_storage import log_event
from Components.Database.mongodb import get_config, set_config


INTERVAL_SECONDS = {
    "5m": 300,
    "15m": 900,
    "30m": 1800,
    "1h": 3600,
    "6h": 21600,
    "12h": 43200,
    "24h": 86400,
}


def parse_embed_color(color_str: str) -> discord.Color:
    if not color_str:
        return discord.Color(0x5865F2)
    s = str(color_str).strip()
    if s.startswith("#"):
        try:
            return discord.Color(int(s.lstrip("#"), 16))
        except Exception:
            return discord.Color(0x5865F2)
    if s.startswith("rgb"):
        try:
            inner = s[s.find("(") + 1:s.find(")")]
            parts = [int(x.strip()) for x in inner.split(",")[:3]]
            return discord.Color.from_rgb(parts[0], parts[1], parts[2])
        except Exception:
            return discord.Color(0x5865F2)
    return discord.Color(0x5865F2)


def build_invite_leaderboard_embed(guild: discord.Guild, bot: commands.Bot, auto_post_cfg: dict, show_inviter_count: bool = True) -> discord.Embed:
    title = str(auto_post_cfg.get("title") or "Invite Leaderboard").strip() or "Invite Leaderboard"
    color = parse_embed_color(auto_post_cfg.get("color", "#5865F2"))
    top_limit = int(auto_post_cfg.get("top_limit", 10) or 10)
    show_podium = bool(auto_post_cfg.get("show_podium", True))
    show_numbers = bool(auto_post_cfg.get("show_numbers", True))

    lb = get_leaderboard(guild.id, limit=max(top_limit, 5))

    embed = discord.Embed(title=title, color=color)
    if guild.icon:
        embed.set_thumbnail(url=guild.icon.url)

    if not lb:
        embed.description = "*Noch keine Einladungen aufgezeichnet. Lade Freunde ein, um auf dem Podium zu erscheinen!*"
        embed.set_footer(text=f"{guild.name} • Einladungs-Tracker")
        return embed

    lines = []
    if show_podium:
        podium_medals = ["🥇", "🥈", "🥉"]
        podium_lines = []
        for idx, entry in enumerate(lb[:3]):
            uid = entry.get("user_id")
            member = guild.get_member(int(uid)) if (uid and str(uid).isdigit()) else None
            name_str = member.mention if member else f"<@{uid}>"
            if show_numbers and show_inviter_count:
                podium_lines.append(
                    f"{podium_medals[idx]} {name_str} — **{entry.get('total', 0)}** Einladungen "
                    f"*(+{entry.get('regular', 0)} regulär, -{entry.get('left', 0)} verlassen)*"
                )
            else:
                podium_lines.append(f"{podium_medals[idx]} {name_str}")
        if podium_lines:
            lines.append("**🏆 Top Podium**\n" + "\n".join(podium_lines))
            if len(lb) > 3 and top_limit > 3:
                lines.append("")

    start_idx = 3 if show_podium else 0
    rest_lines = []
    for idx, entry in enumerate(lb[start_idx:top_limit], start=start_idx + 1):
        uid = entry.get("user_id")
        member = guild.get_member(int(uid)) if (uid and str(uid).isdigit()) else None
        name_str = member.mention if member else f"<@{uid}>"
        if show_numbers and show_inviter_count:
            rest_lines.append(
                f"`#{idx}` {name_str} — **{entry.get('total', 0)}** Einladungen "
                f"*(+{entry.get('regular', 0)} / -{entry.get('left', 0)})*"
            )
        else:
            rest_lines.append(f"`#{idx}` {name_str}")

    if rest_lines:
        lines.append("\n".join(rest_lines))

    embed.description = "\n".join(lines)
    embed.set_footer(text=f"{guild.name} • Top {min(len(lb), top_limit)} Einlader")
    return embed


class InviteTrackerListener(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.auto_post_loop.start()

    def cog_unload(self):
        self.auto_post_loop.cancel()

    @tasks.loop(minutes=1)
    async def auto_post_loop(self):
        now = time.time()
        for guild in list(self.bot.guilds):
            try:
                inv_cfg = await asyncio.to_thread(get_config, "InviteConfig", guild.id)
                if not inv_cfg or not inv_cfg.get("enabled", True):
                    await asyncio.sleep(0.01)
                    continue
                auto_post = inv_cfg.get("auto_post") or {}
                if not auto_post.get("enabled"):
                    await asyncio.sleep(0.01)
                    continue
                cid = auto_post.get("channel_id")
                if not cid or not str(cid).isdigit():
                    await asyncio.sleep(0.01)
                    continue
                interval_str = str(auto_post.get("interval", "1h"))
                interval_sec = INTERVAL_SECONDS.get(interval_str, 3600)
                last_post = float(auto_post.get("last_posted_at", 0) or 0)
                if now - last_post < interval_sec:
                    await asyncio.sleep(0.01)
                    continue

                channel = guild.get_channel(int(cid))
                if not channel:
                    continue

                embed = build_invite_leaderboard_embed(
                    guild,
                    self.bot,
                    auto_post,
                    show_inviter_count=bool(inv_cfg.get("show_inviter_count", True))
                )
                msg = await channel.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())
                auto_post["last_posted_at"] = now
                auto_post["last_message_id"] = str(msg.id)
                inv_cfg["auto_post"] = auto_post
                await asyncio.to_thread(set_config, "InviteConfig", guild.id, inv_cfg)
            except Exception:
                pass
            await asyncio.sleep(0.05)

    @auto_post_loop.before_loop
    async def before_auto_post_loop(self):
        await self.bot.wait_until_ready()

    @commands.Cog.listener()
    async def on_ready(self):
        for guild in self.bot.guilds:
            await refresh_invite_cache(guild)

    @commands.Cog.listener()
    async def on_guild_join(self, guild: discord.Guild):
        await refresh_invite_cache(guild)

    @commands.Cog.listener()
    async def on_invite_create(self, invite: discord.Invite):
        if invite.guild:
            await refresh_invite_cache(invite.guild)

            await log_event(
                invite.guild,
                "invite_created",
                "Invite Created",
                f"**Inviter:** {invite.inviter.mention if invite.inviter else 'Unknown'} (`{invite.inviter.id if invite.inviter else 'Unknown'}`)\n"
                f"**Code:** `{invite.code}`\n"
                f"**Channel:** {invite.channel.mention if invite.channel else 'Unknown'}\n"
                f"**Max Uses:** {invite.max_uses if invite.max_uses else 'Unlimited'}\n"
                f"**Max Age:** {invite.max_age if invite.max_age else 'Unlimited'} seconds\n"
                f"**Temporary:** {'Yes' if invite.temporary else 'No'}",
                executor=invite.inviter
            )

    @commands.Cog.listener()
    async def on_invite_delete(self, invite: discord.Invite):
        if invite.guild:
            await refresh_invite_cache(invite.guild)

    @commands.Cog.listener()
    async def on_member_join(self, member: discord.Member):
        guild = member.guild
        if member.bot:
            return

        inv_cfg = get_config("InviteConfig", guild.id) or {}
        if not inv_cfg.get("enabled", True):
            return

        old_cache = get_invite_cache(guild.id)

        try:
            current_invites = await guild.invites()
        except discord.Forbidden:
            return
        except Exception:
            return

        new_cache = {}
        for inv in current_invites:
            new_cache[inv.code] = inv.uses or 0

        used_invite = None
        inviter = None
        for inv in current_invites:
            old_uses = old_cache.get(inv.code, 0)
            new_uses = inv.uses or 0
            if new_uses > old_uses:
                used_invite = inv
                inviter = inv.inviter
                break

        set_invite_cache(guild.id, new_cache)

        if used_invite and inviter:
            prev_info = get_invite_info(guild.id, member.id)
            count_rejoins = bool(inv_cfg.get("count_rejoins", False))
            if not prev_info or count_rejoins or prev_info.get("left", False):
                record_invite(guild.id, member.id, inviter.id, used_invite.code)

            # Check and assign milestone role rewards
            rewards = inv_cfg.get("rewards", [])
            if isinstance(rewards, list) and rewards:
                try:
                    stats = get_inviter_stats(guild.id, inviter.id)
                    total_invites = stats.get("total", 0)
                    inviter_member = guild.get_member(inviter.id)
                    if inviter_member:
                        for rw in rewards:
                            if not isinstance(rw, dict):
                                continue
                            req = int(rw.get("invites", 0) or 0)
                            rid = rw.get("role_id")
                            if req > 0 and rid and str(rid).isdigit() and total_invites >= req:
                                role_obj = guild.get_role(int(rid))
                                if role_obj and role_obj not in inviter_member.roles:
                                    try:
                                        await inviter_member.add_roles(
                                            role_obj,
                                            reason=f"Orbit Invite Milestone ({req} Invites)"
                                        )
                                    except Exception:
                                        pass
                except Exception:
                    pass

            await log_event(
                guild,
                "invite_tracking",
                "Member Joined via Invite",
                f"**Member:** {member.mention} (`{member.id}`)\n"
                f"**Invited by:** {inviter.mention} (`{inviter.id}`)\n"
                f"**Invite Code:** `{used_invite.code}`\n"
                f"**Invite Uses:** {used_invite.uses}"
            )
        elif inv_cfg.get("count_vanity", False) and getattr(guild, "vanity_url_code", None):
            record_invite(guild.id, member.id, 0, guild.vanity_url_code)

    @commands.Cog.listener()
    async def on_member_remove(self, member: discord.Member):
        inv_cfg = get_config("InviteConfig", member.guild.id) or {}
        if not inv_cfg.get("enabled", True):
            return
        if inv_cfg.get("track_leaves", True):
            remove_invite_record(member.guild.id, member.id)


async def setup(bot: commands.Bot):
    await bot.add_cog(InviteTrackerListener(bot))
