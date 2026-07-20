import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator

def get_embed(msg_type: str, **kwargs):
    latency = kwargs.get("latency", 0)
    ms = round(latency * 1000)
    
    container = Container(
        TextDisplay(content="### Pong"),
        Separator(spacing=discord.SeparatorSpacing.small),
        TextDisplay(content=f"**Latency:** `{ms} ms`")
    )
    
    view = LayoutView()
    view.add_item(container)
    return {"view": view}
