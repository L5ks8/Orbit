import discord

def get_embed(msg_type: str, **kwargs):
    channel_mention = kwargs.get("channel_mention", "")
    seconds = kwargs.get("seconds", 0)
    author_mention = kwargs.get("author_mention", "")

    title = "Slowmode Configured"
    color = discord.Color.blue()
    status = ""

    if msg_type == "set":
        title = "Slowmode Enabled"
        color = discord.Color.orange()
        status = f"`{seconds} seconds` between messages"
    elif msg_type == "reset":
        title = "Slowmode Disabled"
        color = discord.Color.green()
        status = "`Disabled`"

    embed = discord.Embed(title=title, color=color)
    if channel_mention:
        embed.add_field(name="Channel", value=channel_mention, inline=False)
    if msg_type == "set" and seconds > 0:
        embed.add_field(name="Delay", value=f"`{seconds} seconds` between messages", inline=False)
    if author_mention:
        embed.add_field(name="Moderator", value=author_mention, inline=False)

    return {"embed": embed}
