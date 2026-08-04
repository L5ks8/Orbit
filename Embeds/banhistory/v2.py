import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow

def get_embed(msg_type: str, **kwargs):
    if msg_type == "list":
        target_id = kwargs.get("target_id")
        target_name = kwargs.get("target_name")
        total_bans = kwargs.get("total_bans")
        page = kwargs.get("page")
        total_pages = kwargs.get("total_pages")
        slice_bans = kwargs.get("slice_bans", [])
        components = kwargs.get("components", [])

        lines = []
        for b in slice_bans:
            lines.append(
                f"**ID:** `{b['ban_id']}` | **Mod:** <@{b['moderator_id']}>\n"
                f"**Reason:** {b['reason']} (<t:{b['timestamp']}:R>)"
            )
        bans_text = "\n\n".join(lines) if lines else "No ban history found on this page."
        
        header_content = (
            f"### 🔨 Permanent Ban History: <@{target_id}> (Page {page} of {total_pages})\n"
            f"**Total Past Bans:** `{total_bans}`"
        )
        
        view = LayoutView(timeout=300)
        container = Container(
            TextDisplay(content=header_content),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=bans_text),
            Separator(spacing=discord.SeparatorSpacing.small)
        )
        
        if components:
            ar = ActionRow()
            for comp in components:
                ar.add_item(comp)
            container.add_item(ar)
            
        view.add_item(container)
        return {"view": view}
    return {}
