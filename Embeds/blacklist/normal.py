import discord

def get_embed(msg_type: str, **kwargs):
    if msg_type == "list":
        count = kwargs.get("count")
        lines = kwargs.get("lines")
        components = kwargs.get("components", [])

        if count == 0:
            content_text = "The blacklist is currently empty for this server."
        else:
            content_text = "\n".join(lines)
            if count > 15:
                content_text += f"\n\n*And {count - 15} more users...*"
        
        embed = discord.Embed(title=f"Blacklist Overview ({count} Users)", description=content_text, color=discord.Color.dark_theme())
        
        view = discord.ui.View(timeout=None)
        for comp in components:
            view.add_item(comp)
            
        return {"embed": embed, "view": view}
        
    return {}
