import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator


def get_embed(msg_type: str, **kwargs):
    if msg_type == "success":
        user = kwargs.get("user")
        
        view = LayoutView()
        container = Container(
            TextDisplay(content="### Export Invited List"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"Successfully exported the invited list for {user.mention}.")
        )
        view.add_item(container)
        return {"view": view}

    return {}
