import discord


def get_embed(msg_type: str, **kwargs):
    if msg_type == "info":
        target = kwargs.get("target")
        invites = kwargs.get("invites", [])
        guild = kwargs.get("guild")

        embed = discord.Embed(
            title="Invite Codes",
            color=discord.Color.blurple()
        )
        embed.set_thumbnail(url=target.display_avatar.url if hasattr(target, "display_avatar") else None)

        if not invites:
            embed.description = f"{target.mention} has no active invite codes."
        else:
            lines = []
            for inv in invites[:25]:
                expires = "Never" if inv.max_age == 0 else f"<t:{int(inv.created_at.timestamp()) + inv.max_age}:R>"
                max_uses = "∞" if inv.max_uses == 0 else str(inv.max_uses)
                lines.append(
                    f"`{inv.code}` — **{inv.uses}**/{max_uses} uses — Expires: {expires}"
                )
            embed.description = f"**Invite codes for {target.mention}:**\n\n" + "\n".join(lines)
            if len(invites) > 25:
                embed.set_footer(text=f"Showing 25 of {len(invites)} invite codes")
            elif guild:
                embed.set_footer(text=guild.name, icon_url=guild.icon.url if guild.icon else None)

        return {"embed": embed}

    return {}
