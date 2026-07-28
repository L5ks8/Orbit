import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator


def get_embed(msg_type: str, **kwargs):
    if msg_type == "info":
        target = kwargs.get("target")
        invited = kwargs.get("invited", [])
        is_code = kwargs.get("is_code", False)

        view = LayoutView()

        if is_code:
            header = f"Members invited with code `{target}`"
        else:
            header = f"Members invited by {target.mention}"

        if not invited:
            container = Container(
                TextDisplay(content="### Invited List"),
                Separator(spacing=discord.SeparatorSpacing.small),
                TextDisplay(content=f"{header}\n\nNo invited members found.")
            )
        else:
            lines = []
            for i, entry in enumerate(invited[:25], 1):
                user = entry.get("user")
                code = entry.get("code", "?")
                if user:
                    lines.append(f"`{i}.` {user.mention} — Code: `{code}`")
                else:
                    uid = entry.get("user_id", "?")
                    lines.append(f"`{i}.` User ID: `{uid}` — Code: `{code}`")
            body = "\n".join(lines)
            if len(invited) > 25:
                body += f"\n\n-# Showing 25 of {len(invited)} invited members"
            container = Container(
                TextDisplay(content="### Invited List"),
                Separator(spacing=discord.SeparatorSpacing.small),
                TextDisplay(content=f"{header}\n\n{body}")
            )

        view.add_item(container)
        return {"view": view}

    return {}
