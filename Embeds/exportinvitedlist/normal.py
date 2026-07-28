import discord


def get_embed(msg_type: str, **kwargs):
    if msg_type == "success":
        user = kwargs.get("user")
        embed = discord.Embed(
            title="Export Invited List",
            description=f"Successfully exported the invited list for {user.mention}.",
            color=discord.Color.green()
        )
        return {"embed": embed}
    return {}
