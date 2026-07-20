import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator

def get_embed(msg_type: str, **kwargs):
    if msg_type == "default":
        target = kwargs.get("target")
        banner_url = kwargs.get("banner_url")
        
        header_str = f"### Profile Banner: **{target.display_name}**\n**User ID:** `{target.id}`"
        links_str = f"**Banner Link:** [Download High-Res (`4096px`)]({banner_url})"

        view = LayoutView()
        container = Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=links_str)
        )
        view.add_item(container)
        return {"view": view}
        
    return {}
