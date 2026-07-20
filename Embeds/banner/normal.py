import discord

def get_embed(msg_type: str, **kwargs):
    if msg_type == "default":
        target = kwargs.get("target")
        banner_url = kwargs.get("banner_url")
        
        embed = discord.Embed(title=f"Profile Banner: {target.display_name}", description=f"**User ID:** `{target.id}`", color=discord.Color.blurple())
        embed.set_image(url=banner_url)
        embed.add_field(name="Banner Link", value=f"[Download High-Res (`4096px`)]({banner_url})", inline=False)
        return {"embed": embed}
        
    return {}
