import discord

def get_embed(msg_type: str, **kwargs):
    count = kwargs.get("count", 0)
    content_text = kwargs.get("content_text", "")
    components = kwargs.get("components", [])

    embed = discord.Embed(color=discord.Color.blue())

    if msg_type == "list":
        embed.title = f"Whitelist Overview ({count} Users)"
        embed.description = content_text

        from discord.ui import View
        view = View(timeout=300)
        for comp in components:
            view.add_item(comp)
        return {"embed": embed, "view": view}

    return {"embed": embed}
