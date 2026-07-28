import discord


def get_embed(msg_type: str, **kwargs):
    if msg_type == "success":
        action = kwargs.get("action")
        type_str = kwargs.get("type")
        user = kwargs.get("user")
        amount = kwargs.get("amount")
        
        embed = discord.Embed(
            title="Invites Managed",
            description=f"{action} **{amount}** {type_str} invites for {user.mention}.",
            color=discord.Color.green()
        )
        return {"embed": embed}
        
    if msg_type == "reset":
        msg = kwargs.get("msg")
        embed = discord.Embed(
            title="Invites Reset",
            description=msg,
            color=discord.Color.red()
        )
        return {"embed": embed}

    return {}
