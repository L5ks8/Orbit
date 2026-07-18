utf-8import discord
from discord.ext import commands
from Commands.Reminder.remind import remind_group
from Commands.Reminder._storage import add_reminder
from Commands.Reminder._views import parse_duration, ReminderSuccessLayout

async def _do_remind_set(ctx: commands.Context, duration_str: str, text: str):
    await ctx.defer()
    seconds = parse_duration(duration_str)
    if not seconds or seconds <= 0:
        return await ctx.send("Invalid duration specified (`e.g. 30m, 2h, 1d`).", ephemeral=True)
    if seconds > 31536000:
        return await ctx.send("Reminders cannot be scheduled more than `365 days` into the future.", ephemeral=True)
    if not text or not text.strip():
        return await ctx.send("Please specify the reminder message text.", ephemeral=True)

    guild_id = ctx.guild.id if ctx.guild else None
    entry = add_reminder(ctx.author.id, ctx.channel.id, guild_id, text, seconds)
    view = ReminderSuccessLayout(entry)
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

@remind_group.command(name="set", description="Schedule a new reminder.")
async def remind_set_cmd(ctx: commands.Context, duration: str, *, text: str):
    await _do_remind_set(ctx, duration, text)

class ReminderSetCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="rm_set", aliases=["remindset"], hidden=True)
    async def rm_set_prefix(self, ctx: commands.Context, duration: str = None, *, text: str = None):
        if not duration or not text:
            return await ctx.send("Usage: `-remind set <time> <text>`", ephemeral=True)
        await _do_remind_set(ctx, duration, text)

async def setup(bot: commands.Bot):
    from Commands.Reminder.remind import remind_group
    if "remind" not in bot.all_commands:
        bot.add_command(remind_group)
    await bot.add_cog(ReminderSetCog(bot))
