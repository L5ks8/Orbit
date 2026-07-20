import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator

def get_embed(msg_type: str, **kwargs):
    if msg_type == "info":
        member = kwargs.get("member")
        
        created_timestamp = int(member.created_at.timestamp())
        joined_timestamp = int(member.joined_at.timestamp()) if member.joined_at else None
        joined_str = f"<t:{joined_timestamp}:F> (<t:{joined_timestamp}:R>)" if joined_timestamp else "`Unknown / Not in guild`"

        roles = [r.mention for r in reversed(member.roles) if not r.is_default()]
        roles_display = ", ".join(roles[:10]) if roles else "`No custom roles`"
        if len(roles) > 10:
            roles_display += f" and `{len(roles) - 10}` more..."

        key_perms = []
        if member.guild_permissions.administrator: key_perms.append("`Administrator`")
        if member.guild_permissions.manage_guild: key_perms.append("`Manage Server`")
        if member.guild_permissions.manage_roles: key_perms.append("`Manage Roles`")
        if member.guild_permissions.manage_channels: key_perms.append("`Manage Channels`")
        if member.guild_permissions.ban_members: key_perms.append("`Ban Members`")
        if member.guild_permissions.kick_members: key_perms.append("`Kick Members`")
        if member.guild_permissions.moderate_members: key_perms.append("`Timeout Members`")

        perms_str = ", ".join(key_perms) if key_perms else "`Standard Member Permissions`"
        bot_badge = " *(Bot)*" if member.bot else ""
        
        header_str = f"### User Information: **{member.display_name}**{bot_badge}\n**Username:** `{member.name}` | **User ID:** `{member.id}`"

        info_str = (
            f"**Account Created:** <t:{created_timestamp}:F> (<t:{created_timestamp}:R>)\n"
            f"**Joined Server:** {joined_str}\n\n"
            f"**Top Role:** {member.top_role.mention}\n"
            f"**Roles (`{len(roles)}`):** {roles_display}\n\n"
            f"**Key Permissions:** {perms_str}"
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
