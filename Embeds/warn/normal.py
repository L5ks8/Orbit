import discord

def get_embed(msg_type: str, **kwargs):
    if msg_type == "dm":
        guild_name = kwargs.get("guild_name")
        warn_entry = kwargs.get("warn_entry")
        reason = kwargs.get("reason")
        punishment_text = kwargs.get("punishment_text", "")
        
        embed = discord.Embed(title=f"⚠️ Formal Warning Received", color=discord.Color.red())
        embed.add_field(name="Server", value=guild_name, inline=False)
        embed.add_field(name="Warn ID", value=f"`{warn_entry['warn_id']}`", inline=False)
        embed.add_field(name="Reason", value=f"{reason}{punishment_text}", inline=False)
        
        guild_id = kwargs.get("guild_id")
        if guild_id:
            from Commands.Appeals._storage import load_appeals_config
            appeals_cfg = load_appeals_config(guild_id)
            if appeals_cfg.get("enabled"):
                allowed = appeals_cfg.get("allowed_punishments", [])
                if "warn" in allowed:
                    custom_url = appeals_cfg.get("custom_url", "orbit")
                    import urllib.parse
                    encoded_url = urllib.parse.quote(custom_url)
                    embed.add_field(name="Appeals", value=f"[Click here to submit an appeal](https://orbit-498b.onrender.com/appeal/{encoded_url})", inline=False)

        return {"embed": embed}
        
    elif msg_type == "public":
        member = kwargs.get("member")
        warn_entry = kwargs.get("warn_entry")
        total_warns = kwargs.get("total_warns")
        
        embed = discord.Embed(title=f"⚠️ Warning Issued", color=discord.Color.orange())
        embed.add_field(name="User", value=member.mention, inline=False)
        embed.add_field(name="Warn ID", value=f"`{warn_entry['warn_id']}`", inline=True)
        embed.add_field(name="Total Warnings", value=f"`{total_warns}`", inline=True)
        embed.add_field(name="Moderator", value=f"<@{warn_entry['moderator_id']}>", inline=False)
        embed.add_field(name="Reason", value=warn_entry['reason'], inline=False)
        embed.add_field(name="Date", value=f"<t:{warn_entry['timestamp']}:f> (<t:{warn_entry['timestamp']}:R>)", inline=False)
        return {"embed": embed}
        
    return {}
