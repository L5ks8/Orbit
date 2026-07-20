import discord
from discord.ui import Container, TextDisplay, Separator

def get_embed(msg_type: str, **kwargs):
    if msg_type == "prompt":
        ban_entry = kwargs.get("ban_entry")
        reason = kwargs.get("reason")
        container = Container(
            TextDisplay(content=f"### Confirm unban\nAre you sure you want to unban **{ban_entry.user.name}**?"),
            Separator(spacing=discord.SeparatorSpacing.large),
            TextDisplay(content=f"**Target:** {ban_entry.user.mention} (`{ban_entry.user.id}`)\n**Original Ban Reason:** {ban_entry.reason or 'None'}\n**New Reason:** {reason}"),
            Separator(spacing=discord.SeparatorSpacing.small)
        )
        return {"components": [container]}
        
    elif msg_type == "success":
        ban_entry = kwargs.get("ban_entry")
        reason = kwargs.get("reason")
        author = kwargs.get("author")
        container = Container(
            TextDisplay(content=f"### User unbanned\n**Target:** {ban_entry.user.mention} (`{ban_entry.user.id}`)"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Reason:** {reason}\n**Moderator:** {author.mention}")
        )
        return {"components": [container]}
        
    elif msg_type == "cancel":
        container = Container(
            TextDisplay(content="### Unban cancelled\nThe operation was cancelled.")
        )
        return {"components": [container]}
        
    return {}
