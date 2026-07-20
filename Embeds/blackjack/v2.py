import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow

def get_embed(msg_type: str, **kwargs):
    if msg_type == "game":
        player = kwargs.get("player")
        d_info = kwargs.get("d_info")
        p_info = kwargs.get("p_info")
        status_text = kwargs.get("status_text")
        components = kwargs.get("components", [])

        view = LayoutView(timeout=None)
        container = Container(
            TextDisplay(content=f"### Orbit V2 Casino: Blackjack Table\n**Player:** {player.mention}"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"{d_info}\n\n{p_info}"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"### {status_text}")
        )
        view.add_item(container)
        
        if components:
            ar = ActionRow()
            for comp in components:
                ar.add_item(comp)
            view.add_item(ar)
            
        return {"view": view}
        
    return {}
