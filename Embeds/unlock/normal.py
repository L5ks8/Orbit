import discord

def get_embed(msg_type: str, **kwargs):
    if msg_type == "success":
        channel = kwargs.get("channel")
        reason = kwargs.get("reason")
        author = kwargs.get("author")
        
        embed = discord.Embed(title="Channel Unlocked", color=discord.Color.green())
        embed.add_field(name="Channel", value=f"{channel.mention} (`{channel.id}`)", inline=False)
        embed.add_field(name="Reason", value=reason, inline=False)
        embed.add_field(name="Moderator", value=author.mention, inline=False)
        embed.add_field(name="Status", value="`@everyone` send messages restored", inline=False)
        return {"embed": embed}
        
    return {}
