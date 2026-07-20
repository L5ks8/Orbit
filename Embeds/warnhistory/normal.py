import discord
from discord.ui import View

def get_embed(msg_type: str, **kwargs):
    if msg_type == "history":
        member_mention = kwargs.get("member_mention", "")
        page = kwargs.get("page", 1)
        total_pages = kwargs.get("total_pages", 1)
        total_warnings = kwargs.get("total_warnings", 0)
        warns_text = kwargs.get("warns_text", "")
        components = kwargs.get("components", [])

        embed = discord.Embed(
            title=f"⚠️ Permanent Warning History (Page {page} of {total_pages})",
            description=warns_text,
            color=discord.Color.dark_orange()
        )
        embed.add_field(name="Target", value=member_mention, inline=True)
        embed.add_field(name="Total Past Warnings", value=f"`{total_warnings}`", inline=True)

        view = View(timeout=300)
        for comp in components:
            view.add_item(comp)
        return {"embed": embed, "view": view}

    return {}
