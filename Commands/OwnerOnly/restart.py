import os
import asyncio
import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button

class RestartNoticeLayout(LayoutView):
    def __init__(self, backup_status: str):
        super().__init__()
        content_str = (
            f"**Pre-Restart Cloud Backup:** {backup_status}\n"
            f"**Action:** Closing Discord Gateway session and terminating process...\n\n"
            f"*Render will automatically boot a fresh Orbit instance within seconds, downloading this latest safety snapshot immediately on boot.*"
        )
        self.container = Container(
            TextDisplay(content="### Orbit System Reboot Initiated"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=content_str)
        )
        self.add_item(self.container)


class RestartCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    async def _trigger_pre_restart_backup(self) -> str:
        try:
            from Commands.OwnerOnly.autobackup import _get_backup_channel_id, _create_zip_buffer
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
                    f"**Trigger Mode:** `Pre-Restart Safety Backup (-restart)`\n"
                    f"**Timestamp:** `{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}`\n\n"
                    f"*This ZIP contains all active JSON databases (`Storage/*.json`) secured immediately prior to process termination and reboot.*"
                )

                await channel.send(content=content_text, file=file_obj, allowed_mentions=discord.AllowedMentions.none())
                return f"SUCCESS (`{size_kb:.2f} KB uploaded to {getattr(channel, 'mention', channel_id)}`)"
        except Exception as e:
            return f"FAILED (`{e}`)"
        return "SKIPPED (`Unknown state`)"

    @commands.command(name="restart", aliases=["reboot", "shutdown"], description="Owner Only: Backs up storage to cloud and reboots the bot process.")
    @commands.is_owner()
    async def restart_cmd(self, ctx: commands.Context):
        async with ctx.typing():
            backup_status = await self._trigger_pre_restart_backup()
            view = RestartNoticeLayout(backup_status)
            await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

        try:
            await self.bot.close()
        except Exception:
            pass
        finally:
            await asyncio.sleep(1)
            os._exit(0)

    @restart_cmd.error
    async def restart_error(self, ctx: commands.Context, error):
        if not isinstance(error, commands.NotOwner):
            await ctx.send(f"Restart error: {error}", allowed_mentions=discord.AllowedMentions.none())


async def setup(bot: commands.Bot):
    await bot.add_cog(RestartCommand(bot))
