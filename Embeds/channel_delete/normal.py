import discord

def get_embed(msg_type: str, **kwargs):
    if msg_type == "success":
        channel_name = kwargs.get("channel_name")
        channel_type = kwargs.get("channel_type")
        author = kwargs.get("author")
        
        embed = discord.Embed(title="Channel Deleted", color=discord.Color.red())
        embed.add_field(name="Channel", value=f"`#{channel_name}`", inline=False)
        embed.add_field(name="Type", value=f"`{channel_type}`", inline=True)
        embed.add_field(name="Deleted by", value=author.mention, inline=False)
        return {"embed": embed}
        
    return {}
