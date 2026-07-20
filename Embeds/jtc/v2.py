import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow

def get_embed(msg_type: str, **kwargs):
    if msg_type == "control":
        data = kwargs.get("data", {})
        components = kwargs.get("components", [])

        owner_id = data.get("owner_id", "Unknown")
        owner_mention = f"<@{owner_id}>" if owner_id != "Unknown" else "Unknown"

        status_lock = "Locked" if data.get("locked") else "Unlocked"
        status_vis = "Hidden" if data.get("hidden") else "Visible"

        trusted_list = data.get("trusted_users", [])
        if trusted_list:
            trusted_display = ", ".join(f"<@{u}>" for u in trusted_list)
        else:
            trusted_display = "*No trusted users*"

        header_str = f"### Your Voice Channel\n**Owner:** {owner_mention}"
        status_str = f"**Channel Status**\n{status_lock} | {status_vis}\n\n**Trusted Users**\n{trusted_display}"
        footer_str = "-# Use the buttons below to manage your channel."

        view = LayoutView(timeout=None)
        container = Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=status_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=footer_str)
        )
        
        if components:
            # Reconstruct the 4-per-row layout since components are passed flat
            row1 = ActionRow()
            row2 = ActionRow()
            for i, comp in enumerate(components):
                if i < 4:
                    row1.add_item(comp)
                else:
                    row2.add_item(comp)
            container.add_item(row1)
            container.add_item(row2)
            
        view.add_item(container)
        return {"view": view}
        
    return {}
