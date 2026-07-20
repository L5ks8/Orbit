import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow

def get_embed(msg_type: str, **kwargs):
    if msg_type == "list":
        guild_name = kwargs.get("guild_name")
        action_summary = kwargs.get("action_summary")
        role_ids = kwargs.get("role_ids")
        role_mentions = kwargs.get("role_mentions")
        components = kwargs.get("components", [])

        roles_text = "\n".join(f"> • {rm}" for rm in role_mentions) if role_mentions else "`No automatic join roles currently configured.`"
        header_str = f"### Automatic Join Roles: **{guild_name}**\n**Action:** {action_summary} | **Total Configured:** `{len(role_ids)}`"
        
        view = LayoutView()
        container = Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Assigned on Join:**\n{roles_text}")
        )
        
        if components:
            ar = ActionRow()
            for comp in components:
                ar.add_item(comp)
            container.add_item(ar)
            
        view.add_item(container)
        return {"view": view}
        
    elif msg_type == "cleared":
        cleared_count = kwargs.get("cleared_count")
        components = kwargs.get("components", [])
        
        view = LayoutView()
        container = Container(
            TextDisplay(content=f"### Cleared `{cleared_count}` automatic join roles.")
        )
        if components:
            ar = ActionRow()
            for comp in components:
                ar.add_item(comp)
            container.add_item(ar)
        view.add_item(container)
        return {"view": view}
        
    return {}
