import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button
from Components.Systems.JoinRole._storage import load_join_roles, clear_join_roles
from Components.Commands._utils import make_embed

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
                return await interaction.response.send_message(embed=make_embed("You cannot close this panel.", discord.Color.red()), ephemeral=True)
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
                    return await interaction.response.send_message(embed=make_embed("You cannot clear these roles.", discord.Color.red()), ephemeral=True)
                cleared = clear_join_roles(self.guild.id)
                embed = discord.Embed(title="Join Roles Cleared", description=f"Cleared `{cleared}` automatic join roles.", color=discord.Color.red())
                self.clear_items()
                self.add_item(btn_close)
                await interaction.response.edit_message(embed=embed, view=self)

            btn_clear.callback = clear_cb
            buttons.append(btn_clear)

        buttons.append(btn_close)

        roles_text = "\n".join(f"> • {rm}" for rm in role_mentions) if role_mentions else "`No automatic join roles currently configured.`"
        embed = discord.Embed(title=f"Automatic Join Roles: {self.guild.name}", color=discord.Color.dark_theme())
        embed.add_field(name="Action", value=self.action_summary, inline=True)
        embed.add_field(name="Total Configured", value=f"`{len(role_ids)}`", inline=True)
        embed.add_field(name="Assigned on Join", value=roles_text, inline=False)
        
        self.clear_items()
        for btn in buttons:
            self.add_item(btn)

        return {"embed": embed, "view": self}

