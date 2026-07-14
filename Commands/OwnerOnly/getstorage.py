import os
import io
import zipfile
import pathlib
import datetime
import discord
from discord.ext import commands


class GetStorageCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="getstorage", hidden=True)
    @commands.is_owner()
    async def getstorage_cmd(self, ctx: commands.Context):
        storage_dir = pathlib.Path("Storage")
        if not storage_dir.exists():
            return await ctx.send("The `Storage/` directory does not exist.", allowed_mentions=discord.AllowedMentions.none())

        # Flush RAM cache before zipping
        try:
            from Commands.StorageEngine import flush_dirty_files_sync
            flush_dirty_files_sync()
        except Exception:
            pass

        buffer = io.BytesIO()
        count = 0
        with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
            for root, dirs, files in os.walk(storage_dir):
                for file in files:
                    if file.endswith(".zip"):
                        continue
                    file_path = pathlib.Path(root) / file
                    try:
                        arcname = file_path.relative_to(storage_dir.parent)
                    except Exception:
                        arcname = file_path
                    try:
                        zf.write(file_path, arcname)
                        count += 1
                    except Exception:
                        pass

        size_kb = buffer.tell() / 1024.0
        buffer.seek(0)

        if count == 0 or size_kb <= 0:
            return await ctx.send("The `Storage/` directory is empty (no files to archive).", allowed_mentions=discord.AllowedMentions.none())

        clean_name = f"orbit_storage_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.zip"

        # Always send to DMs
        try:
            dm = ctx.author.dm_channel or await ctx.author.create_dm()
            file_obj = discord.File(buffer, filename=clean_name)
            await dm.send(
                f"**Storage Archive:** `{clean_name}` (`{size_kb:.2f} KB`, `{count}` files)",
                file=file_obj,
                allowed_mentions=discord.AllowedMentions.none()
            )
        except Exception as e:
            return await ctx.send(f"Could not send DM: {e}", allowed_mentions=discord.AllowedMentions.none())

        # Clean up the command message if in a guild
        if ctx.guild:
            try:
                await ctx.message.delete()
            except Exception:
                pass
            try:
                await ctx.send(f"Archive sent to your DMs (`{size_kb:.2f} KB`, `{count}` files).", delete_after=8.0, allowed_mentions=discord.AllowedMentions.none())
            except Exception:
                pass

    @getstorage_cmd.error
    async def getstorage_error(self, ctx: commands.Context, error):
        if not isinstance(error, commands.NotOwner):
            await ctx.send(f"Storage error: {error}", allowed_mentions=discord.AllowedMentions.none())


async def setup(bot: commands.Bot):
    await bot.add_cog(GetStorageCommand(bot))
