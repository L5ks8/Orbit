import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator

def get_embed(msg_type: str, **kwargs):
    if msg_type == "success":
        target = kwargs.get("target")
        reason = kwargs.get("reason")
        author = kwargs.get("author")
        channels_count = kwargs.get("channels_count")
        
        view = LayoutView()
        container = Container(
            TextDisplay(content=f"### User Muted\n**Target:** {target.mention} (`{target.id}`)"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Reason:** {reason}\n**Moderator:** {author.mention}\n**Channel Overrides:** User permissions disabled in `{channels_count}` channel(s).")
        )
        view.add_item(container)
        return {"view": view}
        
    return {}
