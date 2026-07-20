import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator

def get_embed(msg_type: str, **kwargs):
    target_mention = kwargs.get("target_mention", "Unknown")
    target_id = kwargs.get("target_id", 0)
    target_name = kwargs.get("target_name", "Unknown")
    old_nick = kwargs.get("old_nick")
    new_nick = kwargs.get("new_nick")
    author_mention = kwargs.get("author_mention", "Unknown")

    old_display = old_nick if old_nick else f"{target_name} (Default)"
    new_display = new_nick if new_nick else f"{target_name} (Reset to Default)"

    container = Container(
        TextDisplay(content=f"### Nickname Updated\n**Target:** {target_mention} (`{target_id}`)"),
        Separator(spacing=discord.SeparatorSpacing.small),
        TextDisplay(content=f"**Old Nickname:** `{old_display}`\n**New Nickname:** `{new_display}`\n**Changed by:** {author_mention}")
    )
    
    view = LayoutView()
    view.add_item(container)
    return {"view": view}
