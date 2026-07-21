import discord

def format_goodbye_string(template: str, member: discord.Member) -> str:
    if not template:
        return ""
    count = member.guild.member_count or len(member.guild.members)
    replacements = {
        "{user}": member.mention,
        "{mention}": member.mention,
        "{username}": member.name,
        "{server}": member.guild.name,
        "{count}": str(count),
        "{id}": str(member.id)
    }
    res = str(template)
    for key, val in replacements.items():
        res = res.replace(key, str(val))
    return res

