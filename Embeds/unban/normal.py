import discord

def get_embed(msg_type: str, **kwargs):
    if msg_type == "prompt":
        ban_entry = kwargs.get("ban_entry")
        reason = kwargs.get("reason")
        embed = discord.Embed(title="Confirm unban", description=f"Are you sure you want to unban **{ban_entry.user.name}**?", color=discord.Color.orange())
        embed.add_field(name="Target", value=f"{ban_entry.user.mention} (`{ban_entry.user.id}`)", inline=False)
        embed.add_field(name="Original Ban Reason", value=ban_entry.reason or 'None', inline=False)
        embed.add_field(name="New Reason", value=reason, inline=False)
        return {"embed": embed}
        
    elif msg_type == "success":
        ban_entry = kwargs.get("ban_entry")
        reason = kwargs.get("reason")
        author = kwargs.get("author")
        embed = discord.Embed(title="User unbanned", color=discord.Color.green())
        embed.add_field(name="Target", value=f"{ban_entry.user.mention} (`{ban_entry.user.id}`)", inline=False)
        embed.add_field(name="Reason", value=reason, inline=False)
        embed.add_field(name="Moderator", value=author.mention, inline=False)
        return {"embed": embed}
        
    elif msg_type == "cancel":
        embed = discord.Embed(title="Unban cancelled", description="The operation was cancelled.", color=discord.Color.red())
        return {"embed": embed}
    
    return {}
