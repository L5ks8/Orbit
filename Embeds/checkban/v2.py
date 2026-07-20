import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator

def get_embed(ban_entry, reason: str):
    container = Container(
        TextDisplay(content=f"### User is Banned\n**User:** {ban_entry.user.mention} (`{ban_entry.user.id}`)"),
        Separator(spacing=discord.SeparatorSpacing.small),
        TextDisplay(content=f"**Reason:** {reason}")
    )
    view = LayoutView()
    view.add_item(container)
    return {"view": view, "allowed_mentions": discord.AllowedMentions.none()}
