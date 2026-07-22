import discord

def get_embed(msg_type: str, **kwargs):
    if msg_type == "game":
        player = kwargs.get("player")
        outcome_text = kwargs.get("outcome_text")
        current_row = kwargs.get("current_row")
        current_mult = kwargs.get("current_mult")
        bet_amount = kwargs.get("bet_amount")
        view = kwargs.get("view")
        
        embed = discord.Embed(title="Towers", color=discord.Color.blue())
        embed.set_author(name=player.display_name, icon_url=player.display_avatar.url if player.display_avatar else None)
        embed.description = outcome_text
        embed.add_field(name="Bet", value=f"`{bet_amount:,}`", inline=True)
        embed.add_field(name="Floor", value=f"`{current_row}/4`", inline=True)
        embed.add_field(name="Multiplier", value=f"`{current_mult}x`", inline=True)
        
        return {"embed": embed, "view": view}

    return {}
