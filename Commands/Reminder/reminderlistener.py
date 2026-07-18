import time
import discord
from discord.ext import commands, tasks
from Commands.Reminder._storage import remove_reminder, load_reminders
from Commands.Reminder._views import ReminderAlertLayout

class ReminderListener(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.reminder_loop.start()

    def cog_unload(self):
        self.reminder_loop.cancel()

    @tasks.loop(seconds=10.0)
    async def reminder_loop(self):
        now = int(time.time())
        all_rems = load_reminders()
        for r in all_rems:
            if now >= r.get("expires_at", 0):
                remove_reminder(r["id"])
                await self._deliver_alert(r)

    @reminder_loop.before_loop
    async def before_reminder_loop(self):
        await self.bot.wait_until_ready()

    async def _deliver_alert(self, entry: dict):
        view = ReminderAlertLayout(entry)
        mention_str = f"<@{entry['user_id']}>"
        
        delivered = False
        channel_id = entry.get("channel_id")
        if channel_id:
            channel = self.bot.get_channel(channel_id)
            if not channel:
                try:
                    channel = await self.bot.fetch_channel(channel_id)
                except Exception:
                    channel = None
            if channel and hasattr(channel, "send"):
                try:
                    await channel.send(mention_str, allowed_mentions=discord.AllowedMentions(users=True))
                    await channel.send(view=view, allowed_mentions=discord.AllowedMentions.none())
                    delivered = True
                except Exception:
                    delivered = False

        if not delivered:
            user = self.bot.get_user(entry["user_id"])
            if not user:
                try:
                    user = await self.bot.fetch_user(entry["user_id"])
                except Exception:
                    user = None
            if user:
                try:
                    await user.send(view=view, allowed_mentions=discord.AllowedMentions.none())
                except Exception:
                    pass

async def setup(bot: commands.Bot):
    await bot.add_cog(ReminderListener(bot))

