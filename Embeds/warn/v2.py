import discord
from discord.ui import Container, TextDisplay, Separator

def get_embed(msg_type: str, **kwargs):
    if msg_type == "dm":
        guild_name = kwargs.get("guild_name")
        warn_entry = kwargs.get("warn_entry")
        reason = kwargs.get("reason")
        punishment_text = kwargs.get("punishment_text", "")
        
        container = Container(
            TextDisplay(content=f"### ⚠️ Formal Warning Received\n**Server:** `{guild_name}`"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Warn ID:** `{warn_entry['warn_id']}`\n**Reason:** {reason}{punishment_text}")
        )
        return {"components": [container]}
        
    elif msg_type == "public":
        member = kwargs.get("member")
        warn_entry = kwargs.get("warn_entry")
        total_warns = kwargs.get("total_warns")
        
        container = Container(
            TextDisplay(content=f"### ⚠️ Warning Issued: {member.mention}\n**Warn ID:** `{warn_entry['warn_id']}` | **Total Warnings:** `{total_warns}`"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Moderator:** <@{warn_entry['moderator_id']}>\n**Reason:** {warn_entry['reason']}\n**Date:** <t:{warn_entry['timestamp']}:f> (<t:{warn_entry['timestamp']}:R>)")
        )
        return {"components": [container]}
        
    return {}
