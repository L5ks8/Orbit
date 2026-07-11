import re
import time
import discord
from discord.ext import commands, tasks
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Reminder._group import remind_group
from Commands.Reminder._storage import add_reminder, remove_reminder, get_user_reminders, load_reminders

def parse_duration(time_str: str) -> int | None:
    clean_str = time_str.lower().strip()
    pattern = re.compile(r"(\d+)\s*([smhd])")
    matches = pattern.findall(clean_str)
    if not matches:
        if clean_str.isdigit():
            return int(clean_str) * 60
        return None
    
    total_seconds = 0
    for value, unit in matches:
        val = int(value)
        if unit == "s":
            total_seconds += val
        elif unit == "m":
            total_seconds += val * 60
        elif unit == "h":
            total_seconds += val * 3600
        elif unit == "d":
            total_seconds += val * 86400
    return total_seconds if total_seconds > 0 else None


class ReminderSuccessLayout(LayoutView):
    def __init__(self, entry: dict):
        super().__init__()
        self.container = Container(
            TextDisplay(content="### Orbit Reminder Scheduled"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(
                content=(
                    f"**Reminder ID:** `{entry['id']}`\n"
                    f"**Target Time:** <t:{entry['expires_at']}:F> (<t:{entry['expires_at']}:R>)\n"
                    f"**Reminder Text:** {entry['text']}\n\n"
                    f"*I will notify you right here or via DMs when the timer completes.*"
                )
            )
        )
        self.add_item(self.container)


class ReminderListLayout(LayoutView):
    def __init__(self, reminders: list[dict]):
        super().__init__()
        if not reminders:
            content_str = "*You currently have no active scheduled reminders.*"
        else:
            lines = []
            for idx, r in enumerate(reminders[:15], start=1):
                lines.append(f"**{idx}. ID:** `{r['id']}` | **Due:** <t:{r['expires_at']}:R>\n> {r['text']}")
            content_str = "\n\n".join(lines)

        self.container = Container(
            TextDisplay(content="### Orbit Active Reminders"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=content_str)
        )
        self.add_item(self.container)


class ReminderAlertLayout(LayoutView):
    def __init__(self, entry: dict):
        super().__init__()
        self.container = Container(
            TextDisplay(content="### Orbit Reminder Alert"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(
                content=(
                    f"**Scheduled By:** <@{entry['user_id']}>\n"
                    f"**Created At:** <t:{entry['created_at']}:F> (<t:{entry['created_at']}:R>)\n\n"
                    f"**Reminder Note:**\n> {entry['text']}"
                )
            )
        )
        self.add_item(self.container)


async def _do_remind_set(ctx: commands.Context, duration_str: str, text: str):
    await ctx.defer()
    seconds = parse_duration(duration_str)
    if not seconds or seconds <= 0:
        return await ctx.send("Invalid time duration specified (`e.g. 30m, 2h, 1d, 1h30m`).", ephemeral=True)
    if seconds > 31536000:
        return await ctx.send("Reminders cannot be scheduled more than `365 days` into the future.", ephemeral=True)
    if not text or not text.strip():
        return await ctx.send("Please specify the reminder message text.", ephemeral=True)

    guild_id = ctx.guild.id if ctx.guild else None
    entry = add_reminder(ctx.author.id, ctx.channel.id, guild_id, text, seconds)
    view = ReminderSuccessLayout(entry)
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())


async def _do_remind_list(ctx: commands.Context):
    await ctx.defer(ephemeral=True)
    user_rems = get_user_reminders(ctx.author.id)
    view = ReminderListLayout(user_rems)
    await ctx.send(view=view, ephemeral=True, allowed_mentions=discord.AllowedMentions.none())


async def _do_remind_cancel(ctx: commands.Context, rem_id: str):
    await ctx.defer(ephemeral=True)
    removed = remove_reminder(rem_id, ctx.author.id)
    if not removed:
        return await ctx.send(f"No active reminder found with ID `{rem_id}` matching your account.", ephemeral=True)
    await ctx.send(f"Successfully cancelled and deleted reminder ID `{rem_id}`.", ephemeral=True)


class ReminderCommand(commands.Cog):
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


@remind_group.command(name="set", description="Schedule a new reminder (`/remind set 2h Close applications`).")
async def remind_set_cmd(ctx: commands.Context, duration: str, *, text: str):
    await _do_remind_set(ctx, duration, text)

@remind_group.command(name="list", description="View all your active scheduled reminders (`/remind list`).")
async def remind_list_cmd(ctx: commands.Context):
    await _do_remind_list(ctx)

@remind_group.command(name="cancel", description="Cancel a pending reminder by ID (`/remind cancel abc123`).")
async def remind_cancel_cmd(ctx: commands.Context, reminder_id: str):
    await _do_remind_cancel(ctx, reminder_id)


class ReminderPrefixFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="reminder", hidden=True)
    async def reminder_prefix(self, ctx: commands.Context, duration: str = None, *, text: str = None):
        if not duration:
            return await ctx.send("Usage: `-reminder <time> <text>` (`-reminder 2h Close applications`)", allowed_mentions=discord.AllowedMentions.none())
        if duration.lower() == "list":
            return await _do_remind_list(ctx)
        if duration.lower() == "cancel" and text:
            return await _do_remind_cancel(ctx, text.strip())
        if not text:
            return await ctx.send("Usage: `-reminder <time> <text>` (`-reminder 2h Close applications`)", allowed_mentions=discord.AllowedMentions.none())
        await _do_remind_set(ctx, duration, text)


async def setup(bot: commands.Bot):
    await bot.add_cog(ReminderCommand(bot))
    await bot.add_cog(ReminderPrefixFallback(bot))
