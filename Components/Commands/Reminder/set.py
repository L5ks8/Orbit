import discord
from discord.ext import commands
from Components.Commands.Reminder.remind import remind_group
from Components.Commands.Reminder._storage import add_reminder
from Components.Commands.Reminder._views import parse_duration

async def _do_remind_set(ctx: commands.Context, duration_str: str, text: str):
    await ctx.defer()
    seconds = parse_duration(duration_str)
    if not seconds or seconds <= 0:
        return await ctx.send(embed=make_embed("Invalid duration specified (`e.g. 30m, 2h, 1d`).", discord.Color.red()), ephemeral=True)
    if seconds > 31536000:
        return await ctx.send(embed=make_embed("Reminders cannot be scheduled more than `365 days` into the future.", discord.Color.red()), ephemeral=True)
    if not text or not text.strip():
        return await ctx.send(embed=make_embed("Please specify the reminder message text.", discord.Color.red()), ephemeral=True)

    guild_id = ctx.guild.id if ctx.guild else None
    entry = add_reminder(ctx.author.id, ctx.channel.id, guild_id, text, seconds)
    embed = discord.Embed(
        title="Orbit Reminder Scheduled",
        description=(
            f"**Reminder ID:** `{entry.get('id')}`\n"
            f"**Target Time:** <t:{entry.get('expires_at', 0)}:F> (<t:{entry.get('expires_at', 0)}:R>)\n"
            f"**Reminder Text:** {entry.get('text')}\n\n"
            f"*I will notify you right here or via DMs when the timer completes.*"
        ),
        color=discord.Color.green()
    )
    await ctx.send(embed=embed, ephemeral=True, allowed_mentions=discord.AllowedMentions.none())

@remind_group.command(name="set", description="Schedule a new reminder.")
async def remind_set_cmd(ctx: commands.Context, duration: str, *, text: str):
    await _do_remind_set(ctx, duration, text)

class ReminderSetCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="rm_set", aliases=["remindset"], hidden=True)
    async def rm_set_prefix(self, ctx: commands.Context, duration: str = None, *, text: str = None):
        if not duration or not text:
            return await ctx.send(embed=make_embed("Usage: `-remind set <time> <text>`", discord.Color.red()), ephemeral=True)
        await _do_remind_set(ctx, duration, text)

async def setup(bot: commands.Bot):
    from Components.Commands.Reminder.remind import remind_group
    from Components.Commands._utils import make_embed
    if "remind" not in bot.all_commands:
        bot.add_command(remind_group)
    await bot.add_cog(ReminderSetCog(bot))
