import discord

def get_embed(msg_type: str, **kwargs):
    slots = kwargs.get("slots", 0)
    panel_str = kwargs.get("panel_str", "`Not set`")
    log_str = kwargs.get("log_str", "`None`")
    slots_display = kwargs.get("slots_display", "")
    components = kwargs.get("components", [])

    embed = discord.Embed(
        title=f"Ticket Desk Builder ({slots} options)",
        description=(
            f"**Panel:** {panel_str} | **Log:** {log_str}\n\n"
            f"{slots_display}\n\n"
            f"Select a slot, then assign a role and category."
        ),
        color=discord.Color.blue()
    )

    from discord.ui import View
    view = View(timeout=900)
    for comp in components:
        view.add_item(comp)

    return {"embed": embed, "view": view}
