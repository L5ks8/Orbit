import discord
from discord.ui import View

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

        embed = discord.Embed(title=f"🎉 GIVEAWAY: {prize} 🎉", color=discord.Color.purple())
        embed.description = (
            f"**Prize:** {prize}\n"
            f"**Winners:** `{winners}`\n"
            f"**Ends:** <t:{end_timestamp}:R> (<t:{end_timestamp}:f>)\n"
            f"**Hosted By:** <@{author_id}>{req_text}\n\n"
            f"**Total Entries:** `{total_entries}`"
        )
        embed.set_footer(text=f"Giveaway ID: {giveaway_id}")

        view = View(timeout=None)
        for comp in components: view.add_item(comp)
        return {"embed": embed, "view": view}

    elif msg_type == "ended":
        prize = kwargs.get("prize", "")
        winners_display = kwargs.get("winners_display", "`No valid entries`")
        end_timestamp = kwargs.get("end_timestamp", 0)
        author_id = kwargs.get("author_id", 0)
        req_text = kwargs.get("req_text", "")
        total_entries = kwargs.get("total_entries", 0)
        giveaway_id = kwargs.get("giveaway_id", "")
        components = kwargs.get("components", [])

        embed = discord.Embed(title=f"🎉 GIVEAWAY ENDED: {prize} 🎉", color=discord.Color.dark_grey())
        embed.description = (
            f"**Prize:** {prize}\n"
            f"**Winner(s):** {winners_display}\n"
            f"**Ended On:** <t:{end_timestamp}:f>\n"
            f"**Hosted By:** <@{author_id}>{req_text}\n\n"
            f"**Total Entries:** `{total_entries}`"
        )
        embed.set_footer(text=f"Giveaway ID: {giveaway_id}")

        view = View(timeout=None)
        for comp in components: view.add_item(comp)
        return {"embed": embed, "view": view}

    return {}
