import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow

def get_embed(msg_type: str, **kwargs):
    count = kwargs.get("count", 0)
    content_text = kwargs.get("content_text", "")
    components = kwargs.get("components", [])

    if msg_type == "list":
        container = Container(
            TextDisplay(content=f"### Whitelist Overview ({count} Users)"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=content_text)
        )
        if components:
            container.add_item(Separator(spacing=discord.SeparatorSpacing.small))
            container.add_item(ActionRow(*components))

        view = LayoutView(timeout=300)
        view.add_item(container)
        return {"view": view}

    return {}
