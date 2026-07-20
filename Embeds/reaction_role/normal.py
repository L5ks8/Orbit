import discord
from discord.ui import View, Button

def get_embed(msg_type: str, **kwargs):
    title = kwargs.get("title", "Reaction Roles")
    description = kwargs.get("description", "Click any button below to assign or remove the corresponding role.")
    image_url = kwargs.get("image_url")
    roles = kwargs.get("roles", [])

    embed = discord.Embed(
        title=title,
        description=description,
        color=discord.Color.blue()
    )
    if image_url:
        embed.set_image(url=image_url)

    view = View(timeout=None)
    for role in roles:
        if role is not None:
            btn = Button(
                label=f"{role.name}",
                style=discord.ButtonStyle.secondary,
                custom_id=f"rr_btn_{role.id}"
            )
            view.add_item(btn)

    return {"embed": embed, "view": view}
