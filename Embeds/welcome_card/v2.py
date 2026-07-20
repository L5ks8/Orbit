import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator

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
    member = kwargs.get("member")
    formatted_message = kwargs.get("formatted_message", "")

    header_str = f"### Welcome to **{member.guild.name}**!"
    info_str = (
        f"{formatted_message}\n\n"
        f"**Member:** {member.mention} (`{member.name}`)\n"
        f"**Joined:** <t:{int(member.joined_at.timestamp() if member.joined_at else 0)}:f>"
    )

    avatar_url = (member.avatar or member.display_avatar).with_size(256).url if (member.avatar or member.display_avatar) else None
    thumbnail = _create_thumbnail(avatar_url) if avatar_url else None
    Section = getattr(discord.ui, "Section", None)

    if thumbnail and Section:
        try:
            top_section = Section(TextDisplay(content=header_str), accessory=thumbnail)
            container = Container(
                top_section,
                Separator(spacing=discord.SeparatorSpacing.small),
                TextDisplay(content=info_str)
            )
        except Exception:
            container = Container(
                TextDisplay(content=header_str),
                Separator(spacing=discord.SeparatorSpacing.small),
                TextDisplay(content=info_str)
            )
    else:
        container = Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=info_str)
        )

    view = LayoutView()
    view.add_item(container)
    return {"view": view}
