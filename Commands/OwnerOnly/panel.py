import json
import pathlib
import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button, Select, Modal, TextInput
import time
import os
import io
import traceback
import textwrap
from contextlib import redirect_stdout
from Commands.OwnerOnly._monitor import get_system_metrics, get_error_log, clear_errors, record_command, get_live_logs
from Commands.OwnerOnly._storage import load_devmode_config, save_devmode_config

class GetInviteModal(Modal, title="Generate Server Invite"):
    guild_id_input = TextInput(label="Target Guild ID", required=True)
    def __init__(self, view: "MasterPanelLayoutView"):
        super().__init__()
        self.view = view
    async def on_submit(self, interaction: discord.Interaction):
        guild = self.view.bot.get_guild(int(self.guild_id_input.value.strip()))
        if not guild:
            return await interaction.response.send_message("Guild not found.", ephemeral=True)
        try:
            for channel in guild.text_channels:
                if channel.permissions_for(guild.me).create_instant_invite:
                    invite = await channel.create_invite(max_age=300, max_uses=1, unique=True, reason="Owner requested.")
                    return await interaction.response.send_message(f"**Invite to {guild.name}:**\n{invite.url}", ephemeral=True)
            await interaction.response.send_message("No permission to create invites in any text channel.", ephemeral=True)
        except Exception as e:
            await interaction.response.send_message(f"Error: {e}", ephemeral=True)

class ReloadModal(Modal, title="Hot-Reload Extension"):
    ext_input = TextInput(label="Extension Name (or 'all')", placeholder="Commands.Moderation.kick", required=True)
    def __init__(self, view: "MasterPanelLayoutView"):
        super().__init__()
        self.view = view
    async def on_submit(self, interaction: discord.Interaction):
        await interaction.response.defer(ephemeral=True)
        val = self.ext_input.value.strip()
        bot = self.view.bot
        if val.lower() == "all":
            cogs = list(bot.extensions.keys())
            success, fails = 0, 0
            for c in cogs:
                try:
                    await bot.reload_extension(c)
                    success += 1
                except:
                    fails += 1
            return await interaction.followup.send(f"Reloaded {success} extensions. {fails} failed.")
        try:
            await bot.reload_extension(val)
            await interaction.followup.send(f"Successfully reloaded `{val}`.")
        except Exception as e:
            await interaction.followup.send(f"Failed to reload `{val}`: {e}")

class EvalModal(Modal, title="Live Python Console"):
    code_input = TextInput(label="Code (Async context)", style=discord.TextStyle.paragraph, required=True)
    def __init__(self, view: "MasterPanelLayoutView"):
        super().__init__()
        self.view = view
    async def on_submit(self, interaction: discord.Interaction):
        await interaction.response.defer(ephemeral=True)
        code = self.code_input.value
        env = {'bot': self.view.bot, 'interaction': interaction, 'discord': discord, 'os': os}
        code = f"async def _eval_expr():\n{textwrap.indent(code, '    ')}"
        stdout = io.StringIO()
        try:
            exec(code, env)
            func = env['_eval_expr']
            with redirect_stdout(stdout):
                ret = await func()
        except Exception as e:
            return await interaction.followup.send(f"**Error:**\n```py\n{traceback.format_exc()}\n```")
        out = stdout.getvalue()
        await interaction.followup.send(f"**Output:**\n```py\n{out}\n```\n**Returned:**\n```py\n{ret}\n```")

class StatusModal(Modal, title="Update Bot Presence"):
    type_input = TextInput(label="Activity Type (playing, watching, etc.)", default="playing")
    text_input = TextInput(label="Activity Text")
    status_input = TextInput(label="Status (online, dnd, idle, invisible)", default="online")
    def __init__(self, view: "MasterPanelLayoutView"):
        super().__init__()
        self.view = view
    async def on_submit(self, interaction: discord.Interaction):
        act_type = self.type_input.value.lower().strip()
        text = self.text_input.value.strip()
        stat = self.status_input.value.lower().strip()
        
        discord_stat = discord.Status.online
        if stat in ["dnd", "do_not_disturb"]: discord_stat = discord.Status.dnd
        elif stat in ["idle", "abwesend"]: discord_stat = discord.Status.idle
        elif stat in ["invisible", "offline"]: discord_stat = discord.Status.invisible

        act = None
        if act_type in ["play", "playing"]: act = discord.Game(name=text)
        elif act_type in ["watch", "watching"]: act = discord.Activity(type=discord.ActivityType.watching, name=text)
        elif act_type in ["listen", "listening"]: act = discord.Activity(type=discord.ActivityType.listening, name=text)
        elif act_type in ["stream", "streaming"]: act = discord.Streaming(name=text, url="https://twitch.tv/discord")
        elif act_type in ["compete", "competing"]: act = discord.Activity(type=discord.ActivityType.competing, name=text)
        else: act = discord.CustomActivity(name=f"{act_type} {text}".strip())

        await self.view.bot.change_presence(activity=act, status=discord_stat)
        await interaction.response.send_message("Presence updated.", ephemeral=True)


