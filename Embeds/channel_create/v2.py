import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator

def get_embed(msg_type: str, **kwargs):
    if msg_type == "success":
        channel = kwargs.get("channel")
        author = kwargs.get("author")
        
        ch_type = "Voice" if isinstance(channel, discord.VoiceChannel) else "Text"
        cat = channel.category.name if channel.category else "No Category"
        content_str = (
            f"**Channel:** {channel.mention}\n"
            f"**Type:** `{ch_type}`\n"
            f"**Category:** `{cat}`\n"
            f"**Created by:** {author.mention}"
        )
        
        view = LayoutView()
        container = Container(
            TextDisplay(content="### Channel Created"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=content_str)
        )
        view.add_item(container)
        return {"view": view}
        
    return {}
