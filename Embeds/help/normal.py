import discord

def get_embed(msg_type: str, **kwargs):
    if msg_type == "page":
        page_data = kwargs.get("page_data")
        current_page = kwargs.get("current_page")
        total_pages = kwargs.get("total_pages")
        icon_url = kwargs.get("icon_url")
        components = kwargs.get("components", [])

        embed = discord.Embed(
            title=f"Orbit Command Guide: {page_data['title']}",
            description=page_data["description"],
            color=discord.Color.blue()
        )
        if icon_url:
            embed.set_thumbnail(url=icon_url)
            
        embed.set_footer(text=f"Page {current_page + 1} of {total_pages}")

        view = discord.ui.View(timeout=None)
        
        # Add Select Menu
        if len(components) > 0:
            view.add_item(components[0])
            
        # Add Buttons in Action Row
        for comp in components[1:]:
            view.add_item(comp)
            
        return {"embed": embed, "view": view}
        
    return {}
