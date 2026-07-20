import discord

def get_embed(msg_type: str, **kwargs):
    if msg_type == "game":
        player = kwargs.get("player")
        d_info = kwargs.get("d_info")
        p_info = kwargs.get("p_info")
        status_text = kwargs.get("status_text")
        components = kwargs.get("components", [])
        
        embed = discord.Embed(title="Orbit V2 Casino: Blackjack Table", color=discord.Color.dark_green())
        embed.add_field(name="Player", value=player.mention, inline=False)
        embed.add_field(name="Dealer Info", value=d_info, inline=False)
        embed.add_field(name="Player Info", value=p_info, inline=False)
        embed.add_field(name="Status", value=status_text, inline=False)

        view = discord.ui.View(timeout=None)
        for comp in components:
            view.add_item(comp)
            
        return {"embed": embed, "view": view}
        
    return {}
