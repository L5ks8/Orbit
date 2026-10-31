import discord
from discord.ext import commands, tasks
from discord import app_commands
import uuid
import time
import asyncio
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
    clean_doc_for_json,
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
            "old_id": ch.id
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

    modules_config = {}
    try:
        from Components.Systems.Verify._storage import load_verify_config
        modules_config["verify"] = clean_doc_for_json(load_verify_config(guild.id))
    except Exception:
        pass

    try:
        from Components.Systems.Tickets._storage import load_ticket_config
        modules_config["tickets"] = clean_doc_for_json(load_ticket_config(guild.id))
    except Exception:
        pass

    try:
        from Components.Systems.Automoderation.log_storage import load_log_config
        modules_config["logs"] = clean_doc_for_json(load_log_config(guild.id))
    except Exception:
        pass

    try:
        from Components.Systems.WelcomeGoodbye._storage import load_welcome_config, load_goodbye_config
        modules_config["welcome"] = clean_doc_for_json(load_welcome_config(guild.id))
        modules_config["goodbye"] = clean_doc_for_json(load_goodbye_config(guild.id))
    except Exception:
        pass

    try:
        from Components.Systems.Roles._storage import load_join_roles
        modules_config["join_roles"] = clean_doc_for_json(load_join_roles(guild.id))
    except Exception:
        pass

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
        "members_count": guild.member_count or len(guild.members),
        "modules_config": modules_config
    }

