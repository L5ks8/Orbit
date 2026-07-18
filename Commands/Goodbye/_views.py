import discord

def format_goodbye_string(template: str, member: discord.Member) -> str:
    count = member.guild.member_count or len(member.guild.members)
    return template.format(
        user=member.mention,
        server=member.guild.name,
        count=count,
        username=member.name
    )

