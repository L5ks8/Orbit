import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator


def get_embed(msg_type: str, **kwargs):
    if msg_type == "info":
        lb = kwargs.get("leaderboard", [])

        view = LayoutView()
        
        if not lb:
            container = Container(
                TextDisplay(content="### Invite Leaderboard"),
                Separator(spacing=discord.SeparatorSpacing.small),
                TextDisplay(content="No invite data found for this server.")
            )
        else:
            lines = []
            for i, data in enumerate(lb, 1):
                uid = data["user_id"]
                lines.append(f"`{i}.` <@{uid}> — **{data['total']}** invites (`{data['regular']}` regular, `{data['bonus']}` bonus, `{data['fake']}` fake, `{data['left']}` left)")
            
            container = Container(
                TextDisplay(content="### Invite Leaderboard"),
                Separator(spacing=discord.SeparatorSpacing.small),
                TextDisplay(content="\n".join(lines))
            )

        view.add_item(container)
        return {"view": view}

    return {}
