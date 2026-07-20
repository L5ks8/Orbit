import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow

def get_embed(msg_type: str, **kwargs):
    role_mention = kwargs.get("role_mention", "")
    role_id = kwargs.get("role_id", "")
    role_name = kwargs.get("role_name", "")
    member_mention = kwargs.get("member_mention", "")
    member_id = kwargs.get("member_id", "")
    author_mention = kwargs.get("author_mention", "")
    reason = kwargs.get("reason", "No reason provided")
    count = kwargs.get("count", 0)
    
    permission_label = kwargs.get("permission_label", "")
    state = kwargs.get("state", "")
    success = kwargs.get("success", 0)
    failed = kwargs.get("failed", 0)
    skipped = kwargs.get("skipped", 0)

    page = kwargs.get("page", 1)
    total_pages = kwargs.get("total_pages", 1)
    total_roles = kwargs.get("total_roles", 0)
    roles_text = kwargs.get("roles_text", "")
    components = kwargs.get("components", [])

    title = "Role Action"
    lines = []

    if msg_type == "add":
        title = "### Role Added"
        lines.append(f"**Target:** {member_mention} (`{member_id}`)")
        lines.append(f"**Role:** {role_mention} (`{role_id}`)")
        lines.append(f"**Reason:** {reason}")
        lines.append(f"**Moderator:** {author_mention}")

    elif msg_type == "remove":
        title = "### Role Removed"
        lines.append(f"**Target:** {member_mention} (`{member_id}`)")
        lines.append(f"**Role:** {role_mention} (`{role_id}`)")
        lines.append(f"**Reason:** {reason}")
        lines.append(f"**Moderator:** {author_mention}")

    elif msg_type == "all":
        title = "### Role Added to All"
        lines.append(f"**Role:** {role_mention} (`{role_id}`)")
        lines.append(f"**Affected:** `{count}` members")
        lines.append(f"**Moderator:** {author_mention}")

    elif msg_type == "rall":
        title = "### Role Removed from All"
        lines.append(f"**Role:** {role_mention} (`{role_id}`)")
        lines.append(f"**Affected:** `{count}` members")
        lines.append(f"**Moderator:** {author_mention}")

    elif msg_type == "info":
        title = "### Role Info"
        role_created_at = kwargs.get("role_created_at", "")
        role_members = kwargs.get("role_members", 0)
        role_position = kwargs.get("role_position", 0)
        role_hoisted = kwargs.get("role_hoisted", False)
        role_mentionable = kwargs.get("role_mentionable", False)
        role_managed = kwargs.get("role_managed", False)

        lines.append(f"**Role:** {role_mention} (`{role_id}`)")
        lines.append(f"**Created At:** {role_created_at}")
        lines.append(f"**Members:** `{role_members}`")
        lines.append(f"**Position:** `{role_position}`")
        lines.append(f"**Hoisted:** `{role_hoisted}`")
        lines.append(f"**Mentionable:** `{role_mentionable}`")
        lines.append(f"**Managed:** `{role_managed}`")

    elif msg_type == "settings":
        title = "### Role Configuration Changed"
        lines.append(f"Mass updated `{permission_label}` to `{state}` for {role_mention}")
        lines.append(f"**Success:** `{success}` channels")
        lines.append(f"**Failed:** `{failed}` channels")
        lines.append(f"**Skipped:** `{skipped}` channels")
        lines.append(f"**Moderator:** {author_mention}")

    elif msg_type == "roles":
        title = f"### Server Roles (Page {page} of {total_pages})\n**Total Roles:** `{total_roles}`"
        lines.append(roles_text)
        
        container = Container(
            TextDisplay(content=title),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content="\n".join(lines)),
            Separator(spacing=discord.SeparatorSpacing.small)
        )
        if components:
            container.add_item(ActionRow(*components))

        view = LayoutView(timeout=300)
        view.add_item(container)
        return {"view": view}

    container = Container(
        TextDisplay(content=title),
        Separator(spacing=discord.SeparatorSpacing.small),
        TextDisplay(content="\n".join(lines))
    )

    view = LayoutView()
    view.add_item(container)
    return {"view": view}
