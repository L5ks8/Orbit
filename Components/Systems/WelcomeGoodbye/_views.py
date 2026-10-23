import discord
from datetime import datetime, timezone
from Components.Systems.WelcomeGoodbye._storage import set_welcome_status


def _format_duration(dt: datetime | None) -> str:
    if not dt:
        return "just now"
    now = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    diff = max(0, int((now - dt).total_seconds()))
    days = diff // 86400
    if days >= 365:
        years = days // 365
        return f"{years} year{'s' if years != 1 else ''}"
    if days >= 30:
        months = days // 30
        return f"{months} month{'s' if months != 1 else ''}"
    if days >= 1:
        return f"{days} day{'s' if days != 1 else ''}"
    hours = diff // 3600
    if hours >= 1:
        return f"{hours} hour{'s' if hours != 1 else ''}"
    minutes = max(1, diff // 60)
    return f"{minutes} minute{'s' if minutes != 1 else ''}"


def _build_replacements(member: discord.Member) -> dict:
    guild = getattr(member, "guild", None)
    count = (guild.member_count or len(guild.members)) if guild else 0
    server_name = guild.name if guild else "Server"
    server_id = str(guild.id) if guild else "0"
    server_icon = (guild.icon.url if guild.icon else "") if guild else ""
    user_mention = getattr(member, "mention", f"@{getattr(member, 'name', 'User')}")
    username = getattr(member, "name", "User")
    user_id = str(getattr(member, "id", "0"))
    user_avatar = member.display_avatar.url if getattr(member, "display_avatar", None) else ""
    user_tag = str(member)
    display_name = getattr(member, "display_name", None) or getattr(member, "global_name", None) or username

    account_age = _format_duration(getattr(member, "created_at", None))
    time_in_server = _format_duration(getattr(member, "joined_at", None))

    inviter_mention = "Unknown"
    inviter_name = "Unknown"
    inviter_count = "0"
    invite_code = "discord.gg"
    invite_url = f"https://discord.gg/{guild.vanity_url_code}" if (guild and getattr(guild, "vanity_url_code", None)) else "discord.gg"

    if guild:
        try:
            from Components.Database.mongodb import get_db
            db = get_db()
            join_doc = db["InviteJoins"].find_one({"guild_id": guild.id, "member_id": getattr(member, "id", 0)})
            if join_doc:
                inv_id = join_doc.get("inviter_id")
                if join_doc.get("invite_code"):
                    invite_code = str(join_doc.get("invite_code"))
                    invite_url = f"https://discord.gg/{invite_code}"
                if inv_id:
                    inviter_mention = f"<@{inv_id}>"
                    inv_mem = guild.get_member(int(inv_id))
                    if inv_mem:
                        inviter_name = inv_mem.display_name or inv_mem.name
                    inv_stats = db["Invites"].find_one({"guild_id": guild.id, "user_id": int(inv_id)})
                    if inv_stats:
                        total_inv = int(inv_stats.get("regular", 0)) + int(inv_stats.get("bonus", 0)) - int(inv_stats.get("left", 0)) - int(inv_stats.get("fake", 0))
                        inviter_count = str(max(0, total_inv))
        except Exception:
            pass

    return {
        "{user}": user_mention,
        "{user.mention}": user_mention,
        "{user.name}": username,
        "{user.displayName}": display_name,
        "{user.id}": user_id,
        "{user.avatar}": user_avatar,
        "{user.tag}": user_tag,
        "{mention}": user_mention,
        "{username}": username,
        "{user_globalname}": display_name,
        "{server}": server_name,
        "{server.name}": server_name,
        "{server.id}": server_id,
        "{server.members}": str(count),
        "{server.icon}": server_icon,
        "{memberCount}": str(count),
        "{count}": str(count),
        "{id}": user_id,
        "{invite}": invite_url,
        "{invite.code}": invite_code,
        "{inviter}": inviter_mention,
        "{inviter.name}": inviter_name,
        "{inviter.count}": inviter_count,
        "{account.age}": account_age,
        "{time.in.server}": time_in_server,
    }


def format_welcome_string(template: str, member: discord.Member) -> str:
    if not template:
        return ""
    replacements = _build_replacements(member)
    res = str(template)
    for key, val in replacements.items():
        res = res.replace(key, str(val))
    return res


def format_goodbye_string(template: str, member: discord.Member) -> str:
    if not template:
        return ""
    replacements = _build_replacements(member)
    res = str(template)
    for key, val in replacements.items():
        res = res.replace(key, str(val))
    return res
