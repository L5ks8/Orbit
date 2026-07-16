import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button

class ReloadSuccessLayout(LayoutView):
    def __init__(self, target_name: str, success_count: int, backup_status: str, error_msg: str = ""):
        super().__init__()
        status_text = (
            f"**Pre-Reload Cloud Backup:** {backup_status}\n"
            f"**Reload Status:** Successfully reloaded `{success_count}` extension(s)."
            if not error_msg else
            f"**Pre-Reload Cloud Backup:** {backup_status}\n"
            f"**Reload Status:** Failed (`{error_msg}`)"
        )
        self.container = Container(
            TextDisplay(content=f"### Orbit Extension Reloader\n**Target:** `{target_name}`"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=status_text)
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


class ReloadCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    async def _trigger_pre_reload_backup(self) -> str:
        try:
                        import datetime

            channel_id = _get_backup_channel_id()
            if not channel_id:
                return "SKIPPED (`No backup channel configured`)"

            channel = self.bot.get_channel(channel_id)
            if not channel:
                try:
                    channel = await self.bot.fetch_channel(channel_id)
                except Exception:
                    return f"FAILED (`Could not access channel {channel_id}`)"

            if channel:
                buffer, size_kb = _create_zip_buffer()
                if not buffer or size_kb <= 0:
                    return "SKIPPED (`Storage directory empty`)"

                timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
                file_name = f"orbit_cloud_backup_{timestamp}.zip"
                buffer.seek(0)
                file_obj = discord.File(buffer, filename=file_name)

                content_text = (
                    f"**[ORBIT_CLOUD_BACKUP_V1] Persistent Storage Snapshot**\n"
                    f"**Archive Size:** `{size_kb:.2f} KB`\n"
                    f"**Trigger Mode:** `Pre-Reload Safety Backup (-reload)`\n"
                    f"**Timestamp:** `{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}`\n\n"
                    f"*This ZIP contains all active JSON databases (`Storage/*.json`) secured immediately prior to module reload.*"
                )

                await channel.send(content=content_text, file=file_obj, allowed_mentions=discord.AllowedMentions.none())
                return f"SUCCESS (`{size_kb:.2f} KB uploaded to {getattr(channel, 'mention', channel_id)}`)"
        except Exception as e:
            return f"FAILED (`{e}`)"
        return "SKIPPED (`Unknown state`)"

    @commands.command(name="reload", description="Owner Only: Pre-backs up storage to cloud and hot-reloads modules (`-reload` defaults to all).")
    @commands.is_owner()
    async def reload_cmd(self, ctx: commands.Context, *, module: str = "all"):
        async with ctx.typing():
            backup_status = await self._trigger_pre_reload_backup()

            module = module.strip()
            if module.lower() == "all":
                reloaded = 0
                errors = []
                for ext_name in list(self.bot.extensions.keys()):
                    try:
                        await self.bot.reload_extension(ext_name)
                        reloaded += 1
                    except Exception as e:
                        errors.append(f"{ext_name}: {e}")

                error_text = f"Errors in {len(errors)} module(s)" if errors else ""
                view = ReloadSuccessLayout("All Extensions", reloaded, backup_status, error_text)
                await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())
                if errors:
                    for err_chunk in errors[:5]:
                        await ctx.send(f"`{err_chunk}`", allowed_mentions=discord.AllowedMentions.none())
                return

            target_ext = module if module.startswith("Commands.") else f"Commands.{module}"
            try:
                await self.bot.reload_extension(target_ext)
                view = ReloadSuccessLayout(target_ext, 1, backup_status)
                await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())
            except commands.ExtensionNotLoaded:
                try:
                    await self.bot.load_extension(target_ext)
                    view = ReloadSuccessLayout(f"{target_ext} (Loaded New)", 1, backup_status)
                    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())
                except Exception as e2:
                    view = ReloadSuccessLayout(target_ext, 0, backup_status, str(e2))
                    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())
            except Exception as e:
                view = ReloadSuccessLayout(target_ext, 0, backup_status, str(e))
                await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

    @reload_cmd.error
    async def reload_error(self, ctx: commands.Context, error):
        if not isinstance(error, commands.NotOwner):
            await ctx.send(f"Reload error: {error}", allowed_mentions=discord.AllowedMentions.none())


async def setup(bot: commands.Bot):
    await bot.add_cog(ReloadCommand(bot))
