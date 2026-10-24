import discord
from discord.ext import commands, tasks
from discord import app_commands
import uuid
import time
from datetime import datetime

from Components.Commands.Backup.storage import (
    save_backup,
    get_backups,
    get_backup,
    delete_backup,
    get_backup_config,
    save_backup_config,
    get_all_active_backup_configs,
    calculate_next_backup_timestamp,
    MAX_BACKUPS
)
from Components.Commands.Backup._views import OverwriteBackupView, BackupListView, ConfirmLoadView
from Components.Commands._utils import make_embed, ORBIT_COLOR

async def create_backup_data(guild: discord.Guild, name: str = None) -> dict:
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

        overwrites = {}
        for target, ow in ch.overwrites.items():
            if isinstance(target, discord.Role):
                if target.is_default() or target.is_bot_managed() or target.is_integration():
                    continue
                overwrites[f"role_{target.id}"] = {"allow": ow.pair()[0].value, "deny": ow.pair()[1].value}
        
        ch_data["overwrites"] = overwrites
        channels_data.append(ch_data)

    backup_id = str(uuid.uuid4())
    backup_name = name or f"Backup {datetime.now().strftime('%m/%d/%Y %H:%M')}"

    return {
        "_id": backup_id,
        "guild_id": guild.id,
        "name": backup_name,
        "timestamp": int(time.time()),
        "roles": roles_data,
        "categories": categories_data,
        "channels": channels_data,
        "channels_count": len(channels_data),
        "roles_count": len(roles_data),
        "members_count": guild.member_count or len(guild.members)
    }

async def restore_backup_data(guild: discord.Guild, backup_data: dict):
    # Delete channels
    for ch in list(guild.channels):
        try:
            await ch.delete()
        except discord.HTTPException:
            pass

    # Delete custom roles
    for role in list(guild.roles):
        if role.is_bot_managed() or role.is_integration() or role.is_default() or role.is_premium_subscriber():
            continue
        if role.position >= guild.me.top_role.position:
            continue
        try:
            await role.delete()
        except discord.HTTPException:
            pass

    # Recreate roles
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

    # Recreate categories
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

    # Recreate channels
    channels_data = backup_data.get("channels", [])
    for ch_data in channels_data:
        try:
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
        except discord.HTTPException:
            pass

    try:
        owner = guild.owner
        if owner:
            embed = make_embed(f"The server backup **{backup_data.get('name')}** has been fully restored on **{guild.name}**!", ORBIT_COLOR)
            embed.title = "Backup Restored"
            await owner.send(embed=embed)
    except Exception:
        pass

class BackupCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.auto_backup_loop.start()

    def cog_unload(self):
        self.auto_backup_loop.cancel()

    @tasks.loop(minutes=2)
    async def auto_backup_loop(self):
        now = int(time.time())
        try:
            configs = get_all_active_backup_configs()
            for cfg in configs:
                guild_id = cfg.get("guild_id")
                if not guild_id:
                    continue
                next_backup = cfg.get("next_backup")
                interval = cfg.get("interval", "daily")
                
                # If next backup is not set or reached
                if next_backup is None or now >= next_backup:
                    guild = self.bot.get_guild(guild_id)
                    if guild:
                        try:
                            backup_name = f"Auto Backup {datetime.now().strftime('%m/%d/%Y %H:%M')}"
                            backup_data = await create_backup_data(guild, name=backup_name)
                            save_backup(backup_data)
                            
                            # Schedule next run
                            next_ts = calculate_next_backup_timestamp(interval, now)
                            cfg["last_backup"] = now
                            cfg["next_backup"] = next_ts
                            save_backup_config(guild_id, cfg)
                        except Exception as e:
                            print(f"[AutoBackup] Error taking auto-backup for guild {guild_id}: {e}")
        except Exception as e:
            print(f"[AutoBackup] Error in loop: {e}")

    @auto_backup_loop.before_loop
    async def before_auto_backup_loop(self):
        await self.bot.wait_until_ready()

    backup_group = app_commands.Group(name="backup", description="Server Backup Commands")

    async def save_new_backup(self, interaction: discord.Interaction, backup_data: dict):
        save_backup(backup_data)
        try:
            embed = discord.Embed(
                title="Backup Created",
                description=f"Successfully created backup **{backup_data['name']}**.\nSlots used: **{len(get_backups(backup_data['guild_id']))}/{MAX_BACKUPS}**",
                color=ORBIT_COLOR
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
        if interaction.user.id != interaction.guild.owner_id and not interaction.user.guild_permissions.administrator:
            return await interaction.response.send_message(embed=make_embed("Only the server owner or administrators can create a backup."), ephemeral=True)

        await interaction.response.defer(ephemeral=True)
        guild = interaction.guild

        new_backup_data = await create_backup_data(guild, name)
        save_backup(new_backup_data)
        
        # Update config last backup
        cfg = get_backup_config(guild.id)
        cfg["last_backup"] = int(time.time())
        save_backup_config(guild.id, cfg)

        backups_count = len(get_backups(guild.id))
        embed = discord.Embed(
            title="Backup Created",
            description=f"Successfully created backup **{new_backup_data['name']}**.\nSlots used: **{backups_count}/{MAX_BACKUPS}**",
            color=ORBIT_COLOR
        )
        await interaction.followup.send(embed=embed, ephemeral=True)

    @backup_group.command(name="load", description="Load a previously created backup (DESTRUCTIVE).")
    async def backup_load_cmd(self, interaction: discord.Interaction):
        if interaction.user.id != interaction.guild.owner_id and not interaction.user.guild_permissions.administrator:
            return await interaction.response.send_message(embed=make_embed("Only the server owner or administrators can load a backup."), ephemeral=True)
        
        existing_backups = get_backups(interaction.guild.id)
        if not existing_backups:
            return await interaction.response.send_message(embed=make_embed("No backups found for this server."), ephemeral=True)
            
        view = BackupListView(existing_backups, self)
        await interaction.response.send_message(embed=make_embed("Select a backup to load from the dropdown below:"), view=view, ephemeral=True)

    @backup_group.command(name="delete", description="Delete an existing server backup.")
    async def backup_delete_cmd(self, interaction: discord.Interaction):
        if interaction.user.id != interaction.guild.owner_id and not interaction.user.guild_permissions.administrator:
            return await interaction.response.send_message(embed=make_embed("Only the server owner or administrators can delete backups."), ephemeral=True)
            
        existing_backups = get_backups(interaction.guild.id)
        if not existing_backups:
            return await interaction.response.send_message(embed=make_embed("No backups found for this server."), ephemeral=True)

        view = BackupListView(existing_backups, self)
        await interaction.response.send_message(embed=make_embed("Select a backup to delete from the delete dropdown below:"), view=view, ephemeral=True)

    @backup_group.command(name="list", description="List all server backups.")
    async def backup_list_cmd(self, interaction: discord.Interaction):
        await self.backups_cmd(interaction)

    @app_commands.command(name="backups", description="List all server backups.")
    async def backups_cmd(self, interaction: discord.Interaction):
        if interaction.user.id != interaction.guild.owner_id and not interaction.user.guild_permissions.administrator:
            return await interaction.response.send_message(embed=make_embed("Only the server owner or administrators can view backups."), ephemeral=True)
            
        existing_backups = get_backups(interaction.guild.id)
        if not existing_backups:
            return await interaction.response.send_message(embed=make_embed("No backups found for this server. Use `/backup create` or the dashboard to make one."), ephemeral=True)
            
        embed = discord.Embed(title=f"Server Backups ({len(existing_backups)}/{MAX_BACKUPS})", color=ORBIT_COLOR)
        for b in existing_backups:
            name = b.get("name", b["_id"])
            ts = b.get("timestamp", 0)
            date_str = f"<t:{int(ts)}:f>"
            ch_cnt = b.get("channels_count", len(b.get("channels", [])))
            r_cnt = b.get("roles_count", len(b.get("roles", [])))
            m_cnt = b.get("members_count", 0)
            stats = f"{ch_cnt} channels · {r_cnt} roles · {m_cnt} members"
            embed.add_field(name=f"📦 {name}", value=f"Created: {date_str}\nStats: `{stats}`", inline=False)
        
        view = BackupListView(existing_backups, self)
        await interaction.response.send_message(embed=embed, view=view, ephemeral=True)

    async def execute_backup_load(self, interaction: discord.Interaction, backup_id: str):
        guild = interaction.guild
        backup_data = get_backup(backup_id)
        if not backup_data:
            return await interaction.followup.send(embed=make_embed("Backup data not found.", discord.Color.red()), ephemeral=True)

        await interaction.followup.send(embed=make_embed("Starting backup restoration... This may take a few moments."), ephemeral=True)
        await restore_backup_data(guild, backup_data)

async def setup(bot: commands.Bot):
    await bot.add_cog(BackupCommand(bot))
