import discord

def get_embed(msg_type: str, **kwargs):
    if msg_type == "clear":
        member_mention = kwargs.get("member_mention", "")
        member_id = kwargs.get("member_id", "")
        cleared_count = kwargs.get("cleared_count", 0)

        embed = discord.Embed(
            title="⚠️ All Warnings Cleared",
            description=f"**Target Member:** {member_mention} (`{member_id}`)",
            color=discord.Color.green()
        )
        embed.add_field(name="Total Removed", value=f"`{cleared_count}` warnings", inline=True)
        embed.add_field(name="Current Remaining", value="`0`", inline=True)

        return {"embed": embed}

    return {}
