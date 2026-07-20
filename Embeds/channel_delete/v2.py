import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator

def get_embed(msg_type: str, **kwargs):
    if msg_type == "success":
        channel_name = kwargs.get("channel_name")
        channel_type = kwargs.get("channel_type")
        author = kwargs.get("author")
        
        content_str = (
            f"**Channel:** `#{channel_name}`\n"
            f"**Type:** `{channel_type}`\n"
            f"**Deleted by:** {author.mention}"
        )
        
        view = LayoutView()
        container = Container(
            TextDisplay(content="### Channel Deleted"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=content_str)
        )
        view.add_item(container)
        return {"view": view}
        
    return {}