class MasterPanelLayoutView(LayoutView):
    def __init__(self, bot: commands.Bot, owner: discord.abc.User):
        super().__init__(timeout=None)
        self.bot = bot
        self.owner = owner
        self.current_tab = "dashboard"
        
        self.servers_page = 0
        self.per_page = 5
        self.guilds_list = sorted(bot.guilds, key=lambda g: g.member_count or 0, reverse=True)
        self.total_server_pages = max(1, (len(self.guilds_list) + self.per_page - 1) // self.per_page)

        self.selected_storage_path = None
        self.build_ui()

    def build_ui(self):
        self.clear_items()
        
        options = [
            discord.SelectOption(label="Performance Dashboard", value="dashboard", description="RAM, CPU, Cache Hits, Throughput"),
            discord.SelectOption(label="System Error Inspector", value="errors", description="View internal system ring buffer"),
            discord.SelectOption(label="Server Directory", value="servers", description="List all connected Discord guilds"),
            discord.SelectOption(label="Storage Explorer", value="storage", description="Browse internal JSON databases"),
            discord.SelectOption(label="Developer Directory", value="owner", description="View all owner command descriptions"),
            discord.SelectOption(label="Live Event Logs", value="livelogs", description="Stream of the last 50 events"),
            discord.SelectOption(label="Global Devmode", value="devmode", description="Toggle maintenance mode lock"),
            discord.SelectOption(label="DM History Purge", value="dmclear", description="Clear bot's DM history with you"),
            discord.SelectOption(label="Export Storage ZIP", value="getstorage", description="Receive all databases in a ZIP"),
            discord.SelectOption(label="Command Sync", value="sync", description="Sync slash commands globally or locally"),
            discord.SelectOption(label="Restart / Reboot", value="restart", description="Cleanly restart the bot process"),
            
            # Popups (Modals)
            discord.SelectOption(label="Server Invite Generator", value="getinvite", description="[POPUP] Generate an invite to any guild"),
            discord.SelectOption(label="Live Console & Eval", value="console", description="[POPUP] Execute raw python bytecode"),
            discord.SelectOption(label="Bot Status & Activity", value="status", description="[POPUP] Change playing/watching status"),
            discord.SelectOption(label="Reload Modules", value="reload", description="[POPUP] Hot-reload python extensions")
        ]
        
        tab_select = Select(placeholder="Select Control Panel Module...", options=options, min_values=1, max_values=1)
        
        async def _tab_cb(interaction: discord.Interaction):
            if interaction.user.id != self.owner.id:
                return await interaction.response.send_message("Not authorized.", ephemeral=True)
                
            sel = tab_select.values[0]
            
            if sel == "getinvite": return await interaction.response.send_modal(GetInviteModal(self))
            if sel == "console": return await interaction.response.send_modal(EvalModal(self))
            if sel == "status": return await interaction.response.send_modal(StatusModal(self))
            if sel == "reload": return await interaction.response.send_modal(ReloadModal(self))
                
            self.current_tab = sel
            self.build_ui()
            await interaction.response.edit_message(view=self)
            
        tab_select.callback = _tab_cb
        
        if self.current_tab == "dashboard": self.container = self._build_dashboard_container()
        elif self.current_tab == "errors": self.container = self._build_errors_container()
        elif self.current_tab == "servers": self.container = self._build_servers_container()
        elif self.current_tab == "storage": self.container = self._build_storage_container()
        elif self.current_tab == "owner": self.container = self._build_owner_container()
        elif self.current_tab == "livelogs": self.container = self._build_livelogs_container()
        elif self.current_tab == "devmode": self.container = self._build_devmode_container()
        elif self.current_tab == "dmclear": self.container = self._build_dmclear_container()
        elif self.current_tab == "getstorage": self.container = self._build_getstorage_container()
        elif self.current_tab == "sync": self.container = self._build_sync_container()
        elif self.current_tab == "restart": self.container = self._build_restart_container()

        self.add_item(self.container)
        self.add_item(ActionRow(tab_select))

        # Add specific action rows for the current tab
        if self.current_tab == "errors":
            btn_clear = Button(label="Clear Error Buffer", style=discord.ButtonStyle.danger)
            async def _clear_cb(interaction: discord.Interaction):
                if interaction.user.id != self.owner.id: return
                clear_errors()
                self.build_ui()
                await interaction.response.edit_message(view=self)
            btn_clear.callback = _clear_cb
            self.add_item(ActionRow(btn_clear))
            
        elif self.current_tab == "servers":
            prev_btn = Button(style=discord.ButtonStyle.secondary, label="Previous", disabled=(self.servers_page == 0))
            next_btn = Button(style=discord.ButtonStyle.secondary, label="Next", disabled=(self.servers_page >= self.total_server_pages - 1))
            
            async def _prev_cb(interaction: discord.Interaction):
                if interaction.user.id != self.owner.id: return
                self.servers_page -= 1
                self.build_ui()
                await interaction.response.edit_message(view=self)
                
            async def _next_cb(interaction: discord.Interaction):
                if interaction.user.id != self.owner.id: return
                self.servers_page += 1
                self.build_ui()
                await interaction.response.edit_message(view=self)
                
            prev_btn.callback = _prev_cb
            next_btn.callback = _next_cb
            self.add_item(ActionRow(prev_btn, next_btn))
            
        elif self.current_tab == "storage":
            storage_dir = pathlib.Path("Storage")
            s_options = []
            if storage_dir.exists():
                for p in storage_dir.glob("*.json"):
                    s_options.append(discord.SelectOption(label=f"Global: {p.name}", value=str(p)))
                for folder in storage_dir.iterdir():
                    if folder.is_dir() and folder.name.isdigit():
                        for p in folder.glob("*.json"):
                            if len(s_options) < 25:
                                s_options.append(discord.SelectOption(label=f"Guild {folder.name}: {p.name}"[:100], value=str(p)))
                                
            if not s_options:
                s_options.append(discord.SelectOption(label="No storage files found", value="none"))
                
            file_select = Select(placeholder="Select JSON File...", options=s_options[:25], min_values=1, max_values=1)
            
            async def _file_cb(interaction: discord.Interaction):
                if interaction.user.id != self.owner.id: return
                if file_select.values[0] != "none":
                    self.selected_storage_path = file_select.values[0]
                self.build_ui()
                await interaction.response.edit_message(view=self)
                
            file_select.callback = _file_cb
            self.add_item(ActionRow(file_select))
            
        elif self.current_tab == "devmode":
            dev_cfg = load_devmode_config()
            btn_toggle = Button(label="Toggle Devmode", style=discord.ButtonStyle.danger if dev_cfg["enabled"] else discord.ButtonStyle.success)
            async def _toggle_cb(interaction: discord.Interaction):
                if interaction.user.id != self.owner.id: return
                dev_cfg["enabled"] = not dev_cfg["enabled"]
                save_devmode_config(dev_cfg)
                self.build_ui()
                await interaction.response.edit_message(view=self)
            btn_toggle.callback = _toggle_cb
            self.add_item(ActionRow(btn_toggle))
            
        elif self.current_tab == "dmclear":
            btn_clear = Button(label="Purge DMs", style=discord.ButtonStyle.danger)
            async def _dmclear_cb(interaction: discord.Interaction):
                if interaction.user.id != self.owner.id: return
                await interaction.response.defer(ephemeral=True)
                try:
                    dm_chan = interaction.user.dm_channel or await interaction.user.create_dm()
                    deleted = 0
                    async for m in dm_chan.history(limit=50):
                        if m.author.id == self.bot.user.id:
                            await m.delete()
                            deleted += 1
                    await interaction.followup.send(f"Cleared {deleted} messages from DMs.")
                except Exception as e:
                    await interaction.followup.send(f"Failed: {e}")
            btn_clear.callback = _dmclear_cb
            self.add_item(ActionRow(btn_clear))

        elif self.current_tab == "getstorage":
            btn_export = Button(label="Export to ZIP", style=discord.ButtonStyle.primary)
            async def _export_cb(interaction: discord.Interaction):
                if interaction.user.id != self.owner.id: return
                await interaction.response.defer(ephemeral=True)
                import shutil
                shutil.make_archive("StorageBackup", "zip", "Storage")
                try:
                    dm = interaction.user.dm_channel or await interaction.user.create_dm()
                    await dm.send(file=discord.File("StorageBackup.zip"))
                    await interaction.followup.send("Sent ZIP to DMs.")
                except Exception as e:
                    await interaction.followup.send(f"Failed to send: {e}")
                os.remove("StorageBackup.zip")
            btn_export.callback = _export_cb
            self.add_item(ActionRow(btn_export))
            
        elif self.current_tab == "sync":
            btn_sync = Button(label="Sync Global", style=discord.ButtonStyle.primary)
            async def _sync_cb(interaction: discord.Interaction):
                if interaction.user.id != self.owner.id: return
                await interaction.response.defer(ephemeral=True)
                synced = await self.bot.tree.sync()
                await interaction.followup.send(f"Synced {len(synced)} global commands.")
            btn_sync.callback = _sync_cb
            self.add_item(ActionRow(btn_sync))
            
        elif self.current_tab == "restart":
            btn_restart = Button(label="Confirm Restart", style=discord.ButtonStyle.danger)
            async def _restart_cb(interaction: discord.Interaction):
                if interaction.user.id != self.owner.id: return
                await interaction.response.send_message("Restarting...", ephemeral=True)
                os.execv(os.sys.executable, ['python'] + os.sys.argv)
            btn_restart.callback = _restart_cb
            self.add_item(ActionRow(btn_restart))


    # ---------------- UI BUILDERS ----------------
    def _build_dashboard_container(self) -> Container:
        metrics = get_system_metrics(self.bot)
        header_str = f"**RAM Hit Rate:** `{metrics['cache_hit_rate']}%`"
        content_str = (
            f"**In-Memory RAM Cache Statistics:**\n"
            f"> **Cache Hits:** `{metrics['cache_hits']}`\n"
            f"> **Cache Misses:** `{metrics['cache_misses']}`\n"
            f"> **Cache Writes:** `{metrics['cache_writes']}`\n\n"
            f"**Message & Command Throughput:**\n"
            f"> **Messages:** `{metrics['messages']}`\n"
            f"> **Commands:** `{metrics['commands']}`\n\n"
            f"**Asyncio & OS Concurrency:**\n"
            f"> **Tasks:** `{metrics['asyncio_tasks']}`\n"
            f"> **Threads:** `{metrics['threads']}`\n"
            f"> **Shards:** `{metrics['shards']}` (`{metrics['ping_ms']} ms`)\n\n"
            f"**Hardware & OS:**\n"
            f"> **RAM:** `{metrics['ram_mb']} MB` (`{metrics.get('total_ram_gb', '0')} GB OS`)\n"
            f"> **CPU:** `{metrics['cpu_pct']}%` (`{metrics.get('sys_cpu_pct', '0')}% OS`)"
        )
        return Container(TextDisplay(content=header_str), Separator(spacing=discord.SeparatorSpacing.small), TextDisplay(content=content_str))

    def _build_errors_container(self) -> Container:
        errs = get_error_log()
        header_str = "**System Errors:**"
        if not errs:
            content_str = "0 Errors."
        else:
            lines = []
            for e in errs[:5]:
                clean_msg = str(e.get("message", ""))[:65]
                lines.append(f"`[{e.get('timestamp', '')}]` **[{e.get('source', '')}]** — `{clean_msg}`")
            content_str = f"**Buffer ({len(errs)} stored):**\n" + "\n".join(lines)
            latest_tb = errs[0].get("traceback", "")
            if latest_tb: content_str += f"\n\n**Latest Traceback:**\n```python\n{latest_tb[:450]}\n```"
            if len(content_str) > 1700: content_str = content_str[:1700] + "\n``` (truncated)"
        return Container(TextDisplay(content=header_str), Separator(spacing=discord.SeparatorSpacing.small), TextDisplay(content=content_str))

    def _build_servers_container(self) -> Container:
        total_members = sum(g.member_count or 0 for g in self.guilds_list)
        header_str = f"**Guilds:** `{len(self.guilds_list)}` | **Members:** `{total_members:,}` | **Page:** `{self.servers_page + 1} / {self.total_server_pages}`"
        start_idx = self.servers_page * self.per_page
        end_idx = start_idx + self.per_page
        page_guilds = self.guilds_list[start_idx:end_idx]
        if not page_guilds:
            content_str = "None."
        else:
            lines = []
            for idx, g in enumerate(page_guilds, start=start_idx + 1):
                owner_str = f"<@{g.owner_id}> (`{g.owner_id}`)" if g.owner_id else "Unknown"
                lines.append(f"**{idx}. {g.name}**\n> **ID:** `{g.id}` | **Members:** `{g.member_count or 0:,}`\n> **Owner:** {owner_str}")
            content_str = "\n\n".join(lines)
        return Container(TextDisplay(content=header_str), Separator(spacing=discord.SeparatorSpacing.small), TextDisplay(content=content_str))

    def _build_storage_container(self) -> Container:
        header_str = "**JSON Storage Browser:**"
        file_str = "No file selected."
        if self.selected_storage_path and pathlib.Path(self.selected_storage_path).exists():
            try:
                with open(self.selected_storage_path, "r", encoding="utf-8") as f:
                    data_content = json.load(f)
                raw_dump = json.dumps(data_content, indent=2)[:1300]
                file_str = f"**Path:** `{self.selected_storage_path}`\n```json\n{raw_dump}\n```"
            except Exception as e:
                file_str = f"`{self.selected_storage_path}`\n*(Error: {e})*"
        return Container(TextDisplay(content=header_str), Separator(spacing=discord.SeparatorSpacing.small), TextDisplay(content=file_str))
        
    def _build_owner_container(self) -> Container:
        return Container(TextDisplay(content="**Owner Command Directory:**"), Separator(spacing=discord.SeparatorSpacing.small), TextDisplay(content="Use the dropdown menu to navigate all Owner functions. Standalone commands have been deleted. You can still use `-gblacklist` directly."))

    def _build_livelogs_container(self) -> Container:
        logs = get_live_logs(15)
        content = "\n".join(logs) if logs else "No events."
        return Container(TextDisplay(content="**Live Event Logs:**"), Separator(spacing=discord.SeparatorSpacing.small), TextDisplay(content=content))

    def _build_devmode_container(self) -> Container:
        dev_cfg = load_devmode_config()
        state = "ENABLED (Users Locked)" if dev_cfg["enabled"] else "DISABLED (Users Allowed)"
        return Container(TextDisplay(content="**Global Devmode:**"), Separator(spacing=discord.SeparatorSpacing.small), TextDisplay(content=f"Current State: **{state}**\nReason: `{dev_cfg['reason']}`"))

    def _build_dmclear_container(self) -> Container:
        return Container(TextDisplay(content="**DM History Purge:**"), Separator(spacing=discord.SeparatorSpacing.small), TextDisplay(content="Click the button to delete the bot's messages from your DMs."))

    def _build_getstorage_container(self) -> Container:
        return Container(TextDisplay(content="**Export Storage:**"), Separator(spacing=discord.SeparatorSpacing.small), TextDisplay(content="Click the button to receive a ZIP of all Storage/ files in your DMs."))

    def _build_sync_container(self) -> Container:
        return Container(TextDisplay(content="**Command Sync:**"), Separator(spacing=discord.SeparatorSpacing.small), TextDisplay(content="Click the button to sync the application commands globally."))

    def _build_restart_container(self) -> Container:
        return Container(TextDisplay(content="**Restart Bot:**"), Separator(spacing=discord.SeparatorSpacing.small), TextDisplay(content="Click the button to backup Storage/ to the cloud channel and dynamically reboot the python process."))


class PanelCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="panel", aliases=["hub", "dashboard", "errors", "servers", "owner", "devmode", "shards", "livelogs", "autobackup", "getstorage", "sync", "status", "restart", "reload", "getinvite", "console"], hidden=True)
    @commands.is_owner()
    async def panel_cmd(self, ctx: commands.Context):
        record_command("panel", str(ctx.author))
        if ctx.guild is not None:
            try:
                await ctx.message.delete()
            except Exception:
                pass
        view = MasterPanelLayoutView(self.bot, ctx.author)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    await bot.add_cog(PanelCommand(bot))
