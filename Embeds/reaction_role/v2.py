import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator, Button, ActionRow, MediaGallery

def get_embed(msg_type: str, **kwargs):
    title = kwargs.get("title", "Reaction Roles")
    description = kwargs.get("description", "Click any button below to assign or remove the corresponding role.")
    image_url = kwargs.get("image_url")
    roles = kwargs.get("roles", [])

    items = [
        TextDisplay(content=f"### {title}\n{description}"),
        Separator(spacing=discord.SeparatorSpacing.small)
    ]

    if image_url and image_url.strip():
        gallery = MediaGallery()
        gallery.add_item(media=image_url.strip())
        items.append(gallery)

    container = Container(*items)

    valid_roles = [r for r in roles if r is not None]
    row = ActionRow()
    for idx, role in enumerate(valid_roles):
        if idx > 0 and idx % 5 == 0:
            container.add_item(row)
            row = ActionRow()

        btn = Button(
            label=f"{role.name}",
            style=discord.ButtonStyle.secondary,
            custom_id=f"rr_btn_{role.id}"
        )
        row.add_item(btn)

    if row.children:
        container.add_item(row)

    view = LayoutView(timeout=None)
    view.add_item(container)

    return {"view": view}
