import discord


def get_embed(msg_type: str, **kwargs):
    if msg_type == "info":
        target = kwargs.get("target")
        invited = kwargs.get("invited", [])
        guild = kwargs.get("guild")
        is_code = kwargs.get("is_code", False)

        embed = discord.Embed(
            title="Invited List",
            color=discord.Color.blurple()
        )

        if is_code:
            header = f"Members invited with code `{target}`"
        else:
            header = f"Members invited by {target.mention}"
            embed.set_thumbnail(url=target.display_avatar.url if hasattr(target, "display_avatar") else None)

        if not invited:
            embed.description = f"{header}\n\nNo invited members found."
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
            embed.description = f"{header}\n\n" + "\n".join(lines)
            if len(invited) > 25:
                embed.set_footer(text=f"Showing 25 of {len(invited)} invited members")
            elif guild:
                embed.set_footer(text=guild.name, icon_url=guild.icon.url if guild.icon else None)

        return {"embed": embed}

    return {}
