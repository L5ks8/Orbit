import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator

DICE_FACES = {
    1: "⚀", 2: "⚁", 3: "⚂", 4: "⚃", 5: "⚄", 6: "⚅"
}

def get_embed(**kwargs):
    msg_type = kwargs.get("msg_type")
    
    if msg_type == "roll":
        player = kwargs.get("player")
        bet = kwargs.get("bet")
        
        view = LayoutView()
        container = Container(
            TextDisplay(content=f"### Orbit Casino: Dice Roll\n**Player:** {player.mention}"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"Rolling the dice... 🎲\n**Bet:** {bet:,}")
        )
        view.add_item(container)
        return {"view": view}
        
    elif msg_type == "game":
        player = kwargs.get("player")
        outcome_text = kwargs.get("outcome_text", "")
        result_dice = kwargs.get("result_dice", (1, 1))
        interactive_view = kwargs.get("view")
        
        d1, d2 = result_dice
        dice_str = f"{DICE_FACES[d1]} {DICE_FACES[d2]}"
        
        view = LayoutView()
        container = Container(
            TextDisplay(content=f"### Orbit Casino: Dice Roll\n**Player:** {player.mention}"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Result:** {dice_str} ({d1 + d2})"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=outcome_text)
        )
        view.add_item(container)
        
        if interactive_view:
            for child in interactive_view.children:
                view.add_item(child)
            interactive_view.clear_items()
            
        return {"view": view}
    
    return {"content": "Unknown msg_type for Dice"}
