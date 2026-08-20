import discord
from Commands.Welcome._storage import set_welcome_status

def format_welcome_string(template: str, member: discord.Member) -> str:
    if not template:
        return ""
    count = member.guild.member_count or len(member.guild.members)
    replacements = {
        "{user}": member.mention,
        "{user.mention}": member.mention,
        "{user.name}": member.name,
        "{user.id}": str(member.id),
        "{user.avatar}": member.display_avatar.url if getattr(member, "display_avatar", None) else "",
        "{user.tag}": str(member),
        "{mention}": member.mention,
        "{username}": member.name,
        "{user_globalname}": getattr(member, "global_name", None) or member.display_name,
        "{server}": member.guild.name,
        "{server.name}": member.guild.name,
        "{server.id}": str(member.guild.id),
        "{server.members}": str(count),
        "{server.icon}": member.guild.icon.url if member.guild.icon else "",
        "{count}": str(count),
        "{id}": str(member.id)
    }
    res = str(template)
    for key, val in replacements.items():
        res = res.replace(key, str(val))
    return res
