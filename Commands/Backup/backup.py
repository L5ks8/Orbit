import discord
from discord.ext import commands
from discord import app_commands
import uuid
import time
from datetime import datetime

from Commands.Backup._storage import save_backup, get_backups, get_backup
from Commands.Backup._views import OverwriteBackupView, BackupListView, ConfirmLoadView

class BackupCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    backup_group = app_commands.Group(name="backup", description="Server Backup Commands")

    async def save_new_backup(self, interaction: discord.Interaction, backup_data: dict):
        save_backup(backup_data)
        try:
            embed = discord.Embed(
                title="Backup Created",
                description=f"Successfully created backup **{backup_data['name']}**.",
                color=discord.Color.green()
            )
            if not interaction.response.is_done():
                await interaction.response.send_message(embed=embed, ephemeral=True)
            else:
                await interaction.edit_original_response(embed=embed, view=None, content=None)
        except Exception as e:
            print(f"Error notifying backup save: {e}")

    @backup_group.command(name="create", description="Create a backup of the current server layout.")
    @app_commands.describe(name="Optional name for the backup")
    async def backup_create_cmd(self, interaction: discord.Interaction, name: str = None):
        if interaction.user.id != interaction.guild.owner_id:
            return await interaction.response.send_message("Only the server owner can create a backup.", ephemeral=True)

        await interaction.response.defer(ephemeral=True)
        guild = interaction.guild

        # Serialize roles
        roles_data = []
        for role in sorted(guild.roles, key=lambda r: r.position):
            if role.is_bot_managed() or role.is_integration() or role.is_default():
                continue
            roles_data.append({
                "name": role.name,
                "color": role.color.value,
                "hoist": role.hoist,
                "mentionable": role.mentionable,
                "permissions": role.permissions.value,
                "old_id": role.id
            })

        # Serialize categories and channels
        categories_data = []
        channels_data = []

        for cat in guild.categories:
            categories_data.append({
                "name": cat.name,
                "position": cat.position,
                "old_id": cat.id
            })

        for ch in guild.channels:
            if isinstance(ch, discord.CategoryChannel):
                continue
            
            ch_data = {
                "name": ch.name,
                "position": ch.position,
                "type": str(ch.type),
                "category_id": ch.category.id if ch.category else None,
            }
            if isinstance(ch, discord.TextChannel):
                ch_data["topic"] = ch.topic
                ch_data["nsfw"] = ch.nsfw
                ch_data["slowmode_delay"] = ch.slowmode_delay
            elif isinstance(ch, discord.VoiceChannel):
                ch_data["user_limit"] = ch.user_limit
                ch_data["bitrate"] = ch.bitrate

            # Overwrites are tricky, we'll try to save them
            overwrites = {}
            for target, ow in ch.overwrites.items():
                if isinstance(target, discord.Role):
                    if target.is_default() or target.is_bot_managed() or target.is_integration():
                        continue # Skip default and bot roles to avoid complexity
                    overwrites[f"role_{target.id}"] = {"allow": ow.pair()[0].value, "deny": ow.pair()[1].value}
            
            ch_data["overwrites"] = overwrites
            channels_data.append(ch_data)

        backup_id = str(uuid.uuid4())
        backup_name = name or f"Backup {datetime.now().strftime('%Y-%m-%d %H:%M')}"

        new_backup_data = {
            "_id": backup_id,
            "guild_id": guild.id,
            "name": backup_name,
            "timestamp": int(time.time()),
            "roles": roles_data,
            "categories": categories_data,
            "channels": channels_data
        }

        existing_backups = get_backups(guild.id)
        if len(existing_backups) >= 3:
            view = OverwriteBackupView(existing_backups, new_backup_data, self)
            await interaction.followup.send(
                "You have reached the maximum of 3 backups. Please select an existing backup to overwrite:",
                view=view,
                ephemeral=True
            )
        else:
            await self.save_new_backup(interaction, new_backup_data)

    @backup_group.command(name="load", description="Load a previously created backup (DESTRUCTIVE).")
    async def backup_load_cmd(self, interaction: discord.Interaction):
        if interaction.user.id != interaction.guild.owner_id:
            return await interaction.response.send_message("Only the server owner can load a backup.", ephemeral=True)
        
        existing_backups = get_backups(interaction.guild.id)
        if not existing_backups:
            return await interaction.response.send_message("No backups found for this server.", ephemeral=True)
            
        view = BackupListView(existing_backups, self)
        await interaction.response.send_message("Select a backup to load from the dropdown below:", view=view, ephemeral=True)

    @app_commands.command(name="backups", description="List all server backups.")
    async def backups_cmd(self, interaction: discord.Interaction):
        if interaction.user.id != interaction.guild.owner_id:
            return await interaction.response.send_message("Only the server owner can view backups.", ephemeral=True)
            
        existing_backups = get_backups(interaction.guild.id)
        if not existing_backups:
            return await interaction.response.send_message("No backups found for this server.", ephemeral=True)
            
        embed = discord.Embed(title="Server Backups", color=discord.Color.blue())
        for b in existing_backups:
            name = b.get("name", b["_id"])
            ts = b.get("timestamp", 0)
            date_str = f"<t:{int(ts)}:f>"
            embed.add_field(name=name, value=f"Created: {date_str}", inline=False)
            
        view = BackupListView(existing_backups, self)
        await interaction.response.send_message(embed=embed, view=view, ephemeral=True)

    async def execute_backup_load(self, interaction: discord.Interaction, backup_id: str):
        guild = interaction.guild
        backup_data = get_backup(backup_id)
        if not backup_data:
            return await interaction.followup.send("Backup data not found.", ephemeral=True)

        await interaction.followup.send("⏳ Starting backup restoration... This may take a while.", ephemeral=True)

        # 1. Delete all channels
        for ch in guild.channels:
            try:
                await ch.delete()
            except discord.HTTPException:
                pass

        # 2. Delete all roles (except managed/bot roles)
        for role in guild.roles:
            if role.is_bot_managed() or role.is_integration() or role.is_default() or role.is_premium_subscriber():
                continue
            if role.position >= guild.me.top_role.position:
                continue
            try:
                await role.delete()
            except discord.HTTPException:
                pass

        # 3. Create roles and map IDs
        role_map = {}
        roles_data = backup_data.get("roles", [])
        for r_data in roles_data:
            try:
                new_role = await guild.create_role(
                    name=r_data["name"],
                    color=discord.Color(r_data["color"]),
                    hoist=r_data["hoist"],
                    mentionable=r_data["mentionable"],
                    permissions=discord.Permissions(r_data["permissions"]),
                    reason="Backup restoration"
                )
                role_map[str(r_data["old_id"])] = new_role
            except discord.HTTPException:
                pass

        # 4. Create categories and map IDs
        category_map = {}
        categories_data = backup_data.get("categories", [])
        for cat_data in categories_data:
            try:
                new_cat = await guild.create_category(
                    name=cat_data["name"],
                    reason="Backup restoration"
                )
                category_map[str(cat_data["old_id"])] = new_cat
            except discord.HTTPException:
                pass

        # 5. Create channels
        channels_data = backup_data.get("channels", [])
        for ch_data in channels_data:
            try:
                # Prepare overwrites
                overwrites = {}
                for ow_target, ow_perms in ch_data.get("overwrites", {}).items():
                    if ow_target.startswith("role_"):
                        old_role_id = ow_target.replace("role_", "")
                        if old_role_id in role_map:
                            overwrites[role_map[old_role_id]] = discord.PermissionOverwrite.from_pair(
                                discord.Permissions(ow_perms["allow"]),
                                discord.Permissions(ow_perms["deny"])
                            )

                cat_id = ch_data.get("category_id")
                category = category_map.get(str(cat_id)) if cat_id else None

                if ch_data["type"] == "text":
                    await guild.create_text_channel(
                        name=ch_data["name"],
                        category=category,
                        topic=ch_data.get("topic"),
                        nsfw=ch_data.get("nsfw", False),
                        slowmode_delay=ch_data.get("slowmode_delay", 0),
                        overwrites=overwrites,
                        reason="Backup restoration"
                    )
                elif ch_data["type"] == "voice":
                    await guild.create_voice_channel(
                        name=ch_data["name"],
                        category=category,
                        user_limit=ch_data.get("user_limit", 0),
                        bitrate=ch_data.get("bitrate", 64000),
                        overwrites=overwrites,
                        reason="Backup restoration"
                    )
                # Note: other channel types like news, forum, stage are omitted for simplicity but could be added
            except discord.HTTPException:
                pass

        # We need a way to notify the owner since their original channel might have been deleted
        try:
            owner = guild.owner
            if owner:
                await owner.send(f"✅ The server backup **{backup_data.get('name')}** has been fully restored on **{guild.name}**!")
        except Exception:
            pass

async def setup(bot: commands.Bot):
    await bot.add_cog(BackupCommand(bot))
