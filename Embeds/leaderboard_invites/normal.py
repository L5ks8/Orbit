import discord


def get_embed(msg_type: str, **kwargs):
    if msg_type == "info":
        lb = kwargs.get("leaderboard", [])
        limit = kwargs.get("limit", 10)
        guild = kwargs.get("guild")

        embed = discord.Embed(
            title="Invite Leaderboard",
            color=discord.Color.blurple()
        )

        if not lb:
            embed.description = "No invite data found for this server."
        else:
            lines = []
            for i, data in enumerate(lb, 1):
                uid = data["user_id"]
                lines.append(f"`{i}.` <@{uid}> — **{data['total']}** invites (`{data['regular']}` regular, `{data['bonus']}` bonus, `{data['fake']}` fake, `{data['left']}` left)")
            embed.description = "\n".join(lines)

        if guild:
            embed.set_footer(text=guild.name, icon_url=guild.icon.url if guild.icon else None)

        return {"embed": embed}

    return {}
