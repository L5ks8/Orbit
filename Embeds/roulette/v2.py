import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator

def get_embed(**kwargs):
    msg_type = kwargs.get("msg_type")
    
    if msg_type == "spin":
        player = kwargs.get("player")
        choice = kwargs.get("choice").capitalize()
        bet = kwargs.get("bet")
        
        view = LayoutView()
        container = Container(
            TextDisplay(content=f"### Orbit Casino: Roulette\n**Player:** {player.mention}"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"Spinning the wheel... 🎡\n**Bet:** {bet:,} | **Choice:** {choice}")
        )
        view.add_item(container)
        return {"view": view}
        
    elif msg_type == "game":
        player = kwargs.get("player")
        outcome_text = kwargs.get("outcome_text", "")
        result = kwargs.get("result", "").capitalize()
        choice = kwargs.get("choice", "").capitalize()
        interactive_view = kwargs.get("view")
        
        view = LayoutView()
        container = Container(
            TextDisplay(content=f"### Orbit Casino: Roulette\n**Player:** {player.mention}"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Result:** {result} | **Your Choice:** {choice}"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=outcome_text)
        )
        view.add_item(container)
        
        if interactive_view:
            for child in interactive_view.children:
                view.add_item(child)
            interactive_view.clear_items()
            
        return {"view": view}
    
    return {"content": "Unknown msg_type for Roulette"}
