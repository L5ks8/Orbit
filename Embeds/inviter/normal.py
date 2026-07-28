import discord


def get_embed(msg_type: str, **kwargs):
    if msg_type == "info":
        target = kwargs.get("target")
        inviter = kwargs.get("inviter")
        code = kwargs.get("code")
        guild = kwargs.get("guild")

        embed = discord.Embed(
            title="Inviter",
            color=discord.Color.blurple()
        )
        embed.set_thumbnail(url=target.display_avatar.url if target else None)

        if inviter:
            embed.description = (
                f"**Member:** {target.mention}\n"
                f"**Invited by:** {inviter.mention}\n"
                f"**Invite Code:** `{code or 'Unknown'}`"
            )
        else:
            embed.description = f"No invite data found for {target.mention}."

        if guild:
            embed.set_footer(text=guild.name, icon_url=guild.icon.url if guild.icon else None)

        return {"embed": embed}

    return {}
