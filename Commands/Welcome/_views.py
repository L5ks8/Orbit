import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button
from Database.storagehandler import set_welcome_status

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

def format_welcome_string(template: str, member: discord.Member) -> str:
    count = member.guild.member_count or len(member.guild.members)
    return template.format(
        user=member.mention,
        server=member.guild.name,
        count=count,
        username=member.name
    )

class WelcomeCardLayout(LayoutView):
    def __init__(self, member: discord.Member, formatted_message: str):
        super().__init__()
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
                self.container = Container(
                    top_section,
                    Separator(spacing=discord.SeparatorSpacing.small),
                    TextDisplay(content=info_str)
                )
            except Exception:
                self.container = Container(
                    TextDisplay(content=header_str),
                    Separator(spacing=discord.SeparatorSpacing.small),
                    TextDisplay(content=info_str)
                )
        else:
            self.container = Container(
                TextDisplay(content=header_str),
                Separator(spacing=discord.SeparatorSpacing.small),
                TextDisplay(content=info_str)
            )
        self.add_item(self.container)

class WelcomeStatusLayout(LayoutView):
    def __init__(self, guild: discord.Guild, config: dict, author_id: int):
        super().__init__()
        self.guild = guild
        self.author_id = author_id
        
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

        btn_toggle = Button(
            label="Turn Off" if config.get("enabled") else "Turn On",
            style=discord.ButtonStyle.danger if config.get("enabled") else discord.ButtonStyle.success,
            disabled=(not ch_id)
        )
        btn_close = Button(label="Close", style=discord.ButtonStyle.secondary)

        async def toggle_cb(interaction: discord.Interaction):
            if interaction.user.id != self.author_id:
                return await interaction.response.send_message("You cannot control this panel.", ephemeral=True)
            new_state = not config.get("enabled")
            updated = await set_welcome_status(self.guild.id, new_state)
            self.clear_items()
            self.__init__(self.guild, updated, self.author_id)
            await interaction.response.edit_message(view=self)

        async def close_cb(interaction: discord.Interaction):
            if interaction.user.id != self.author_id:
                return await interaction.response.send_message("You cannot control this panel.", ephemeral=True)
            try:
                await interaction.message.delete()
            except Exception:
                self.clear_items()
                self.add_item(Container(TextDisplay(content="### Panel closed.")))
                await interaction.response.edit_message(view=self)
                self.stop()

        btn_toggle.callback = toggle_cb
        btn_close.callback = close_cb

        items.append(ActionRow(btn_toggle, btn_close))
        self.container = Container(*items)
        self.add_item(self.container)
