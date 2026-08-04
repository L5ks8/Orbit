import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow

def get_embed(msg_type: str, **kwargs):
    if msg_type == "list":
        count = kwargs.get("count")
        lines = kwargs.get("lines")
        components = kwargs.get("components", [])

        if count == 0:
            content_text = "The blacklist is currently empty for this server."
        else:
            content_text = "\n".join(lines)
            if count > 15:
                content_text += f"\n\n*And {count - 15} more users...*"

        view = LayoutView(timeout=300)
        container = Container(
            TextDisplay(content=f"### Blacklist Overview ({count} Users)"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=content_text)
        )
        
        if components:
            ar = ActionRow()
            for comp in components:
                ar.add_item(comp)
            container.add_item(ar)
            
        view.add_item(container)
        return {"view": view}
        
    return {}
