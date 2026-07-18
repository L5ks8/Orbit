utf-8import os
import io
import zipfile
import pathlib
import datetime
import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button

class GetStorageSuccessLayout(LayoutView):
    def __init__(self, size_kb: float, file_name: str):
        super().__init__()
        self.container = Container(
            TextDisplay(content="### Orbit Storage Archive Ready"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**File:** `{file_name}` (`{size_kb:.2f} KB`)\n**Access:** Bot Owner DM Exclusive\n\n*Extract this archive into your local `Storage/` folder before uploading or restoring!*")
        )
        self.add_item(self.container)

        btn_close = Button(label="Close Archive View", style=discord.ButtonStyle.secondary)

        async def _close_cb(interaction: discord.Interaction):
            try:
                await interaction.message.delete()
            except Exception:
                pass

        btn_close.callback = _close_cb
        self.add_item(ActionRow(btn_close))

class GetStorageCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    async def _create_backup_zip_memory(self) -> tuple[io.BytesIO | None, float]:
        storage_dir = pathlib.Path("Storage")
        if not storage_dir.exists():
            return None, 0.0

        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
            for root, dirs, files in os.walk(storage_dir):
                for file in files:
                    file_path = pathlib.Path(root) / file
                    try:
                        arcname = file_path.relative_to(storage_dir.parent)
                    except Exception:
                        arcname = file_path
                    try:
                        zf.write(file_path, arcname)
                    except Exception:
                        pass

        size_kb = buffer.tell() / 1024.0
        buffer.seek(0)
        return buffer, size_kb

    @commands.command(name="getstorage", hidden=True)
    @commands.is_owner()
    async def getstorage_cmd(self, ctx: commands.Context):
        buffer, size_kb = await self._create_backup_zip_memory()
        if buffer is None or size_kb <= 0:
            return await ctx.send("The `Storage/` directory does not exist or is currently empty.", allowed_mentions=discord.AllowedMentions.none())

        clean_name = f"orbit_storage_backup_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.zip"
        view = GetStorageSuccessLayout(size_kb, clean_name)

        if not ctx.guild:
            try:
                buffer.seek(0)
                file_obj = discord.File(buffer, filename=clean_name)
                await ctx.send("Here is your Orbit storage backup archive ready for download:", file=file_obj, allowed_mentions=discord.AllowedMentions.none())
                await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())
            except Exception as e:
                await ctx.send(f"Storage Backup Error: {e}", allowed_mentions=discord.AllowedMentions.none())
        else:
            dm_sent = False
            try:
                target_channel = ctx.author.dm_channel
                if target_channel is None:
                    target_channel = await ctx.author.create_dm()
                buffer.seek(0)
                file_obj = discord.File(buffer, filename=clean_name)
                await target_channel.send("Here is your Orbit storage backup archive ready for download:", file=file_obj, allowed_mentions=discord.AllowedMentions.none())
                await target_channel.send(view=view, allowed_mentions=discord.AllowedMentions.none())
                dm_sent = True
            except Exception as e:
                print(f"STORAGE DM ERROR: {e}")

            if dm_sent:
                try:
                    await ctx.send(f"Archive dispatched! I have sent `{clean_name}` (`{size_kb:.2f} KB`) directly to your DMs.", delete_after=10.0, allowed_mentions=discord.AllowedMentions.none())
                    await ctx.message.delete()
                except Exception:
                    pass
            else:
                try:
                    await ctx.send(f"{ctx.author.mention} I could not deliver the storage archive to your DMs because your Direct Messages are disabled! Please enable DMs from server members and try `-getstorage` again.", allowed_mentions=discord.AllowedMentions.none())
                except Exception as e:
                    print(f"Failed to send DM closed error notice: {e}")

    @getstorage_cmd.error
    async def getstorage_error(self, ctx: commands.Context, error):
        if not isinstance(error, commands.NotOwner):
            await ctx.send(f"Storage Backup Error: {error}", allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    await bot.add_cog(GetStorageCommand(bot))
