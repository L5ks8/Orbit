import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator


def get_embed(msg_type: str, **kwargs):
    if msg_type == "info":
        target = kwargs.get("target")
        invites = kwargs.get("invites", [])

        view = LayoutView()

        if not invites:
            container = Container(
                TextDisplay(content=f"### Invite Codes"),
                Separator(spacing=discord.SeparatorSpacing.small),
                TextDisplay(content=f"{target.mention} has no active invite codes.")
            )
        else:
            lines = []
            for inv in invites[:25]:
                expires = "Never" if inv.max_age == 0 else f"<t:{int(inv.created_at.timestamp()) + inv.max_age}:R>"
                max_uses = "∞" if inv.max_uses == 0 else str(inv.max_uses)
                lines.append(f"`{inv.code}` — **{inv.uses}**/{max_uses} uses — Expires: {expires}")
            body = "\n".join(lines)
            if len(invites) > 25:
                body += f"\n\n-# Showing 25 of {len(invites)} invite codes"
            container = Container(
                TextDisplay(content=f"### Invite Codes"),
                Separator(spacing=discord.SeparatorSpacing.small),
                TextDisplay(content=f"**Invite codes for {target.mention}:**\n\n{body}")
            )

        view.add_item(container)
        return {"view": view}

    return {}
