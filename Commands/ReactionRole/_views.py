import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator, Button, ActionRow, MediaGallery

class ReactionRolePanelLayout(LayoutView):
    def __init__(self, title: str, description: str, roles: list[discord.Role], image_url: str | None = None):
        super().__init__(timeout=None)

        items = [
            TextDisplay(content=f"### {title}\n{description}"),
            Separator(spacing=discord.SeparatorSpacing.small)
        ]

        if image_url and image_url.strip():
            gallery = MediaGallery()
            gallery.add_item(media=image_url.strip())
            items.append(gallery)

        self.container = Container(*items)

        valid_roles = [r for r in roles if r is not None]
        row = ActionRow()
        for idx, role in enumerate(valid_roles):
            if idx > 0 and idx % 5 == 0:
                self.container.add_item(row)
                row = ActionRow()

            btn = Button(
                label=f"{role.name}",
                style=discord.ButtonStyle.secondary,
                custom_id=f"rr_btn_{role.id}"
            )
            row.add_item(btn)

        if row.children:
            self.container.add_item(row)

        self.add_item(self.container)

