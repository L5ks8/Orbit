import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button
from Commands.JoinRole._storage import load_join_roles, clear_join_roles

class JoinRoleLayout(LayoutView):
    def __init__(self, guild: discord.Guild, action_summary: str, author_id: int):
        super().__init__()
        self.guild = guild
        self.author_id = author_id
        
        role_ids = load_join_roles(guild.id)
        role_mentions = []
        for rid in role_ids:
            role = guild.get_role(rid)
            if role:
                role_mentions.append(role.mention)
            else:
                role_mentions.append(f"`Unknown ID: {rid}`")

        roles_text = "\n".join(f"> • {rm}" for rm in role_mentions) if role_mentions else "`No automatic join roles currently configured.`"
        header_str = f"### Automatic Join Roles: **{guild.name}**\n**Action:** {action_summary} | **Total Configured:** `{len(role_ids)}`"
        
        items = [
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Assigned on Join:**\n{roles_text}")
        ]

        btn_close = Button(label="Close", style=discord.ButtonStyle.secondary)
        
        async def close_cb(interaction: discord.Interaction):
            if interaction.user.id != self.author_id:
                return await interaction.response.send_message("You cannot close this panel.", ephemeral=True)
            try:
                await interaction.message.delete()
            except Exception:
                self.clear_items()
                self.add_item(Container(TextDisplay(content="### Panel closed.")))
                await interaction.response.edit_message(view=self)
                self.stop()

        btn_close.callback = close_cb

        if role_ids:
            btn_clear = Button(label="Clear All", style=discord.ButtonStyle.danger)
            
            async def clear_cb(interaction: discord.Interaction):
                if interaction.user.id != self.author_id:
                    return await interaction.response.send_message("You cannot clear these roles.", ephemeral=True)
                cleared = clear_join_roles(self.guild.id)
                self.clear_items()
                self.add_item(Container(TextDisplay(content=f"### Cleared `{cleared}` automatic join roles."), ActionRow(btn_close)))
                await interaction.response.edit_message(view=self)

            btn_clear.callback = clear_cb
            items.extend([Separator(spacing=discord.SeparatorSpacing.small), ActionRow(btn_clear, btn_close)])
        else:
            items.extend([Separator(spacing=discord.SeparatorSpacing.small), ActionRow(btn_close)])

        self.container = Container(*items)
        self.add_item(self.container)
