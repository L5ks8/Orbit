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
        from Commands.OwnerOnly._monitor import record_command
from Commands._utils import make_embed
        record_command("getstorage", str(ctx.author))

        msg = await ctx.send(embed=make_embed("Zipping storage directory... This might take a moment."), allowed_mentions=discord.AllowedMentions.none())
        
        buffer, size_kb = await self._create_backup_zip_memory()
        
        if not buffer:
            return await msg.edit(content="Storage directory does not exist or is empty.")
            
        timestamp_str = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"orbit_storage_backup_{timestamp_str}.zip"
        file = discord.File(buffer, filename=filename)

        embed = discord.Embed(
            title="Orbit Storage Archive Ready",
            description=f"**File:** `{filename}` (`{size_kb:.2f} KB`)\n**Access:** Bot Owner DM Exclusive\n\n*Extract this archive into your local `Storage/` folder before uploading or restoring!*",
            color=0x2B2D31
        )
        
        try:
            await ctx.author.send(embed=embed, file=file)
            await msg.edit(content="The storage archive has been successfully sent to your DMs!")
        except discord.Forbidden:
            await msg.edit(content="Could not send DM. Please ensure your DMs are open and try again.")
        except Exception as e:
            await msg.edit(content=f"Error sending storage archive: {e}")

    @getstorage_cmd.error
    async def getstorage_error(self, ctx: commands.Context, error):
        pass

async def setup(bot: commands.Bot):
    await bot.add_cog(GetStorageCommand(bot))