import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow

def get_embed(msg_type: str, **kwargs):
    if msg_type == "composer":
        target = kwargs.get("target")
        components = kwargs.get("components", [])
        
        view = LayoutView(timeout=180.0)
        
        ar = ActionRow()
        for comp in components:
            ar.add_item(comp)

        container = Container(
            TextDisplay(content=f"### Direct Message Composer\n**Target:** {target.mention} (`{target.id}`)"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content="Click the button below to open the text box and compose your message."),
            Separator(spacing=discord.SeparatorSpacing.small),
            ar
        )
        view.add_item(container)
        return {"view": view}
        
    elif msg_type == "success":
        target = kwargs.get("target")
        exact_content = kwargs.get("exact_content")
        
        view = LayoutView(timeout=None)
        container = Container(
            TextDisplay(content=f"### DM Sent Successfully\n**To:** {target.mention} (`{target.id}`)"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Message sent:**\n{exact_content}")
        )
        view.add_item(container)
        return {"view": view}
        
    return {}
