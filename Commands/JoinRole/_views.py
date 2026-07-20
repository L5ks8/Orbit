import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button
from Commands.JoinRole._storage import load_join_roles, clear_join_roles

class JoinRoleLayout(discord.ui.View):
    def __init__(self, guild: discord.Guild, action_summary: str, author_id: int):
        super().__init__()
        self.guild = guild
        self.action_summary = action_summary
        self.author_id = author_id

    def get_kwargs(self):
        role_ids = load_join_roles(self.guild.id)
        role_mentions = []
        for rid in role_ids:
            role = self.guild.get_role(rid)
            if role:
                role_mentions.append(role.mention)
            else:
                role_mentions.append(f"`Unknown ID: {rid}`")

        btn_close = discord.ui.Button(label="Close", style=discord.ButtonStyle.secondary)
        
        async def close_cb(interaction: discord.Interaction):
            if interaction.user.id != self.author_id:
                return await interaction.response.send_message("You cannot close this panel.", ephemeral=True)
            try:
                await interaction.message.delete()
            except Exception:
                pass

        btn_close.callback = close_cb

        buttons = []
        if role_ids:
            btn_clear = discord.ui.Button(label="Clear All", style=discord.ButtonStyle.danger)
            
            async def clear_cb(interaction: discord.Interaction):
                if interaction.user.id != self.author_id:
                    return await interaction.response.send_message("You cannot clear these roles.", ephemeral=True)
                cleared = clear_join_roles(self.guild.id)
                from Embeds import get_command_embed
                kwargs = get_command_embed(
                    self.guild.id, "joinrole", msg_type="cleared",
                    cleared_count=cleared, components=[btn_close]
                )
                await interaction.response.edit_message(**kwargs)

            btn_clear.callback = clear_cb
            buttons.append(btn_clear)

        buttons.append(btn_close)

        from Embeds import get_command_embed
        return get_command_embed(
            self.guild.id, "joinrole", msg_type="list",
            guild_name=self.guild.name, action_summary=self.action_summary,
            role_ids=role_ids, role_mentions=role_mentions,
            components=buttons
        )

