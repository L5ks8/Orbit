import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator

def get_embed(msg_type: str, **kwargs):
    if msg_type == "event":
        title = kwargs.get("title", "")
        description = kwargs.get("description", "")
        
        container = Container(
            TextDisplay(content=f"### {title}"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=description)
        )
        view = LayoutView()
        view.add_item(container)
        return {"view": view}
    
    return {}
