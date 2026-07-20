import discord

def get_embed(msg_type: str, **kwargs):
    if msg_type == "delete":
        member_mention = kwargs.get("member_mention", "")
        member_id = kwargs.get("member_id", "")
        warn_id = kwargs.get("warn_id", "")
        remaining = kwargs.get("remaining", 0)

        embed = discord.Embed(
            title="⚠️ Warning Deleted",
            description=f"**Target Member:** {member_mention} (`{member_id}`)",
            color=discord.Color.green()
        )
        embed.add_field(name="Removed ID", value=f"`{warn_id}`", inline=True)
        embed.add_field(name="Remaining Warnings", value=f"`{remaining}`", inline=True)

        return {"embed": embed}

    return {}
