import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator

def get_embed(msg_type: str, **kwargs):
    if msg_type == "success":
        target = kwargs.get("target")
        reason = kwargs.get("reason")
        author = kwargs.get("author")
        channels_restored = kwargs.get("channels_restored")
        
        view = LayoutView()
        container = Container(
            TextDisplay(content=f"### User Unmuted\n**Target:** {target.mention} (`{target.id}`)"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Reason:** {reason}\n**Moderator:** {author.mention}\n**Channel Overrides:** User permissions restored in `{channels_restored}` channel(s).")
        )
        view.add_item(container)
        return {"view": view}
        
    return {}
