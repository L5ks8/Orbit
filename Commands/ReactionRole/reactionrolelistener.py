import discord
from discord.ext import commands

class ReactionRoleListener(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_interaction(self, interaction: discord.Interaction):
        if interaction.type != discord.InteractionType.component:
            return
        
        custom_id = interaction.data.get("custom_id", "")
        if not custom_id.startswith("rr_btn_"):
            return

        if not interaction.guild:
            return await interaction.response.send_message("This button can only be used inside a server.", ephemeral=True)

        role_id_str = custom_id.replace("rr_btn_", "")
        if not role_id_str.isdigit():
            return

        role_id = int(role_id_str)
        role = interaction.guild.get_role(role_id)
        if not role:
            return await interaction.response.send_message(f"This role (`ID: {role_id}`) no longer exists on this server.", ephemeral=True)

        if not interaction.guild.me.guild_permissions.manage_roles or role >= interaction.guild.me.top_role:
            return await interaction.response.send_message(f"I do not have sufficient hierarchy (`Manage Roles` / Role Position) to assign or remove `{role.name}`.", ephemeral=True)

        if role in interaction.user.roles:
            try:
                await interaction.user.remove_roles(role, reason="Reaction Role toggle (remove)")
                await interaction.response.send_message(f"Removed role `{role.name}` from you.", ephemeral=True)
            except Exception as e:
                await interaction.response.send_message(f"Failed to remove role: {e}", ephemeral=True)
        else:
            try:
                await interaction.user.add_roles(role, reason="Reaction Role toggle (add)")
                await interaction.response.send_message(f"Assigned role `{role.name}` to you.", ephemeral=True)
            except Exception as e:
                await interaction.response.send_message(f"Failed to assign role: {e}", ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(ReactionRoleListener(bot))

