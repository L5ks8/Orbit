import discord

def get_embed(**kwargs):
    msg_type = kwargs.get("msg_type")
    
    if msg_type == "spin":
        player = kwargs.get("player")
        choice = kwargs.get("choice").capitalize()
        bet = kwargs.get("bet")
        
        embed = discord.Embed(title="Orbit Casino: Coinflip", description=f"Flipping the coin...\n**Bet:** {bet:,} | **Choice:** {choice}", color=discord.Color.gold())
        embed.add_field(name="Player", value=player.mention, inline=False)
        return {"embed": embed}
        
    elif msg_type == "game":
        player = kwargs.get("player")
        outcome_text = kwargs.get("outcome_text", "")
        result = kwargs.get("result", "").capitalize()
        choice = kwargs.get("choice", "").capitalize()
        view = kwargs.get("view")
        
        embed = discord.Embed(title="Orbit Casino: Coinflip", description=outcome_text, color=discord.Color.gold())
        embed.add_field(name="Result", value=result, inline=True)
        embed.add_field(name="Your Choice", value=choice, inline=True)
        embed.add_field(name="Player", value=player.mention, inline=False)
        
        if view:
            return {"embed": embed, "view": view}
        return {"embed": embed}
    
    return {"content": "Unknown msg_type for Coinflip"}
