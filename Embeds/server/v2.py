import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator

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

        header_str = f"### Server Information: **{guild.name}**\n**Server ID:** `{guild.id}` | **Owner:** <@{guild.owner_id}>"

        stats_str = (
            f"**Created On:** <t:{created_timestamp}:F> (<t:{created_timestamp}:R>)\n\n"
            f"**Members (`{total_members}`)**\n"
            f"> Humans: `{humans}` | Bots: `{bots}`\n\n"
            f"**Channels (`{text_channels + voice_channels + categories}`)**\n"
            f"> Text: `{text_channels}` | Voice: `{voice_channels}` | Categories: `{categories}`\n\n"
            f"**Roles & Boosts**\n"
            f"> Roles: `{len(guild.roles)}` | Boost Level: `Tier {guild.premium_tier}` (`{guild.premium_subscription_count or 0} Boosts`)"
        )

        view = LayoutView()
        container = Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=stats_str)
        )
        view.add_item(container)
        return {"view": view}
        
    return {}
