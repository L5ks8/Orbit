import discord
from Commands.Welcome._storage import set_welcome_status

def format_welcome_string(template: str, member: discord.Member) -> str:
    count = member.guild.member_count or len(member.guild.members)
    return template.format(
        user=member.mention,
        server=member.guild.name,
        count=count,
        username=member.name
    )
