import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator

def get_embed(msg_type: str, **kwargs):
    if msg_type == "set":
        author = kwargs.get("author")
        reason = kwargs.get("reason")
        
        view = LayoutView()
        container = Container(
            TextDisplay(content=f"### AFK Status Enabled\n**User:** {author.mention} (`{author.id}`)"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Reason:** {reason}")
        )
        view.add_item(container)
        return {"view": view}
        
    elif msg_type == "notice":
        target = kwargs.get("target")
        reason = kwargs.get("reason")
        timestamp = kwargs.get("timestamp")
        
        since_text = f"\n**Since:** <t:{timestamp}:R>" if timestamp else ""
        view = LayoutView()
        container = Container(
            TextDisplay(content=f"### AFK Notice\n**User:** {target.mention} is currently AFK."),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Reason:** {reason}{since_text}")
        )
        view.add_item(container)
        return {"view": view}
        
    elif msg_type == "remove":
        author = kwargs.get("author")
        
        view = LayoutView()
        container = Container(
            TextDisplay(content=f"### AFK Status Removed\nWelcome back, {author.mention} (`{author.id}`)!"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content="Your AFK status on this server has been cleared.")
        )
        view.add_item(container)
        return {"view": view}
        
    return {}
