import discord

def get_embed(msg_type: str, **kwargs):
    if msg_type == "default":
        target = kwargs.get("target")
        global_url = kwargs.get("global_url")
        guild_url = kwargs.get("guild_url")
        
        embed = discord.Embed(title=f"Profile Avatar: {target.display_name}", description=f"**User ID:** `{target.id}`", color=discord.Color.blurple())
        embed.set_image(url=global_url)
        
        links_str = f"**Global Avatar:** [Download High-Res (`4096px`)]({global_url})"
        if guild_url:
            links_str += f"\n**Server Avatar:** [Download Server Profile Avatar (`4096px`)]({guild_url})"
            
        embed.add_field(name="Links", value=links_str, inline=False)
        return {"embed": embed}
        
    return {}
