import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator

def get_embed(msg_type: str, **kwargs):
    channel_mention = kwargs.get("channel_mention", "")
    seconds = kwargs.get("seconds", 0)
    author_mention = kwargs.get("author_mention", "")

    title = "Slowmode Action"

    if msg_type == "set":
        title = "### Slowmode Enabled"
    elif msg_type == "reset":
        title = "### Slowmode Disabled"

    lines = []
    if channel_mention:
        lines.append(f"**Channel:** {channel_mention}")
    if msg_type == "set" and seconds > 0:
        lines.append(f"**Delay:** `{seconds} seconds` between messages")
    if author_mention:
        lines.append(f"**Moderator:** {author_mention}")

    container = Container(
        TextDisplay(content=title),
        Separator(spacing=discord.SeparatorSpacing.small),
        TextDisplay(content="\n".join(lines))
    )

    view = LayoutView()
    view.add_item(container)
    return {"view": view}
