import discord

def get_embed(msg_type: str, **kwargs):
    if msg_type == "list":
        guild_name = kwargs.get("guild_name")
        action_summary = kwargs.get("action_summary")
        role_ids = kwargs.get("role_ids")
        role_mentions = kwargs.get("role_mentions")
        components = kwargs.get("components", [])

        roles_text = "\n".join(f"> • {rm}" for rm in role_mentions) if role_mentions else "`No automatic join roles currently configured.`"
        
        embed = discord.Embed(title=f"Automatic Join Roles: {guild_name}", color=discord.Color.dark_theme())
        embed.add_field(name="Action", value=action_summary, inline=True)
        embed.add_field(name="Total Configured", value=f"`{len(role_ids)}`", inline=True)
        embed.add_field(name="Assigned on Join", value=roles_text, inline=False)
        
        view = discord.ui.View(timeout=None)
        for comp in components:
            view.add_item(comp)
            
        return {"embed": embed, "view": view}
        
    elif msg_type == "cleared":
        cleared_count = kwargs.get("cleared_count")
        components = kwargs.get("components", [])
        
        embed = discord.Embed(title="Join Roles Cleared", description=f"Cleared `{cleared_count}` automatic join roles.", color=discord.Color.red())
        
        view = discord.ui.View(timeout=None)
        for comp in components:
            view.add_item(comp)
            
        return {"embed": embed, "view": view}
        
    return {}
