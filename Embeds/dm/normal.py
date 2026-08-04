import discord

def get_embed(msg_type: str, **kwargs):
    if msg_type == "composer":
        target = kwargs.get("target")
        components = kwargs.get("components", [])
        
        embed = discord.Embed(title="Direct Message Composer", description="Click the button below to open the text box and compose your message.", color=discord.Color.blue())
        embed.add_field(name="Target", value=f"{target.mention} (`{target.id}`)", inline=False)
        
        view = discord.ui.View(timeout=None)
        for comp in components:
            view.add_item(comp)
            
        return {"embed": embed, "view": view}
        
    elif msg_type == "success":
        target = kwargs.get("target")
        exact_content = kwargs.get("exact_content")
        
        embed = discord.Embed(title="DM Sent Successfully", color=discord.Color.green())
        embed.add_field(name="To", value=f"{target.mention} (`{target.id}`)", inline=False)
        embed.add_field(name="Message sent", value=exact_content, inline=False)
        
        return {"embed": embed}
        
    return {}
