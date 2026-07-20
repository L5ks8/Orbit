import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator

def get_embed(msg_type: str, **kwargs):
    if msg_type == "clear":
        member_mention = kwargs.get("member_mention", "")
        member_id = kwargs.get("member_id", "")
        cleared_count = kwargs.get("cleared_count", 0)

        header_str = f"### ⚠️ All Warnings Cleared\n**Target Member:** {member_mention} (`{member_id}`)"
        content_str = f"**Total Removed:** `{cleared_count}` warnings\n**Current Remaining Warnings:** `0`"
        
        container = Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=content_str)
        )

        view = LayoutView()
        view.add_item(container)
        return {"view": view}

    return {}
