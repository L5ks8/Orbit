import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator

def get_embed(msg_type: str, **kwargs):
    if msg_type == "success":
        channel = kwargs.get("channel")
        reason = kwargs.get("reason")
        author = kwargs.get("author")
        
        view = LayoutView()
        container = Container(
            TextDisplay(content=f"### Channel Locked\n**Channel:** {channel.mention} (`{channel.id}`)"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Reason:** {reason}\n**Moderator:** {author.mention}\n**Status:** `@everyone` send messages disabled")
        )
        view.add_item(container)
        return {"view": view}
        
    return {}
