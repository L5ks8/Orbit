import discord
from discord.ui import View

def get_embed(msg_type: str, **kwargs):
    if msg_type == "dashboard":
        status_badge = kwargs.get("status_badge", "")
        link_str = kwargs.get("link_str", "")
        spam_str = kwargs.get("spam_str", "")
        alt_str = kwargs.get("alt_str", "")
        components = kwargs.get("components", [])

        embed = discord.Embed(title="Orbit AutoMod & Server Protection Dashboard", color=discord.Color.red())
        embed.add_field(name="Master Status", value=status_badge, inline=False)
        embed.add_field(name="1. Anti-Link / Anti-Invite", value=f"{link_str}\nAutomatically deletes Discord invite links (`discord.gg/`) and unauthorized links.", inline=False)
        embed.add_field(name="2. Anti-Spam / Anti-Raid", value=f"{spam_str}\nDetects message flood across all channels. If action is `WARN`, accumulating 5+ warnings automatically locks the user in timeout (1 Day -> 3 Days -> 7 Days).", inline=False)
        embed.add_field(name="3. Anti-Alt (Account Age Defense)", value=f"{alt_str}\nChecks account age of joining members to block suspicious alts & bots before they raid.", inline=False)

        view = View(timeout=None)
        for comp in components: view.add_item(comp)
        return {"embed": embed, "view": view}

    elif msg_type == "notice":
        user_mention = kwargs.get("user_mention", "")
        user_id = kwargs.get("user_id", "")
        reason = kwargs.get("reason", "")
        action_taken = kwargs.get("action_taken", "")
        warn_count = kwargs.get("warn_count", 0)
        escalation_str = kwargs.get("escalation_str", "")

        embed = discord.Embed(title="Orbit AutoMod Triggered", color=discord.Color.orange())
        embed.add_field(name="Target", value=f"{user_mention} (`{user_id}`)", inline=False)
        embed.add_field(name="Reason", value=reason, inline=True)
        embed.add_field(name="Action Taken", value=f"`{action_taken.upper()}` (Total Warnings: {warn_count})", inline=True)
        if escalation_str:
            embed.add_field(name="Escalation", value=f"`{escalation_str}`", inline=False)
        return {"embed": embed}

    return {}
