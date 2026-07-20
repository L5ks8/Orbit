import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow

def get_embed(msg_type: str, **kwargs):
    if msg_type == "dashboard":
        status_badge = kwargs.get("status_badge", "")
        link_str = kwargs.get("link_str", "")
        spam_str = kwargs.get("spam_str", "")
        alt_str = kwargs.get("alt_str", "")
        components = kwargs.get("components", [])

        header_text = f"### Orbit AutoMod & Server Protection Dashboard\n**Master Status:** {status_badge}"
        details_text = (
            f"**1. Anti-Link / Anti-Invite**\n"
            f"> {link_str}\n> Automatically deletes Discord invite links (`discord.gg/`) and unauthorized links.\n\n"
            f"**2. Anti-Spam / Anti-Raid**\n"
            f"> {spam_str}\n> Detects message flood across all channels. If action is `WARN`, accumulating 5+ warnings automatically locks the user in timeout (1 Day -> 3 Days -> 7 Days).\n\n"
            f"**3. Anti-Alt (Account Age Defense)**\n"
            f"> {alt_str}\n> Checks account age of joining members to block suspicious alts & bots before they raid."
        )

        container = Container(
            TextDisplay(content=header_text), Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=details_text), Separator(spacing=discord.SeparatorSpacing.small),
            *(ActionRow(comp) for comp in components)
        )
        view = LayoutView(timeout=300.0)
        view.add_item(container)
        return {"view": view}

    elif msg_type == "notice":
        user_mention = kwargs.get("user_mention", "")
        user_id = kwargs.get("user_id", "")
        reason = kwargs.get("reason", "")
        action_taken = kwargs.get("action_taken", "")
        warn_count = kwargs.get("warn_count", 0)
        escalation_str = kwargs.get("escalation_str", "")

        header = f"### Orbit AutoMod Triggered\n**Target:** {user_mention} (`{user_id}`)"
        body = f"**Reason:** {reason}\n**Action Taken:** `{action_taken.upper()}` (`Total Warnings: {warn_count}`)"
        if escalation_str:
            body += f"\n**Escalation:** `{escalation_str}`"

        container = Container(TextDisplay(content=header), Separator(spacing=discord.SeparatorSpacing.small), TextDisplay(content=body))
        view = LayoutView()
        view.add_item(container)
        return {"view": view}

    return {}
