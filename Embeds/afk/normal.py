import discord

def get_embed(msg_type: str, **kwargs):
    if msg_type == "set":
        author = kwargs.get("author")
        reason = kwargs.get("reason")
        
        embed = discord.Embed(title="AFK Status Enabled", color=discord.Color.green())
        embed.add_field(name="User", value=f"{author.mention} (`{author.id}`)", inline=False)
        embed.add_field(name="Reason", value=reason, inline=False)
        return {"embed": embed}
        
    elif msg_type == "notice":
        target = kwargs.get("target")
        reason = kwargs.get("reason")
        timestamp = kwargs.get("timestamp")
        
        embed = discord.Embed(title="AFK Notice", description=f"{target.mention} is currently AFK.", color=discord.Color.orange())
        embed.add_field(name="Reason", value=reason, inline=False)
        if timestamp:
            embed.add_field(name="Since", value=f"<t:{timestamp}:R>", inline=False)
        return {"embed": embed}
        
    elif msg_type == "remove":
        author = kwargs.get("author")
        
        embed = discord.Embed(title="AFK Status Removed", description=f"Welcome back, {author.mention} (`{author.id}`)!\nYour AFK status on this server has been cleared.", color=discord.Color.green())
        return {"embed": embed}
        
    return {}