async def restore_backup_data(guild: discord.Guild, backup_data: dict):
    # 1. Delete channels
    for ch in list(guild.channels):
        try:
            await ch.delete()
        except discord.HTTPException:
            pass

    # 2. Delete custom roles
    for role in list(guild.roles):
        if role.is_bot_managed() or role.is_integration() or role.is_default() or role.is_premium_subscriber():
            continue
        if role.position >= guild.me.top_role.position:
            continue
        try:
            await role.delete()
        except discord.HTTPException:
            pass

    # 3. Recreate roles
    role_map = {}
    roles_by_name = {}
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
            roles_by_name[r_data["name"].lower().strip()] = new_role
        except discord.HTTPException:
            pass

    # 4. Recreate categories
    category_map = {}
    categories_by_name = {}
    categories_data = backup_data.get("categories", [])
    for cat_data in categories_data:
        try:
            new_cat = await guild.create_category(
                name=cat_data["name"],
                reason="Backup restoration"
            )
            category_map[str(cat_data["old_id"])] = new_cat
            categories_by_name[cat_data["name"].lower().strip()] = new_cat
        except discord.HTTPException:
            pass

    # 5. Recreate channels
    channel_map = {}
    channels_by_name = {}
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

            new_ch = None
            if ch_data["type"] == "text":
                new_ch = await guild.create_text_channel(
                    name=ch_data["name"],
                    category=category,
                    topic=ch_data.get("topic"),
                    nsfw=ch_data.get("nsfw", False),
                    slowmode_delay=ch_data.get("slowmode_delay", 0),
                    overwrites=overwrites,
                    reason="Backup restoration"
                )
            elif ch_data["type"] == "voice":
                new_ch = await guild.create_voice_channel(
                    name=ch_data["name"],
                    category=category,
                    user_limit=ch_data.get("user_limit", 0),
                    bitrate=ch_data.get("bitrate", 64000),
                    overwrites=overwrites,
                    reason="Backup restoration"
                )

            if new_ch:
                if ch_data.get("old_id"):
                    channel_map[str(ch_data["old_id"])] = new_ch
                channels_by_name[ch_data["name"].lower().strip()] = new_ch
        except discord.HTTPException:
            pass

    # Wait 1.5s for Discord channel and role caches to propagate
    await asyncio.sleep(1.5)

    saved_modules = backup_data.get("modules_config", {}) or {}

    # 6. Reconfigure & Resend Verification System
    try:
        from Components.Systems.Verify._storage import load_verify_config, save_verify_config
        v_saved = saved_modules.get("verify")
        verify_cfg = v_saved if isinstance(v_saved, dict) else load_verify_config(guild.id)

        # Match verification channel
        v_ch = None
        old_vch_id = str(verify_cfg.get("channel_id") or "")
        if old_vch_id in channel_map:
            v_ch = channel_map[old_vch_id]
        if not v_ch:
            v_ch = channels_by_name.get("verify") or channels_by_name.get("verification") or next((c for name, c in channels_by_name.items() if "verify" in name), None)

        # Match verified and unverified roles
        old_vrole_id = str(verify_cfg.get("role_id") or "")
        v_role = role_map.get(old_vrole_id) or roles_by_name.get("verified") or roles_by_name.get("mitglied") or roles_by_name.get("member")

        old_unvrole_id = str(verify_cfg.get("remove_role_id") or "")
        unv_role = role_map.get(old_unvrole_id) or roles_by_name.get("unverified")

        if v_ch:
            verify_cfg["channel_id"] = str(v_ch.id)
        if v_role:
            verify_cfg["role_id"] = str(v_role.id)
        if unv_role:
            verify_cfg["remove_role_id"] = str(unv_role.id)

        # Update sub-systems
        if isinstance(verify_cfg.get("systems"), list):
            for s in verify_cfg["systems"]:
                if isinstance(s, dict):
                    if str(s.get("channel_id")) in channel_map:
                        s["channel_id"] = str(channel_map[str(s["channel_id"])].id)
                    elif v_ch:
                        s["channel_id"] = str(v_ch.id)
                    if str(s.get("role_id")) in role_map:
                        s["role_id"] = str(role_map[str(s["role_id"])].id)
                    elif v_role:
                        s["role_id"] = str(v_role.id)
                    if str(s.get("remove_role_id")) in role_map:
                        s["remove_role_id"] = str(role_map[str(s["remove_role_id"])].id)
                    elif unv_role:
                        s["remove_role_id"] = str(unv_role.id)

        verify_cfg["enabled"] = True
        save_verify_config(guild.id, verify_cfg)

        # Automatically send verification panel message
        if v_ch:
            emb_title = verify_cfg.get("embed_title") or "Server Verification"
            emb_desc = verify_cfg.get("embed_description") or "Please click the button below to verify your account and gain access to the server."
            v_embed = discord.Embed(
                title=emb_title,
                description=emb_desc,
                color=ORBIT_COLOR
            )
            btn_label = str(verify_cfg.get("button_label") or "Verify").strip() or "Verify"
            v_view = discord.ui.View(timeout=None)
            v_view.add_item(discord.ui.Button(
                label=btn_label[:80],
                style=discord.ButtonStyle.success,
                custom_id="orbit:verify_start"
            ))
            sent_v = await v_ch.send(embed=v_embed, view=v_view)
            verify_cfg["message_id"] = str(sent_v.id)
            save_verify_config(guild.id, verify_cfg)
    except Exception as e:
        print(f"[BackupRestore] Error restoring verification system: {e}")

    # 7. Reconfigure & Resend Ticket Desk
    try:
        from Components.Systems.Tickets._storage import load_ticket_config, save_ticket_config
        from Components.Systems.Tickets._views import PersistentTicketPanelLayout
        t_saved = saved_modules.get("tickets")
        ticket_cfg = t_saved if isinstance(t_saved, dict) else load_ticket_config(guild.id)

        # Match panel channel
        t_ch = None
        old_tch_id = str(ticket_cfg.get("panel_channel_id") or "")
        if old_tch_id in channel_map:
            t_ch = channel_map[old_tch_id]
        if not t_ch:
            t_ch = channels_by_name.get("tickets") or channels_by_name.get("ticket") or channels_by_name.get("support") or next((c for name, c in channels_by_name.items() if "ticket" in name), None)

        # Match category
        old_tcat_id = str(ticket_cfg.get("category_id") or "")
        t_cat = category_map.get(old_tcat_id) or categories_by_name.get("tickets") or categories_by_name.get("support") or next((c for name, c in categories_by_name.items() if "ticket" in name), None)

        # Match support role
        old_supp_id = str(ticket_cfg.get("support_role_id") or "")
        supp_role = role_map.get(old_supp_id) or roles_by_name.get("support") or roles_by_name.get("staff") or roles_by_name.get("moderator")

        # Match ticket log channel
        old_tlog_id = str(ticket_cfg.get("log_channel_id") or "")
        tlog_ch = channel_map.get(old_tlog_id) or channels_by_name.get("ticket-logs") or channels_by_name.get("mod-logs")

        if t_ch:
            ticket_cfg["panel_channel_id"] = str(t_ch.id)
        if t_cat:
            ticket_cfg["category_id"] = str(t_cat.id)
        if supp_role:
            ticket_cfg["support_role_id"] = str(supp_role.id)
        if tlog_ch:
            ticket_cfg["log_channel_id"] = str(tlog_ch.id)

        ticket_cfg["enabled"] = True
        save_ticket_config(guild.id, ticket_cfg)

        # Automatically send ticket panel message
        if t_ch:
            p_title = ticket_cfg.get("panel_title") or "Support Ticket Desk"
            p_desc = ticket_cfg.get("panel_description") or "Click the button below to open a direct support channel with our team."
            p_instr = ticket_cfg.get("panel_instructions") or "> Select your desired inquiry category in the dropdown menu below, then click **Create Ticket** to open your private channel."
            t_options = ticket_cfg.get("options_slots") or ticket_cfg.get("options") or []

            t_view = PersistentTicketPanelLayout(
                title=p_title,
                description=p_desc,
                instructions=p_instr,
                options_slots=t_options
            )
            t_embed = discord.Embed(
                title=p_title,
                description=f"{p_desc}\n\n{p_instr}",
                color=ORBIT_COLOR
            )
            await t_ch.send(embed=t_embed, view=t_view)
    except Exception as e:
        print(f"[BackupRestore] Error restoring ticket desk: {e}")

    # 8. Reconfigure Log Channels
    try:
        from Components.Systems.Automoderation.log_storage import load_log_config, save_log_config
        l_saved = saved_modules.get("logs")
        log_cfg = l_saved if isinstance(l_saved, dict) else load_log_config(guild.id)
        default_log_ch = channels_by_name.get("mod-logs") or channels_by_name.get("logs") or channels_by_name.get("audit-log") or next((c for name, c in channels_by_name.items() if "log" in name), None)

        if isinstance(log_cfg.get("channels"), dict):
            for cat, ch_id in list(log_cfg["channels"].items()):
                if ch_id and str(ch_id) in channel_map:
                    log_cfg["channels"][cat] = str(channel_map[str(ch_id)].id)
                elif default_log_ch:
                    log_cfg["channels"][cat] = str(default_log_ch.id)
        save_log_config(guild.id, log_cfg)
    except Exception as e:
        print(f"[BackupRestore] Error restoring log channels: {e}")

    # 9. Reconfigure Welcome & Goodbye
    try:
        from Components.Systems.WelcomeGoodbye._storage import (
            load_welcome_config, save_welcome_config,
            load_goodbye_config, save_goodbye_config
        )
        w_saved = saved_modules.get("welcome")
        w_cfg = w_saved if isinstance(w_saved, dict) else load_welcome_config(guild.id)
        old_wch = str(w_cfg.get("channel_id") or "")
        new_wch = channel_map.get(old_wch) or channels_by_name.get("welcome") or channels_by_name.get("willkommen")
        if new_wch:
            w_cfg["channel_id"] = str(new_wch.id)
            save_welcome_config(guild.id, w_cfg)

        g_saved = saved_modules.get("goodbye")
        g_cfg = g_saved if isinstance(g_saved, dict) else load_goodbye_config(guild.id)
        old_gch = str(g_cfg.get("channel_id") or "")
        new_gch = channel_map.get(old_gch) or channels_by_name.get("goodbye") or channels_by_name.get("leave")
        if new_gch:
            g_cfg["channel_id"] = str(new_gch.id)
            save_goodbye_config(guild.id, g_cfg)
    except Exception as e:
        print(f"[BackupRestore] Error restoring welcome/goodbye: {e}")

    # 10. Reconfigure Join Roles
    try:
        from Components.Systems.Roles._storage import load_join_roles, save_join_roles
        j_saved = saved_modules.get("join_roles")
        join_roles = j_saved if isinstance(j_saved, list) else load_join_roles(guild.id)
        if isinstance(join_roles, list):
            new_join_roles = []
            for r_id in join_roles:
                if str(r_id) in role_map:
                    new_join_roles.append(str(role_map[str(r_id)].id))
            save_join_roles(guild.id, new_join_roles)
    except Exception as e:
        print(f"[BackupRestore] Error restoring join roles: {e}")

    # 11. Notify Server Owner
    try:
        owner = guild.owner
        if owner:
            embed = make_embed(
                f"The server backup **{backup_data.get('name')}** has been fully restored on **{guild.name}**!\n\n"
                f"✅ Channels & Roles reconstructed\n"
                f"✅ Verification System reconfigured & panel deployed\n"
                f"✅ Support Ticket Desk reconfigured & panel deployed\n"
                f"✅ Log channels, Welcome, Goodbye, and Join Roles updated",
                ORBIT_COLOR
            )
            embed.title = "Backup Restored Successfully"
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
            configs = await asyncio.to_thread(get_all_active_backup_configs)
            for cfg in configs:
                await asyncio.sleep(0.05)
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

    @auto_backup_loop.error
    async def auto_backup_loop_error(self, error):
        print(f"[AutoBackup] Internal error in auto_backup_loop task: {error}")
        await asyncio.sleep(5)
        if not self.auto_backup_loop.is_running():
            try:
                self.auto_backup_loop.restart()
            except Exception:
                pass

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

        await interaction.followup.send(embed=make_embed("Starting backup restoration... Channels, roles, verification, tickets, and log configs are being reconstructed."), ephemeral=True)
        await restore_backup_data(guild, backup_data)

async def setup(bot: commands.Bot):
    await bot.add_cog(BackupCommand(bot))
