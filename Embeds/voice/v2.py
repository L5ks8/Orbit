import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator

def get_embed(msg_type: str, **kwargs):
    member_mention = kwargs.get("member_mention", "")
    member_id = kwargs.get("member_id", "")
    channel_mention = kwargs.get("channel_mention", "")
    reason = kwargs.get("reason", "No reason provided")
    author_mention = kwargs.get("author_mention", "")
    limit = kwargs.get("limit", 0)

    title = "Voice Action"
    desc = ""
    status = ""

    if msg_type == "ban":
        title = "### User Voice Banned"
        status = "**Status:** `Active (Banned from Voice Channels)`"
    elif msg_type == "unban":
        title = "### Voice Unbanned"
        status = "**Status:** `Cleared`"
    elif msg_type == "mute":
        title = "### Voice Muted"
    elif msg_type == "unmute":
        title = "### Voice Unmuted"
    elif msg_type == "lock":
        title = "### Channel Locked"
    elif msg_type == "unlock":
        title = "### Channel Unlocked"
    elif msg_type == "limit":
        title = "### User Limit Set"
    elif msg_type == "move":
        title = "### Moved User"
    elif msg_type == "moveall":
        title = "### Moved All Voice Users"

    count = kwargs.get("count", 0)

    lines = []
    if count > 0:
        lines.append(f"**Moved Members:** `{count}`")
    if member_mention:
        lines.append(f"**Target:** {member_mention} (`{member_id}`)")
    if channel_mention:
        lines.append(f"**Channel:** {channel_mention}")
    if limit > 0:
        lines.append(f"**New Limit:** `{limit}`")
    elif msg_type == "limit" and limit == 0:
        lines.append("**New Limit:** `None`")
    if reason and reason != "No reason provided":
        lines.append(f"**Reason:** {reason}")
    if author_mention:
        lines.append(f"**Moderator:** {author_mention}")
    if status:
        lines.append(status)

    container = Container(
        TextDisplay(content=title),
        Separator(spacing=discord.SeparatorSpacing.small),
        TextDisplay(content="\n".join(lines))
    )

    view = LayoutView()
    view.add_item(container)
    return {"view": view}
