import discord

def get_embed(msg_type: str, **kwargs):
    member_mention = kwargs.get("member_mention", "")
    member_id = kwargs.get("member_id", "")
    reason = kwargs.get("reason", "No reason provided")
    author_mention = kwargs.get("author_mention", "")
    minutes = kwargs.get("minutes", 0)

    title = "Timeout Action"
    color = discord.Color.blue()
    status = ""

    if msg_type == "timeout":
        title = "User Timed Out"
        color = discord.Color.orange()
        status = "`Active (Cannot send messages or join VC)`"
    elif msg_type == "untimeout":
        title = "User Timeout Removed"
        color = discord.Color.green()
        status = "`Cleared`"

    embed = discord.Embed(title=title, color=color)
    if member_mention:
        embed.add_field(name="Target", value=f"{member_mention} (`{member_id}`)", inline=False)
    if msg_type == "timeout" and minutes > 0:
        embed.add_field(name="Duration", value=f"`{minutes} minutes`", inline=False)
    if reason and reason != "No reason provided":
        embed.add_field(name="Reason", value=reason, inline=False)
    if author_mention:
        embed.add_field(name="Moderator", value=author_mention, inline=False)
    if status:
        embed.add_field(name="Status", value=status, inline=False)

    return {"embed": embed}
