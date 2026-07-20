import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow

def get_embed(msg_type: str, **kwargs):
    if msg_type == "active":
        prize = kwargs.get("prize", "")
        winners = kwargs.get("winners", 1)
        end_timestamp = kwargs.get("end_timestamp", 0)
        author_id = kwargs.get("author_id", 0)
        req_text = kwargs.get("req_text", "")
        total_entries = kwargs.get("total_entries", 0)
        giveaway_id = kwargs.get("giveaway_id", "")
        components = kwargs.get("components", [])

        header = f"### GIVEAWAY: **{prize}**\n**Winners:** `{winners}`"
        info = (
            f"**Prize:** {prize}\n"
            f"**Ends:** <t:{end_timestamp}:R> (<t:{end_timestamp}:f>)\n"
            f"**Hosted By:** <@{author_id}>{req_text}\n\n"
            f"**Total Entries:** `{total_entries}`"
        )
        container = Container(
            TextDisplay(content=header),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=info),
            Separator(spacing=discord.SeparatorSpacing.small),
            *(ActionRow(comp) for comp in components),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Giveaway ID:** `{giveaway_id}`")
        )
        view = LayoutView(timeout=None)
        view.add_item(container)
        return {"view": view}

    elif msg_type == "ended":
        prize = kwargs.get("prize", "")
        winners_display = kwargs.get("winners_display", "`No valid entries`")
        end_timestamp = kwargs.get("end_timestamp", 0)
        author_id = kwargs.get("author_id", 0)
        req_text = kwargs.get("req_text", "")
        total_entries = kwargs.get("total_entries", 0)
        giveaway_id = kwargs.get("giveaway_id", "")
        components = kwargs.get("components", [])

        header = f"### GIVEAWAY ENDED: **{prize}**"
        info = (
            f"**Prize:** {prize}\n"
            f"**Winner(s):** {winners_display}\n"
            f"**Ended On:** <t:{end_timestamp}:f>\n"
            f"**Hosted By:** <@{author_id}>{req_text}\n\n"
            f"**Total Entries:** `{total_entries}`"
        )
        container = Container(
            TextDisplay(content=header),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=info),
            Separator(spacing=discord.SeparatorSpacing.small),
            *(ActionRow(comp) for comp in components),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Giveaway ID:** `{giveaway_id}`")
        )
        view = LayoutView(timeout=None)
        view.add_item(container)
        return {"view": view}

    return {}
