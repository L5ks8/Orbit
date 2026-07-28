import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator


def get_embed(msg_type: str, **kwargs):
    if msg_type == "success":
        action = kwargs.get("action")
        type_str = kwargs.get("type")
        user = kwargs.get("user")
        amount = kwargs.get("amount")
        
        view = LayoutView()
        container = Container(
            TextDisplay(content="### Invites Managed"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"{action} **{amount}** {type_str} invites for {user.mention}.")
        )
        view.add_item(container)
        return {"view": view}
        
    if msg_type == "reset":
        msg = kwargs.get("msg")
        
        view = LayoutView()
        container = Container(
            TextDisplay(content="### Invites Reset"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=msg)
        )
        view.add_item(container)
        return {"view": view}

    return {}
