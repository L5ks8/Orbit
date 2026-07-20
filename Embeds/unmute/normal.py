import discord

def get_embed(msg_type: str, **kwargs):
    if msg_type == "success":
        target = kwargs.get("target")
        reason = kwargs.get("reason")
        author = kwargs.get("author")
        channels_restored = kwargs.get("channels_restored")
        
        embed = discord.Embed(title="User Unmuted", color=discord.Color.green())
        embed.add_field(name="Target", value=f"{target.mention} (`{target.id}`)", inline=False)
        embed.add_field(name="Reason", value=reason, inline=False)
        embed.add_field(name="Moderator", value=author.mention, inline=False)
        embed.add_field(name="Channel Overrides", value=f"User permissions restored in `{channels_restored}` channel(s).", inline=False)
        return {"embed": embed}
        
    return {}
