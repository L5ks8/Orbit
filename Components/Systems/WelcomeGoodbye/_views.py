import discord
from Components.Systems.WelcomeGoodbye._storage import set_welcome_status

def format_welcome_string(template: str, member: discord.Member) -> str:
    if not template:
        return ""
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
    global_name = getattr(member, "global_name", None) or getattr(member, "display_name", username)
    
    replacements = {
        "{user}": user_mention,
        "{user.mention}": user_mention,
        "{user.name}": username,
        "{user.id}": user_id,
        "{user.avatar}": user_avatar,
        "{user.tag}": user_tag,
        "{mention}": user_mention,
        "{username}": username,
        "{user_globalname}": global_name,
        "{server}": server_name,
        "{server.name}": server_name,
        "{server.id}": server_id,
        "{server.members}": str(count),
        "{server.icon}": server_icon,
        "{count}": str(count),
        "{id}": user_id
    }
    res = str(template)
    for key, val in replacements.items():
        res = res.replace(key, str(val))
    return res


def format_goodbye_string(template: str, member: discord.Member) -> str:
    if not template:
        return ""
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
    global_name = getattr(member, "global_name", None) or getattr(member, "display_name", username)
    
    replacements = {
        "{user}": user_mention,
        "{user.mention}": user_mention,
        "{user.name}": username,
        "{user.id}": user_id,
        "{user.avatar}": user_avatar,
        "{user.tag}": user_tag,
        "{mention}": user_mention,
        "{username}": username,
        "{user_globalname}": global_name,
        "{server}": server_name,
        "{server.name}": server_name,
        "{server.id}": server_id,
        "{server.members}": str(count),
        "{server.icon}": server_icon,
        "{count}": str(count),
        "{id}": user_id
    }
    res = str(template)
    for key, val in replacements.items():
        res = res.replace(key, str(val))
    return res

