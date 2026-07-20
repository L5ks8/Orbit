import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator

def get_embed(msg_type: str, **kwargs):
    member_mention = kwargs.get("member_mention", "")
    member_id = kwargs.get("member_id", "")
    reason = kwargs.get("reason", "No reason provided")
    author_mention = kwargs.get("author_mention", "")
    minutes = kwargs.get("minutes", 0)

    title = "Timeout Action"
    status = ""

    if msg_type == "timeout":
        title = "### User Timed Out"
        status = "**Status:** `Active (Cannot send messages or join VC)`"
    elif msg_type == "untimeout":
        title = "### User Timeout Removed"
        status = "**Status:** `Cleared`"

    lines = []
    if member_mention:
        lines.append(f"**Target:** {member_mention} (`{member_id}`)")
    if msg_type == "timeout" and minutes > 0:
        lines.append(f"**Duration:** `{minutes} minutes`")
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
