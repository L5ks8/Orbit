import discord


def get_embed(msg_type: str, **kwargs):
    if msg_type == "deleted":
        code = kwargs.get("code")
        embed = discord.Embed(
            title="Invite Deleted",
            description=f"Successfully deleted the invite code `{code}`.",
            color=discord.Color.green()
        )
        return {"embed": embed}
        
    if msg_type == "purged":
        count = kwargs.get("count")
        condition = kwargs.get("condition")
        
        embed = discord.Embed(
            title="Invites Purged",
            description=f"Successfully purged **{count}** invite(s) matching condition `{condition}`.",
            color=discord.Color.green()
        )
        return {"embed": embed}

    return {}
