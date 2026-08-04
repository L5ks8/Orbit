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
        if not custom_id.startswith("rr_"):
            return
        if not interaction.guild:
            return await interaction.response.send_message("This button can only be used inside a server.", ephemeral=True)
        parts = custom_id.split("_")
        if len(parts) < 3:
            return
        role_id_str = parts[1]
        button_mode = parts[2]
        if not role_id_str.isdigit():
            return
        role_id = int(role_id_str)
        role = interaction.guild.get_role(role_id)
        if not role:
            return await interaction.response.send_message(f"This role (`ID: {role_id}`) no longer exists on this server.", ephemeral=True)
        if not interaction.guild.me.guild_permissions.manage_roles or role >= interaction.guild.me.top_role:
            return await interaction.response.send_message(f"I do not have sufficient hierarchy (`Manage Roles` / Role Position) to assign or remove `{role.name}`.", ephemeral=True)
        has_role = role in interaction.user.roles
        if button_mode == "add":
            if has_role:
                return await interaction.response.send_message(f"You already have the `{role.name}` role.", ephemeral=True)
            try:
                await interaction.user.add_roles(role, reason="Reaction Role (add)")
                await interaction.response.send_message(f"Assigned role `{role.name}` to you.", ephemeral=True)
            except Exception as e:
                await interaction.response.send_message(f"Failed to assign role: {e}", ephemeral=True)
        else:
            if has_role:
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