import discord

def get_embed(msg_type: str, **kwargs):
    if msg_type == "info":
        guild = kwargs.get("guild")
        
        created_timestamp = int(guild.created_at.timestamp())

        humans = len([m for m in guild.members if not m.bot])
        bots = len([m for m in guild.members if m.bot])
        total_members = guild.member_count or len(guild.members)

        text_channels = len(guild.text_channels)
        voice_channels = len(guild.voice_channels)
        categories = len(guild.categories)
        
        embed = discord.Embed(title=f"Server Information: {guild.name}", color=discord.Color.purple())
        
        if guild.icon:
            embed.set_thumbnail(url=guild.icon.url)
            
        embed.add_field(name="Server ID", value=f"`{guild.id}`", inline=True)
        embed.add_field(name="Owner", value=f"<@{guild.owner_id}>", inline=True)
        embed.add_field(name="Created On", value=f"<t:{created_timestamp}:F> (<t:{created_timestamp}:R>)", inline=False)
        
        embed.add_field(name=f"Members ({total_members})", value=f"> Humans: `{humans}` | Bots: `{bots}`", inline=False)
        embed.add_field(name=f"Channels ({text_channels + voice_channels + categories})", value=f"> Text: `{text_channels}` | Voice: `{voice_channels}` | Categories: `{categories}`", inline=False)
        embed.add_field(name="Roles & Boosts", value=f"> Roles: `{len(guild.roles)}` | Boost Level: `Tier {guild.premium_tier}` (`{guild.premium_subscription_count or 0} Boosts`)", inline=False)
        
        return {"embed": embed}
        
    return {}
