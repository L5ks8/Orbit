import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator

def get_embed(msg_type: str, **kwargs):
    if msg_type == "success":
        target = kwargs.get("target")
        reason = kwargs.get("reason")
        author = kwargs.get("author")
        role = kwargs.get("role")
        role_str = f"\n**Role Removed:** {role.mention}" if role else ""
        
        view = LayoutView()
        container = Container(
            TextDisplay(content=f"### User Unmuted\n**Target:** {target.mention} (`{target.id}`)"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Reason:** {reason}\n**Moderator:** {author.mention}{role_str}")
        )
        view.add_item(container)
        return {"view": view}
        
    return {}
