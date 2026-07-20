import discord

def get_embed(msg_type: str, **kwargs):
    if msg_type == "success":
        channel = kwargs.get("channel")
        author = kwargs.get("author")
        
        ch_type = "Voice" if isinstance(channel, discord.VoiceChannel) else "Text"
        cat = channel.category.name if channel.category else "No Category"
        
        embed = discord.Embed(title="Channel Created", color=discord.Color.green())
        embed.add_field(name="Channel", value=channel.mention, inline=False)
        embed.add_field(name="Type", value=f"`{ch_type}`", inline=True)
        embed.add_field(name="Category", value=f"`{cat}`", inline=True)
        embed.add_field(name="Created by", value=author.mention, inline=False)
        return {"embed": embed}
        
    return {}
