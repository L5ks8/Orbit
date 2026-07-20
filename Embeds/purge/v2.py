import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator

def get_embed(msg_type: str, **kwargs):
    count = kwargs.get("count", 0)
    channel_mention = kwargs.get("channel_mention", "Unknown Channel")
    author_mention = kwargs.get("author_mention", "Unknown Moderator")
    filter_user_mention = kwargs.get("filter_user_mention")
    is_all = kwargs.get("is_all", False)

    filter_text = f"\n**Filter:** Messages from {filter_user_mention}" if filter_user_mention else ""
    title = "Channel Purged Completely" if is_all else "Messages Purged"
    
    container = Container(
        TextDisplay(content=f"### {title}\n**Total Messages Deleted:** `{count}`"),
        Separator(spacing=discord.SeparatorSpacing.small),
        TextDisplay(content=f"**Channel:** {channel_mention}\n**Moderator:** {author_mention}{filter_text}")
    )
    
    view = LayoutView()
    view.add_item(container)
    return {"view": view}
