import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator

def get_embed(msg_type: str, **kwargs):
    slots = kwargs.get("slots", 0)
    panel_str = kwargs.get("panel_str", "`Not set`")
    log_str = kwargs.get("log_str", "`None`")
    slots_display = kwargs.get("slots_display", "")
    components = kwargs.get("components", [])

    header_str = f"### Ticket Desk Builder ({slots} options)\n**Panel:** {panel_str} | **Log:** {log_str}"
    info_str = (
        f"{slots_display}\n\n"
        f"Select a slot, then assign a role and category."
    )

    container = Container(
        TextDisplay(content=header_str),
        Separator(spacing=discord.SeparatorSpacing.small),
        TextDisplay(content=info_str)
    )

    view = LayoutView(timeout=900)
    view.add_item(container)
    for comp in components:
        view.add_item(comp)

    return {"view": view}
