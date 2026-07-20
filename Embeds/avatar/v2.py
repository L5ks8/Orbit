import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator

def get_embed(msg_type: str, **kwargs):
    if msg_type == "default":
        target = kwargs.get("target")
        global_url = kwargs.get("global_url")
        guild_url = kwargs.get("guild_url")
        
        header_str = f"### Profile Avatar: **{target.display_name}**\n**User ID:** `{target.id}`"
        
        links_str = f"**Global Avatar:** [Download High-Res (`4096px`)]({global_url})"
        if guild_url:
            links_str += f"\n**Server Avatar:** [Download Server Profile Avatar (`4096px`)]({guild_url})"

        view = LayoutView()
        container = Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=links_str)
        )
        view.add_item(container)
        return {"view": view}
        
    return {}
