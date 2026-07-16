import discord
from discord.ext import commands
from Commands.Reminder.remind import remind_group
from Database.storagehandler import remove_reminder

async def _do_remind_cancel(ctx: commands.Context, rem_id: str):
    await ctx.defer(ephemeral=True)
    removed = await remove_reminder(rem_id, ctx.author.id)
    if not removed:
        return await ctx.send(f"No active reminder found with ID `{rem_id}` matching your account.", ephemeral=True)
    await ctx.send(f"Successfully cancelled and deleted reminder ID `{rem_id}`.", ephemeral=True)

@remind_group.command(name="cancel", description="Cancel a pending reminder by ID.")
async def remind_cancel_cmd(ctx: commands.Context, reminder_id: str):
    await _do_remind_cancel(ctx, reminder_id)

class ReminderCancelCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="rm_cancel", aliases=["remindcancel"], hidden=True)
    async def rm_cancel_prefix(self, ctx: commands.Context, reminder_id: str = None):
        if not reminder_id:
            return await ctx.send("Usage: `-remind cancel <id>`", ephemeral=True)
        await _do_remind_cancel(ctx, reminder_id.strip())

async def setup(bot: commands.Bot):
    from Commands.Reminder.remind import remind_group
    if "remind" not in bot.all_commands:
        bot.add_command(remind_group)
    await bot.add_cog(ReminderCancelCog(bot))
