import discord

def get_embed(ban_entry, reason: str):
    embed = discord.Embed(title="User is Banned", color=discord.Color.red())
    embed.add_field(name="User", value=f"{ban_entry.user} (`{ban_entry.user.id}`)", inline=False)
    embed.add_field(name="Reason", value=reason, inline=False)
    return {"embed": embed}
