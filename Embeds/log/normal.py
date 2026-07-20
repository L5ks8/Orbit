import discord

def get_embed(msg_type: str, **kwargs):
    if msg_type == "event":
        title = kwargs.get("title", "")
        description = kwargs.get("description", "")
        
        embed = discord.Embed(
            title=title,
            description=description,
            color=0x2b2d31,
            timestamp=discord.utils.utcnow()
        )
        return {"embed": embed}
    
    return {}
