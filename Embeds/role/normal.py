import discord

def get_embed(msg_type: str, **kwargs):
    role_mention = kwargs.get("role_mention", "")
    role_id = kwargs.get("role_id", "")
    role_name = kwargs.get("role_name", "")
    role_color = kwargs.get("role_color", discord.Color.blue())
    member_mention = kwargs.get("member_mention", "")
    member_id = kwargs.get("member_id", "")
    author_mention = kwargs.get("author_mention", "")
    reason = kwargs.get("reason", "No reason provided")
    count = kwargs.get("count", 0)
    
    # settings
    permission_label = kwargs.get("permission_label", "")
    state = kwargs.get("state", "")
    success = kwargs.get("success", 0)
    failed = kwargs.get("failed", 0)
    skipped = kwargs.get("skipped", 0)

    # roles list
    page = kwargs.get("page", 1)
    total_pages = kwargs.get("total_pages", 1)
    total_roles = kwargs.get("total_roles", 0)
    roles_text = kwargs.get("roles_text", "")
    components = kwargs.get("components", [])

    embed = discord.Embed(color=role_color)

    if msg_type == "add":
        embed.title = "Role Added"
        embed.add_field(name="Target", value=f"{member_mention} (`{member_id}`)", inline=False)
        embed.add_field(name="Role", value=f"{role_mention} (`{role_id}`)", inline=False)
        embed.add_field(name="Reason", value=reason, inline=False)
        embed.add_field(name="Moderator", value=author_mention, inline=False)

    elif msg_type == "remove":
        embed.title = "Role Removed"
        embed.add_field(name="Target", value=f"{member_mention} (`{member_id}`)", inline=False)
        embed.add_field(name="Role", value=f"{role_mention} (`{role_id}`)", inline=False)
        embed.add_field(name="Reason", value=reason, inline=False)
        embed.add_field(name="Moderator", value=author_mention, inline=False)

    elif msg_type == "all":
        embed.title = "Role Added to All"
        embed.add_field(name="Role", value=f"{role_mention} (`{role_id}`)", inline=False)
        embed.add_field(name="Affected", value=f"`{count}` members", inline=False)
        embed.add_field(name="Moderator", value=author_mention, inline=False)

    elif msg_type == "rall":
        embed.title = "Role Removed from All"
        embed.add_field(name="Role", value=f"{role_mention} (`{role_id}`)", inline=False)
        embed.add_field(name="Affected", value=f"`{count}` members", inline=False)
        embed.add_field(name="Moderator", value=author_mention, inline=False)

    elif msg_type == "info":
        embed.title = "Role Info"
        role_created_at = kwargs.get("role_created_at", "")
        role_members = kwargs.get("role_members", 0)
        role_position = kwargs.get("role_position", 0)
        role_hoisted = kwargs.get("role_hoisted", False)
        role_mentionable = kwargs.get("role_mentionable", False)
        role_managed = kwargs.get("role_managed", False)

        embed.add_field(name="Role", value=f"{role_mention} (`{role_id}`)", inline=False)
        embed.add_field(name="Created At", value=role_created_at, inline=False)
        embed.add_field(name="Members", value=f"`{role_members}`", inline=True)
        embed.add_field(name="Position", value=f"`{role_position}`", inline=True)
        embed.add_field(name="Hoisted", value=f"`{role_hoisted}`", inline=True)
        embed.add_field(name="Mentionable", value=f"`{role_mentionable}`", inline=True)
        embed.add_field(name="Managed", value=f"`{role_managed}`", inline=True)

    elif msg_type == "settings":
        embed.title = "Role Configuration Changed"
        embed.description = f"Mass updated `{permission_label}` to `{state}` for {role_mention}"
        embed.add_field(name="Success", value=f"`{success}` channels", inline=True)
        embed.add_field(name="Failed", value=f"`{failed}` channels", inline=True)
        embed.add_field(name="Skipped", value=f"`{skipped}` channels", inline=True)
        embed.add_field(name="Moderator", value=author_mention, inline=False)

    elif msg_type == "roles":
        embed.title = f"Server Roles (Page {page} of {total_pages})"
        embed.description = roles_text
        embed.add_field(name="Total Roles", value=f"`{total_roles}`", inline=False)
        
        from discord.ui import View
        view = View(timeout=300)
        for comp in components:
            view.add_item(comp)
        return {"embed": embed, "view": view}

    return {"embed": embed}
