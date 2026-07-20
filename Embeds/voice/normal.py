import discord

def get_embed(msg_type: str, **kwargs):
    member_mention = kwargs.get("member_mention", "")
    member_id = kwargs.get("member_id", "")
    channel_mention = kwargs.get("channel_mention", "")
    reason = kwargs.get("reason", "No reason provided")
    author_mention = kwargs.get("author_mention", "")
    limit = kwargs.get("limit", 0)

    title = "Voice Action"
    desc = ""
    color = discord.Color.blue()
    status = ""

    if msg_type == "ban":
        title = "User Voice Banned"
        status = "`Active (Banned from Voice Channels)`"
        color = discord.Color.red()
    elif msg_type == "unban":
        title = "Voice Unbanned"
        status = "`Cleared`"
        color = discord.Color.green()
    elif msg_type == "mute":
        title = "Voice Muted"
        color = discord.Color.red()
    elif msg_type == "unmute":
        title = "Voice Unmuted"
        color = discord.Color.green()
    elif msg_type == "lock":
        title = "Channel Locked"
        color = discord.Color.orange()
    elif msg_type == "unlock":
        title = "Channel Unlocked"
        color = discord.Color.green()
    elif msg_type == "limit":
        title = "User Limit Set"
        color = discord.Color.orange()
    elif msg_type == "move":
        title = "Moved User"
        color = discord.Color.blue()

    embed = discord.Embed(title=title, color=color)
    if member_mention:
        embed.add_field(name="Target", value=f"{member_mention} (`{member_id}`)", inline=False)
    if channel_mention:
        embed.add_field(name="Channel", value=channel_mention, inline=False)
    if limit > 0:
        embed.add_field(name="New Limit", value=f"`{limit}`", inline=False)
    elif msg_type == "limit" and limit == 0:
        embed.add_field(name="New Limit", value="`None`", inline=False)
    if reason and reason != "No reason provided":
        embed.add_field(name="Reason", value=reason, inline=False)
    if author_mention:
        embed.add_field(name="Moderator", value=author_mention, inline=False)
    if status:
        embed.add_field(name="Status", value=status, inline=False)

    return {"embed": embed}
