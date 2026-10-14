import discord
from discord.ext import commands
from Components.Commands._utils import make_embed
from Components.Systems.Roles.reaction_panels import (
    get_reaction_role_by_id,
    get_reaction_role_by_message_id
)

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
            return await interaction.response.send_message(
                embed=make_embed("This button can only be used inside a server.", discord.Color.red()),
                ephemeral=True
            )

        parts = custom_id.split("_")
        panel_id = None
        role_id_str = None
        button_mode = "multi"

        if len(parts) >= 4:
            # rr_{panel_id}_{role_id}_{mode}
            panel_id = parts[1]
            role_id_str = parts[2]
            button_mode = parts[3]
        elif len(parts) == 3:
            # rr_{role_id}_{mode} (legacy)
            role_id_str = parts[1]
            button_mode = parts[2]
        else:
            return
            
        if not role_id_str or not role_id_str.isdigit():
            return

        role_id = int(role_id_str)
        role = interaction.guild.get_role(role_id)
        if not role:
            return await interaction.response.send_message(
                embed=make_embed(f"This role (`ID: {role_id}`) no longer exists on this server.", discord.Color.red()),
                ephemeral=True
            )

        if not interaction.guild.me.guild_permissions.manage_roles or role >= interaction.guild.me.top_role:
            return await interaction.response.send_message(
                embed=make_embed(f"I do not have sufficient hierarchy (`Manage Roles` / Role Position) to assign or remove `{role.name}`.", discord.Color.red()),
                ephemeral=True
            )

        has_role = role in interaction.user.roles

        # Handle 'pick_one' mode (Single / exclusive role selection)
        if button_mode == "pick_one":
            panel = None
            if panel_id:
                panel = get_reaction_role_by_id(interaction.guild.id, panel_id)
            if not panel and interaction.message:
                panel = get_reaction_role_by_message_id(str(interaction.message.id))

            other_roles_removed = []
            if panel:
                panel_roles = [
                    int(c["role_id"]) for c in panel.get("components", [])
                    if c.get("role_id") and str(c.get("role_id")).isdigit()
                ]
                to_remove = [r for r in interaction.user.roles if r.id in panel_roles and r.id != role.id]
                if to_remove:
                    try:
                        await interaction.user.remove_roles(*to_remove, reason="Reaction Role (pick_one swap)")
                        other_roles_removed = [r.name for r in to_remove]
                    except Exception as e:
                        return await interaction.response.send_message(
                            embed=make_embed(f"Failed to remove previous roles: {e}", discord.Color.red()),
                            ephemeral=True
                        )

            if not has_role:
                try:
                    await interaction.user.add_roles(role, reason="Reaction Role (pick_one)")
                    msg = f"Assigned role `{role.name}` to you."
                    if other_roles_removed:
                        msg += f" (Swapped out `{', '.join(other_roles_removed)}`)"
                    return await interaction.response.send_message(embed=make_embed(msg, discord.Color.green()), ephemeral=True)
                except Exception as e:
                    return await interaction.response.send_message(
                        embed=make_embed(f"Failed to assign role: {e}", discord.Color.red()),
                        ephemeral=True
                    )
            else:
                return await interaction.response.send_message(
                    embed=make_embed(f"You already hold the `{role.name}` role.", discord.Color.blue()),
                    ephemeral=True
                )

        # Handle 'verify' / 'add' mode (Grant only)
        elif button_mode in ("verify", "add"):
            if has_role:
                return await interaction.response.send_message(
                    embed=make_embed(f"You already have the `{role.name}` role.", discord.Color.blue()),
                    ephemeral=True
                )
            try:
                await interaction.user.add_roles(role, reason="Reaction Role (verify)")
                return await interaction.response.send_message(
                    embed=make_embed(f"Verified! Assigned role `{role.name}` to you.", discord.Color.green()),
                    ephemeral=True
                )
            except Exception as e:
                return await interaction.response.send_message(
                    embed=make_embed(f"Failed to assign role: {e}", discord.Color.red()),
                    ephemeral=True
                )

        # Handle 'opt_out' / 'remove' mode (Remove only)
        elif button_mode in ("opt_out", "remove"):
            if not has_role:
                return await interaction.response.send_message(
                    embed=make_embed(f"You do not have the `{role.name}` role.", discord.Color.blue()),
                    ephemeral=True
                )
            try:
                await interaction.user.remove_roles(role, reason="Reaction Role (opt_out)")
                return await interaction.response.send_message(
                    embed=make_embed(f"Opted out! Removed role `{role.name}` from you.", discord.Color.green()),
                    ephemeral=True
                )
            except Exception as e:
                return await interaction.response.send_message(
                    embed=make_embed(f"Failed to remove role: {e}", discord.Color.red()),
                    ephemeral=True
                )

        # Handle 'reversed' mode
        elif button_mode == "reversed":
            if has_role:
                try:
                    await interaction.user.remove_roles(role, reason="Reaction Role reversed (remove)")
                    return await interaction.response.send_message(
                        embed=make_embed(f"Removed role `{role.name}` from you.", discord.Color.green()),
                        ephemeral=True
                    )
                except Exception as e:
                    return await interaction.response.send_message(
                        embed=make_embed(f"Failed to remove role: {e}", discord.Color.red()),
                        ephemeral=True
                    )
            else:
                try:
                    await interaction.user.add_roles(role, reason="Reaction Role reversed (add)")
                    return await interaction.response.send_message(
                        embed=make_embed(f"Assigned role `{role.name}` to you.", discord.Color.green()),
                        ephemeral=True
                    )
                except Exception as e:
                    return await interaction.response.send_message(
                        embed=make_embed(f"Failed to assign role: {e}", discord.Color.red()),
                        ephemeral=True
                    )

        # Default 'multi' / 'toggle' mode
        else:
            if has_role:
                try:
                    await interaction.user.remove_roles(role, reason="Reaction Role toggle (remove)")
                    return await interaction.response.send_message(
                        embed=make_embed(f"Removed role `{role.name}` from you.", discord.Color.green()),
                        ephemeral=True
                    )
                except Exception as e:
                    return await interaction.response.send_message(
                        embed=make_embed(f"Failed to remove role: {e}", discord.Color.red()),
                        ephemeral=True
                    )
            else:
                try:
                    await interaction.user.add_roles(role, reason="Reaction Role toggle (add)")
                    return await interaction.response.send_message(
                        embed=make_embed(f"Assigned role `{role.name}` to you.", discord.Color.green()),
                        ephemeral=True
                    )
                except Exception as e:
                    return await interaction.response.send_message(
                        embed=make_embed(f"Failed to assign role: {e}", discord.Color.red()),
                        ephemeral=True
                    )

    @commands.Cog.listener()
    async def on_raw_reaction_add(self, payload: discord.RawReactionActionEvent):
        if payload.user_id == self.bot.user.id or not payload.guild_id:
            return

        panel = get_reaction_role_by_message_id(str(payload.message_id))
        if not panel or panel.get("panel_type") != "reactions":
            return

        guild = self.bot.get_guild(payload.guild_id)
        if not guild:
            return

        member = payload.member or guild.get_member(payload.user_id)
        if not member or member.bot:
            return

        # Find matching component
        reaction_str = str(payload.emoji)
        matching_comp = None
        for comp in panel.get("components", []):
            comp_emoji = comp.get("emoji", "")
            if not comp_emoji:
                continue
            if comp_emoji == reaction_str or comp_emoji == payload.emoji.name or (payload.emoji.id and str(payload.emoji.id) in comp_emoji):
                matching_comp = comp
                break

        if not matching_comp or not matching_comp.get("role_id"):
            return

        role_id = int(matching_comp["role_id"])
        role = guild.get_role(role_id)
        if not role or role >= guild.me.top_role or not guild.me.guild_permissions.manage_roles:
            return

        mode = panel.get("mode", "multi")

        if mode == "pick_one":
            panel_roles = [
                int(c["role_id"]) for c in panel.get("components", [])
                if c.get("role_id") and str(c.get("role_id")).isdigit()
            ]
            to_remove = [r for r in member.roles if r.id in panel_roles and r.id != role.id]
            if to_remove:
                try:
                    await member.remove_roles(*to_remove, reason="Reaction Role (pick_one swap)")
                except Exception:
                    pass
            if role not in member.roles:
                try:
                    await member.add_roles(role, reason="Reaction Role (pick_one)")
                except Exception:
                    pass

            # Optionally remove member's other reactions on the message
            channel = guild.get_channel(payload.channel_id)
            if channel:
                try:
                    msg = await channel.fetch_message(payload.message_id)
                    for r in msg.reactions:
                        if str(r.emoji) != reaction_str:
                            try:
                                await r.remove(member)
                            except Exception:
                                pass
                except Exception:
                    pass

        elif mode in ("verify", "add"):
            if role not in member.roles:
                try:
                    await member.add_roles(role, reason="Reaction Role (verify)")
                except Exception:
                    pass

        elif mode in ("opt_out", "remove"):
            if role in member.roles:
                try:
                    await member.remove_roles(role, reason="Reaction Role (opt_out)")
                except Exception:
                    pass

        elif mode == "reversed":
            if role in member.roles:
                try:
                    await member.remove_roles(role, reason="Reaction Role (reversed)")
                except Exception:
                    pass

        else:
            # Multi / Toggle
            if role not in member.roles:
                try:
                    await member.add_roles(role, reason="Reaction Role (add)")
                except Exception:
                    pass

    @commands.Cog.listener()
    async def on_raw_reaction_remove(self, payload: discord.RawReactionActionEvent):
        if not payload.guild_id:
            return

        panel = get_reaction_role_by_message_id(str(payload.message_id))
        if not panel or panel.get("panel_type") != "reactions":
            return

        guild = self.bot.get_guild(payload.guild_id)
        if not guild:
            return

        member = guild.get_member(payload.user_id)
        if not member:
            try:
                member = await guild.fetch_member(payload.user_id)
            except Exception:
                return

        if not member or member.bot:
            return

        reaction_str = str(payload.emoji)
        matching_comp = None
        for comp in panel.get("components", []):
            comp_emoji = comp.get("emoji", "")
            if not comp_emoji:
                continue
            if comp_emoji == reaction_str or comp_emoji == payload.emoji.name or (payload.emoji.id and str(payload.emoji.id) in comp_emoji):
                matching_comp = comp
                break

        if not matching_comp or not matching_comp.get("role_id"):
            return

        role_id = int(matching_comp["role_id"])
        role = guild.get_role(role_id)
        if not role or role >= guild.me.top_role or not guild.me.guild_permissions.manage_roles:
            return

        mode = panel.get("mode", "multi")

        if mode in ("multi", "toggle", "pick_one"):
            if role in member.roles:
                try:
                    await member.remove_roles(role, reason="Reaction Role (remove)")
                except Exception:
                    pass
        elif mode == "reversed":
            if role not in member.roles:
                try:
                    await member.add_roles(role, reason="Reaction Role (reversed add)")
                except Exception:
                    pass

async def setup(bot: commands.Bot):
    await bot.add_cog(ReactionRoleListener(bot))