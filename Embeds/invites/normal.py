import discord


def get_embed(msg_type: str, **kwargs):
    if msg_type == "info":
        target = kwargs.get("target")
        stats = kwargs.get("stats", {"total": 0, "regular": 0, "bonus": 0, "fake": 0, "left": 0})

        embed = discord.Embed(
            color=0x00FFFF
        )
        embed.set_author(name=target.display_name, icon_url=target.display_avatar.url if target else None)
        
        embed.description = (
            f"You currently have **{stats['total']}** invites. "
            f"(**{stats['regular']}** regular, **{stats['left']}** left, **{stats['fake']}** fake, **{stats['bonus']}** bonus)"
        )
        
        return {"embed": embed}

    return {}
