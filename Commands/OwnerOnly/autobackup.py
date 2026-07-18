utf-8import os
import io
import json
import zipfile
import pathlib
import datetime
import discord
from discord.ext import commands, tasks
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button

BACKUP_CONFIG_FILE = pathlib.Path("Storage") / "backup_config.json"
STORAGE_DIR = pathlib.Path("Storage")
DEFAULT_BACKUP_CHANNEL_ID = 1525603336840024216

def _get_backup_channel_id() -> int | None:
    env_val = os.environ.get("BACKUP_CHANNEL_ID")
    if env_val and str(env_val).isdigit():
        return int(env_val)
    if BACKUP_CONFIG_FILE.exists():
        try:
            with open(BACKUP_CONFIG_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, dict) and "channel_id" in data:
                    return int(data["channel_id"])
        except Exception:
            pass
    return DEFAULT_BACKUP_CHANNEL_ID

def _set_backup_channel_id(channel_id: int):
    try:
        if not BACKUP_CONFIG_FILE.parent.exists():
            BACKUP_CONFIG_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(BACKUP_CONFIG_FILE, "w", encoding="utf-8") as f:
            json.dump({"channel_id": channel_id, "updated": str(datetime.datetime.now())}, f, indent=4)
    except Exception:
        pass

def _create_zip_buffer() -> tuple[io.BytesIO | None, float]:

    if not STORAGE_DIR.exists():
        return None, 0.0

    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(STORAGE_DIR):
            for file in files:
                if file.endswith(".zip"):
                    continue
                file_path = pathlib.Path(root) / file
                try:
                    arcname = file_path.relative_to(STORAGE_DIR.parent)
                except Exception:
                    arcname = file_path
                try:
                    zf.write(file_path, arcname)
                except Exception:
                    pass

    size_kb = buffer.tell() / 1024.0
    buffer.seek(0)
    return buffer, size_kb

def _get_latest_storage_mtime() -> float:
    latest = 0.0
    if not STORAGE_DIR.exists():
        return latest
    for root, dirs, files in os.walk(STORAGE_DIR):
        for file in files:
            if file.endswith(".zip"):
                continue
            file_path = pathlib.Path(root) / file
            try:
                mtime = file_path.stat().st_mtime
                if mtime > latest:
                    latest = mtime
            except Exception:
                pass
    return latest

class BackupNoticeLayout(LayoutView):
    def __init__(self, title: str, content: str):
        super().__init__()
        self.container = Container(
            TextDisplay(content=f"### {title}"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=content)
        )
        self.add_item(self.container)

        btn_close = Button(label="Close Notice", style=discord.ButtonStyle.secondary)

        async def _close_cb(interaction: discord.Interaction):
            try:
                await interaction.message.delete()
            except Exception:
                pass

        btn_close.callback = _close_cb
        self.add_item(ActionRow(btn_close))

class AutoBackupCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.last_backed_up_mtime = _get_latest_storage_mtime()
        self.smart_backup_watchdog.start()

    def cog_unload(self):
        self.smart_backup_watchdog.cancel()

    @tasks.loop(minutes=5)
    async def smart_backup_watchdog(self):
        await self.bot.wait_until_ready()
        channel_id = _get_backup_channel_id()
        if not channel_id:
            return

        current_mtime = _get_latest_storage_mtime()
        if current_mtime <= self.last_backed_up_mtime:
            return

        channel = self.bot.get_channel(channel_id)
        if not channel:
            try:
                channel = await self.bot.fetch_channel(channel_id)
            except Exception:
                return

        if channel:
            success, info = await self._run_upload(channel, is_automated=True)
            if success:
                self.last_backed_up_mtime = current_mtime
                print(f"SMART STORAGE WATCHDOG: Uploaded new change snapshot to channel {channel_id}.")

    @commands.Cog.listener()
    async def on_ready(self):
        channel_id = _get_backup_channel_id()
        if not channel_id:
            return

        channel = self.bot.get_channel(channel_id)
        if not channel:
            try:
                channel = await self.bot.fetch_channel(channel_id)
            except Exception:
                return

        if channel:
            success, msg = await self._run_restore(channel)
            if success:
                self.last_backed_up_mtime = _get_latest_storage_mtime()
                print(f"AUTOMATIC CLOUD RECOVERY: {msg}")
                try:
                    from Commands.OwnerOnly.status import _load_status, _build_activity, _parse_discord_status
                    data = _load_status()
                    if data and isinstance(data, dict):
                        act_type = data.get("type", "clear")
                        text = data.get("text", "")
                        status_str = data.get("status", "online")
                        act = _build_activity(act_type, text)
                        discord_status = _parse_discord_status(status_str)
                        await self.bot.change_presence(activity=act, status=discord_status)
                        print(f"Restored Live Presence from Cloud: {status_str.upper()} -> {act_type.upper()} {text}")
                except Exception as e:
                    print(f"Failed to reapply presence after cloud restore: {e}")
            else:
                print(f"AUTOMATIC CLOUD RECOVERY FAILED OR SKIPPED: {msg}")

    async def _run_upload(self, channel: discord.abc.Messageable, is_automated: bool = False) -> tuple[bool, str]:
        buffer, size_kb = _create_zip_buffer()
        if not buffer or size_kb <= 0:
            return False, "Storage directory is empty or cannot be read."

        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        file_name = f"orbit_cloud_backup_{timestamp}.zip"
        buffer.seek(0)
        file_obj = discord.File(buffer, filename=file_name)

        mode_str = "Smart 5-Minute Change Watchdog" if is_automated else "Manual Developer Command"
        content_text = (
            f"**[ORBIT_CLOUD_BACKUP_V1] Persistent Storage Snapshot**\n"
            f"**Archive Size:** `{size_kb:.2f} KB`\n"
            f"**Trigger Mode:** `{mode_str}`\n"
            f"**Timestamp:** `{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}`\n\n"
            f"*This ZIP contains all active JSON databases (`Storage/*.json`). Orbit will automatically download and extract this archive on Render if a disk reset occurs!*"
        )

        try:
            await channel.send(content=content_text, file=file_obj, allowed_mentions=discord.AllowedMentions.none())
            return True, f"Uploaded `{file_name}` (`{size_kb:.2f} KB`) directly to <#{getattr(channel, 'id', 'DMs')}>."
        except Exception as e:
            return False, f"Failed to upload archive to Discord channel: {e}"

    async def _run_restore(self, channel: discord.abc.Messageable) -> tuple[bool, str]:
        try:
            target_msg = None
            async for msg in channel.history(limit=30):
                if "[ORBIT_CLOUD_BACKUP_V1]" in msg.content and msg.attachments:
                    for att in msg.attachments:
                        if att.filename.endswith(".zip"):
                            target_msg = att
                            break
                    if target_msg:
                        break

            if not target_msg:
                return False, "Could not find any recent `[ORBIT_CLOUD_BACKUP_V1]` ZIP archives in this channel."

            archive_bytes = await target_msg.read()
            buffer = io.BytesIO(archive_bytes)

            count = 0
            with zipfile.ZipFile(buffer, "r") as zf:
                for entry in zf.infolist():
                    if entry.is_dir() or entry.filename.endswith(".zip"):
                        continue
                    try:
                        target_path = pathlib.Path(entry.filename)
                        if not target_path.parent.exists():
                            target_path.parent.mkdir(parents=True, exist_ok=True)
                        with zf.open(entry, "r") as source, open(target_path, "wb") as dest:
                            dest.write(source.read())
                        count += 1
                    except Exception:
                        pass

            return True, f"Successfully restored `{count}` files from `{target_msg.filename}` into local `Storage/`."
        except Exception as e:
            return False, f"Restore exception: {e}"

    @commands.command(name="setbackupchannel", aliases=["setbackup", "backupchannel"], description="Owner Only: Sets the Discord channel where automatic storage backups are sent.")
    @commands.is_owner()
    async def setbackupchannel_cmd(self, ctx: commands.Context, channel: discord.TextChannel = None):
        if not channel:
            channel = ctx.channel
        _set_backup_channel_id(channel.id)

        msg = (
            f"**Designated Channel:** {channel.mention} (`{channel.id}`)\n\n"
            f"**CRITICAL NEXT STEP FOR RENDER:**\n"
            f"> To ensure Orbit can automatically find this channel after a complete Render server wipe, add this exact environment variable inside your Render Dashboard (`Environment -> Add Environment Variable`):\n"
            f"> **Key:** `BACKUP_CHANNEL_ID`\n"
            f"> **Value:** `{channel.id}`\n\n"
            f"*Orbit will now upload an automated ZIP backup to {channel.mention} every 12 hours.*"
        )
        view = BackupNoticeLayout("Orbit Cloud Backup Channel Configured", msg)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

    @commands.command(name="cloudbackup", aliases=["backupnow", "savecloud"], description="Owner Only: Triggers an immediate cloud backup upload right now.")
    @commands.is_owner()
    async def cloudbackup_cmd(self, ctx: commands.Context):
        channel_id = _get_backup_channel_id()
        if not channel_id:
            return await ctx.send("No backup channel configured! Please run `-setbackupchannel #channel` first.", allowed_mentions=discord.AllowedMentions.none())
        
        channel = self.bot.get_channel(channel_id)
        if not channel:
            try:
                channel = await self.bot.fetch_channel(channel_id)
            except Exception:
                return await ctx.send(f"Could not access configured backup channel (`{channel_id}`).", allowed_mentions=discord.AllowedMentions.none())

        success, info = await self._run_upload(channel, is_automated=False)
        if success:
            self.last_backed_up_mtime = _get_latest_storage_mtime()
        view = BackupNoticeLayout("Orbit Cloud Backup Status", f"**Status:** `{'SUCCESS' if success else 'FAILED'}`\n**Details:** {info}")
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

    @commands.command(name="cloudrestore", aliases=["restorenow", "loadcloud"], description="Owner Only: Triggers an immediate restore from the latest cloud backup.")
    @commands.is_owner()
    async def cloudrestore_cmd(self, ctx: commands.Context):
        channel_id = _get_backup_channel_id()
        if not channel_id:
            return await ctx.send("No backup channel configured! Please run `-setbackupchannel #channel` first.", allowed_mentions=discord.AllowedMentions.none())

        channel = self.bot.get_channel(channel_id)
        if not channel:
            try:
                channel = await self.bot.fetch_channel(channel_id)
            except Exception:
                return await ctx.send(f"Could not access configured backup channel (`{channel_id}`).", allowed_mentions=discord.AllowedMentions.none())

        success, info = await self._run_restore(channel)
        if success:
            self.last_backed_up_mtime = _get_latest_storage_mtime()
            try:
                from Commands.OwnerOnly.status import _load_status, _build_activity, _parse_discord_status
                data = _load_status()
                if data and isinstance(data, dict):
                    act_type = data.get("type", "clear")
                    text = data.get("text", "")
                    status_str = data.get("status", "online")
                    act = _build_activity(act_type, text)
                    discord_status = _parse_discord_status(status_str)
                    await self.bot.change_presence(activity=act, status=discord_status)
            except Exception:
                pass
        view = BackupNoticeLayout("Orbit Cloud Restore Status", f"**Status:** `{'SUCCESS' if success else 'FAILED'}`\n**Details:** {info}")
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

    @setbackupchannel_cmd.error
    @cloudbackup_cmd.error
    @cloudrestore_cmd.error
    async def backup_errors(self, ctx: commands.Context, error):
        if not isinstance(error, commands.NotOwner):
            await ctx.send(f"Backup command error: {error}", allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    await bot.add_cog(AutoBackupCommand(bot))
