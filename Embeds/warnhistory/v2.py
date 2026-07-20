import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow

def get_embed(msg_type: str, **kwargs):
    if msg_type == "history":
        member_mention = kwargs.get("member_mention", "")
        page = kwargs.get("page", 1)
        total_pages = kwargs.get("total_pages", 1)
        total_warnings = kwargs.get("total_warnings", 0)
        warns_text = kwargs.get("warns_text", "")
        components = kwargs.get("components", [])

        header_content = (
            f"### ⚠️ Permanent Warning History: {member_mention} (Page {page} of {total_pages})\n"
            f"**Total Past Warnings:** `{total_warnings}`"
        )
        
        container = Container(
            TextDisplay(content=header_content),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=warns_text),
            Separator(spacing=discord.SeparatorSpacing.small)
        )
        
        if components:
            container.add_item(ActionRow(*components))

        view = LayoutView(timeout=300)
        view.add_item(container)
        return {"view": view}

    return {}
