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
    guild = kwargs.get("guild")
    config = kwargs.get("config", {})
    components = kwargs.get("components", [])

    status_badge = "Active" if config.get("enabled") and config.get("channel_id") else "Disabled"
    ch_id = config.get("channel_id")
    ch_display = f"<#{ch_id}> (`{ch_id}`)" if ch_id else "`No channel configured`"

    header_str = f"### Welcome System Overview: **{guild.name}**\n**Status:** {status_badge}"
    info_str = (
        f"**Welcome Channel:** {ch_display}\n"
        f"**Message Template:**\n> {config.get('message', 'Default')}\n\n"
        f"-# Available template variables: `{{user}}`, `{{server}}`, `{{count}}`, `{{username}}`"
    )

    icon_url = guild.icon.with_size(256).url if guild.icon else None
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

    if components:
        items.append(ActionRow(*components))

    container = Container(*items)
    view = LayoutView(timeout=300)
    view.add_item(container)

    return {"view": view}
