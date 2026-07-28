import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator


def get_embed(msg_type: str, **kwargs):
    if msg_type == "deleted":
        code = kwargs.get("code")
        
        view = LayoutView()
        container = Container(
            TextDisplay(content="### Invite Deleted"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"Successfully deleted the invite code `{code}`.")
        )
        view.add_item(container)
        return {"view": view}
        
    if msg_type == "purged":
        count = kwargs.get("count")
        condition = kwargs.get("condition")
        
        view = LayoutView()
        container = Container(
            TextDisplay(content="### Invites Purged"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"Successfully purged **{count}** invite(s) matching condition `{condition}`.")
        )
        view.add_item(container)
        return {"view": view}

    return {}
