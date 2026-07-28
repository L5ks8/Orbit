import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator


def get_embed(msg_type: str, **kwargs):
    if msg_type == "info":
        target = kwargs.get("target")
        stats = kwargs.get("stats", {"total": 0, "regular": 0, "bonus": 0, "fake": 0, "left": 0})

        view = LayoutView()
        
        description = (
            f"**{target.display_name}**\n"
            f"You currently have **{stats['total']}** invites. "
            f"(**{stats['regular']}** regular, **{stats['left']}** left, **{stats['fake']}** fake, **{stats['bonus']}** bonus)"
        )
        
        container = Container(
            TextDisplay(content=description)
        )
        view.add_item(container)
        return {"view": view}

    return {}
