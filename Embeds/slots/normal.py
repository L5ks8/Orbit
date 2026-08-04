import discord

def get_embed(msg_type: str, **kwargs):
    if msg_type == "game":
        player = kwargs.get("player")
        reels_str = kwargs.get("reels_str")
        outcome_text = kwargs.get("outcome_text")
        components = kwargs.get("components", [])
        
        embed = discord.Embed(title="Orbit V2 Casino: Slot Machine", color=discord.Color.gold())
        embed.add_field(name="Player", value=player.mention, inline=False)
        embed.add_field(name="Machine Reels", value=reels_str, inline=False)
        embed.add_field(name="Outcome", value=outcome_text, inline=False)

        view = getattr(components[0], "view", None) if components else None
        if not view:
            view = getattr(components[0], "view", None) if components else None
        if not view:
            view = discord.ui.View(timeout=None)
            for comp in components:
                try: view.add_item(comp)
                except ValueError: pass
            
        return {"embed": embed, "view": view}
        
    elif msg_type == "closed":
        player = kwargs.get("player")
        
        embed = discord.Embed(title="Orbit V2 Casino: Slot Machine", description="slots", color=discord.Color.red())
        embed.add_field(name="Player", value=player.mention, inline=False)
        
        return {"embed": embed}
        
    return {}
