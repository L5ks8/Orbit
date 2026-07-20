import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button

def get_embed(msg_type: str, **kwargs):
    if msg_type == "panel":
        header_str = "### Server Security Verification\nTo protect against automated bots and spam, this server requires CAPTCHA verification before accessing channels."
        info_str = "> Click **Verify Now** below to receive an automated security image with connected characters."
        btn_verify = Button(label="Verify Now", style=discord.ButtonStyle.success, custom_id="orbit:verify_start")
        
        container = Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=info_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            ActionRow(btn_verify)
        )
        view = LayoutView(timeout=None)
        view.add_item(container)
        return {"view": view}
        
    elif msg_type == "setup_success":
        guild_name = kwargs.get("guild_name")
        channel_mention = kwargs.get("channel_mention")
        role_mention = kwargs.get("role_mention")
        rem_str = kwargs.get("rem_str")
        kick_str = kwargs.get("kick_str")
        
        header_str = f"### CAPTCHA Verification Configured: **{guild_name}**\n**Verification Channel:** {channel_mention}"
        info_str = (
            f"**Granted Role:** {role_mention}\n"
            f"**Removed Role (After Verify):** {rem_str}\n"
            f"**Auto-Kick Timer:** {kick_str}\n\n"
            f"-# The interactive verification panel is now live in {channel_mention}."
        )
        container = Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=info_str)
        )
        view = LayoutView()
        view.add_item(container)
        return {"view": view}
        
    elif msg_type == "captcha":
        container = Container(
            TextDisplay(content="### CAPTCHA Security Check\nPlease enter the characters from the image below."),
            Separator(spacing=discord.SeparatorSpacing.small)
        )
        components = kwargs.get("components", [])
        if components:
            container.add_item(ActionRow(*components))
        view = LayoutView(timeout=600)
        view.add_item(container)
        return {"view": view}
        
    elif msg_type == "status":
        guild_name = kwargs.get("guild_name")
        active = kwargs.get("active")
        enabled_str = kwargs.get("enabled_str")
        ch_display = kwargs.get("ch_display")
        role_display = kwargs.get("role_display")
        rem_display = kwargs.get("rem_display")
        kick_str = kwargs.get("kick_str")
        pending = kwargs.get("pending")
        
        header_str = f"### Server Verification Status: **{guild_name}**\n**Status:** {'Active' if active else 'Inactive'}"
        info_str = (
            f"**System Enabled:** `{enabled_str}`\n"
            f"**Channel:** {ch_display}\n"
            f"**Granted Role:** {role_display}\n"
            f"**Removed Role:** {rem_display}\n"
            f"**Auto-Kick Timer:** {kick_str}\n"
            f"**Pending Unverified Members:** `{pending}`"
        )
        container = Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=info_str)
        )
        view = LayoutView()
        view.add_item(container)
        return {"view": view}
        
    return {}
