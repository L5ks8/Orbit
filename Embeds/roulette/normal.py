import discord

def get_embed(**kwargs):
    msg_type = kwargs.get("msg_type")
    
    if msg_type == "spin":
        player = kwargs.get("player")
        choice = kwargs.get("choice").capitalize()
        bet = kwargs.get("bet")
        
        embed = discord.Embed(title="Orbit Casino: Roulette", description=f"Spinning the wheel... 🎡\n**Bet:** {bet:,} | **Choice:** {choice}", color=discord.Color.red())
        embed.add_field(name="Player", value=player.mention, inline=False)
        return {"embed": embed}
        
    elif msg_type == "game":
        player = kwargs.get("player")
        outcome_text = kwargs.get("outcome_text", "")
        result = kwargs.get("result", "").capitalize()
        choice = kwargs.get("choice", "").capitalize()
        view = kwargs.get("view")
        
        # Color the embed based on the result
        color = discord.Color.red()
        if result == "Black":
            color = discord.Color.dark_theme()
        elif result == "Green":
            color = discord.Color.green()
            
        embed = discord.Embed(title="Orbit Casino: Roulette", description=outcome_text, color=color)
        embed.add_field(name="Result", value=result, inline=True)
        embed.add_field(name="Your Choice", value=choice, inline=True)
        embed.add_field(name="Player", value=player.mention, inline=False)
        
        if view:
            return {"embed": embed, "view": view}
        return {"embed": embed}
    
    return {"content": "Unknown msg_type for Roulette"}
