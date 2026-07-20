import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator

def get_embed(msg_type: str, **kwargs):
    if msg_type == "delete":
        member_mention = kwargs.get("member_mention", "")
        member_id = kwargs.get("member_id", "")
        warn_id = kwargs.get("warn_id", "")
        remaining = kwargs.get("remaining", 0)

        header_str = f"### ⚠️ Warning Deleted\n**Target Member:** {member_mention} (`{member_id}`)"
        content_str = f"**Removed ID:** `{warn_id}`\n\n**Current Remaining Warnings:** `{remaining}`"
        
        container = Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=content_str)
        )

        view = LayoutView()
        view.add_item(container)
        return {"view": view}

    return {}
