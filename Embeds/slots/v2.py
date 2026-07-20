import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow

def get_embed(msg_type: str, **kwargs):
    if msg_type == "game":
        player = kwargs.get("player")
        reels_str = kwargs.get("reels_str")
        outcome_text = kwargs.get("outcome_text")
        components = kwargs.get("components", [])

        view = LayoutView(timeout=None)
        container = Container(
            TextDisplay(content=f"### Orbit V2 Casino: Slot Machine\n**Player:** {player.mention}"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Machine Reels:**\n{reels_str}"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"### {outcome_text}")
        )
        view.add_item(container)
        
        if components:
            ar = ActionRow()
            for comp in components:
                ar.add_item(comp)
            view.add_item(ar)
            
        return {"view": view}
        
    elif msg_type == "closed":
        player = kwargs.get("player")
        
        view = LayoutView(timeout=None)
        container = Container(
            TextDisplay(content=f"### Orbit V2 Casino: Slot Machine\n**Player:** {player.mention}"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content="**Thanks for playing at the Orbit V2 Casino!** Machine closed.")
        )
        view.add_item(container)
        return {"view": view}
        
    return {}
