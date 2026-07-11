from discord.ext import commands

@commands.hybrid_group(name="remind", description="Manage personal and server reminders (`set`, `list`, `cancel`).")
async def remind_group(ctx: commands.Context, duration: str = None, *, text: str = None):
    if ctx.invoked_subcommand is None:
        if duration and text:
            from Commands.Reminder.remind import _do_remind_set
            return await _do_remind_set(ctx, duration, text)
        await ctx.send("Usage: `/remind set <time> <text>` (e.g. `/remind set 2h Close applications`)", ephemeral=True)

async def setup(bot: commands.Bot):
    if "remind" not in bot.all_commands:
        bot.add_command(remind_group)
