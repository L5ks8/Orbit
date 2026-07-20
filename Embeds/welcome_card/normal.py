import discord

def get_embed(msg_type: str, **kwargs):
    member = kwargs.get("member")
    formatted_message = kwargs.get("formatted_message", "")

    embed = discord.Embed(
        title=f"Welcome to {member.guild.name}!",
        description=f"{formatted_message}\n\n**Member:** {member.mention} (`{member.name}`)\n**Joined:** <t:{int(member.joined_at.timestamp() if member.joined_at else 0)}:f>",
        color=discord.Color.green()
    )
    avatar_url = (member.avatar or member.display_avatar).with_size(256).url if (member.avatar or member.display_avatar) else None
    if avatar_url:
        embed.set_thumbnail(url=avatar_url)

    return {"embed": embed}
