import discord

def get_embed(msg_type: str, **kwargs):
    if msg_type == "success":
        target = kwargs.get("target")
        reason = kwargs.get("reason")
        author = kwargs.get("author")
        role = kwargs.get("role")
        
        embed = discord.Embed(title="User Muted", color=discord.Color.red())
        embed.add_field(name="Target", value=f"{target.mention} (`{target.id}`)", inline=False)
        embed.add_field(name="Reason", value=reason, inline=False)
        embed.add_field(name="Moderator", value=author.mention, inline=False)
        if role:
            embed.add_field(name="Role Assigned", value=role.mention, inline=False)
        return {"embed": embed}
        
    return {}
