import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator

def get_embed(msg_type: str, **kwargs):
    if msg_type == "game":
        player = kwargs.get("player")
        outcome_text = kwargs.get("outcome_text")
        current_row = kwargs.get("current_row")
        current_mult = kwargs.get("current_mult")
        bet_amount = kwargs.get("bet_amount")
        game_view = kwargs.get("view")
        
        view = LayoutView(timeout=300)
        # We need to add the game buttons from game_view to our new LayoutView
        for child in game_view.children:
            view.add_item(child)
            
        container = Container(
            TextDisplay(content=f"### 🏰 Towers Casino\n**Player:** {player.mention}"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"> {outcome_text}"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Bet:** `{bet_amount:,}` • **Floor:** `{current_row}/4` • **Multiplier:** `{current_mult}x`")
        )
        
        view.add_item(container)
        return {"view": view}

    return {}
