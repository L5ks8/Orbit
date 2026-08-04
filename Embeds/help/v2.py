import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow

def _create_thumbnail(url: str):
    Thumbnail = getattr(discord.ui, "Thumbnail", None)
    if not Thumbnail:
        return None
    try:
        return Thumbnail(media=url)
    except TypeError:
        try:
            return Thumbnail(url=url)
        except Exception:
            try:
                return Thumbnail(url)
            except Exception:
                return None

def get_embed(msg_type: str, **kwargs):
    if msg_type == "page":
        page_data = kwargs.get("page_data")
        current_page = kwargs.get("current_page")
        total_pages = kwargs.get("total_pages")
        icon_url = kwargs.get("icon_url")
        components = kwargs.get("components", [])
        
        header_str = f"### Orbit Command Guide: **{page_data['title']}**\n**Page:** `{current_page + 1} / {total_pages}`"
        info_str = page_data["description"]
        
        thumbnail = _create_thumbnail(icon_url) if icon_url else None
        Section = getattr(discord.ui, "Section", None)

        if thumbnail and Section:
            try:
                top_section = Section(TextDisplay(content=header_str), accessory=thumbnail)
                items = [
                    top_section,
                    Separator(spacing=discord.SeparatorSpacing.small),
                    TextDisplay(content=info_str),
                    Separator(spacing=discord.SeparatorSpacing.small)
                ]
            except Exception:
                items = [
                    TextDisplay(content=header_str),
                    Separator(spacing=discord.SeparatorSpacing.small),
                    TextDisplay(content=info_str),
                    Separator(spacing=discord.SeparatorSpacing.small)
                ]
        else:
            items = [
                TextDisplay(content=header_str),
                Separator(spacing=discord.SeparatorSpacing.small),
                TextDisplay(content=info_str),
                Separator(spacing=discord.SeparatorSpacing.small)
            ]

        # components = [select_menu, btn_prev, btn_page, btn_next, btn_close]
        if len(components) > 0:
            items.append(ActionRow(components[0]))
        
        if len(components) > 1:
            items.append(ActionRow(*components[1:]))

        view = LayoutView(timeout=None)
        container = Container(*items)
        view.add_item(container)
        return {"view": view}
        
    return {}
