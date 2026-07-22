import discord

DICE_FACES = {
    1: "⚀", 2: "⚁", 3: "⚂", 4: "⚃", 5: "⚄", 6: "⚅"
}

def get_embed(**kwargs):
    msg_type = kwargs.get("msg_type")
    
    if msg_type == "roll":
        player = kwargs.get("player")
        bet = kwargs.get("bet")
        
        embed = discord.Embed(title="Orbit Casino: Dice Roll", description=f"Rolling the dice... 🎲\n**Bet:** {bet:,}", color=discord.Color.blue())
        embed.add_field(name="Player", value=player.mention, inline=False)
        return {"embed": embed}
        
    elif msg_type == "game":
        player = kwargs.get("player")
        outcome_text = kwargs.get("outcome_text", "")
        result_dice = kwargs.get("result_dice", (1, 1))
        view = kwargs.get("view")
        
        d1, d2 = result_dice
        dice_str = f"{DICE_FACES[d1]} {DICE_FACES[d2]}"
        
        embed = discord.Embed(title="Orbit Casino: Dice Roll", description=outcome_text, color=discord.Color.blue())
        embed.add_field(name="Result", value=f"{dice_str} ({d1 + d2})", inline=True)
        embed.add_field(name="Player", value=player.mention, inline=False)
        
        if view:
            return {"embed": embed, "view": view}
        return {"embed": embed}
    
    return {"content": "Unknown msg_type for Dice"}
