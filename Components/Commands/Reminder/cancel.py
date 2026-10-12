import discord
from Components.Commands._utils import make_embed, make_v2_card, ORBIT_COLOR
from Components.emojis import Emojis
from discord.ext import commands
from Components.Commands.Reminder.reminder import reminder_group
from Components.Commands.Reminder.remind import remind_group
from Components.Commands.Reminder._storage import remove_reminder

async def _do_remind_cancel(ctx: commands.Context, rem_id: str):
    await ctx.defer(ephemeral=True)
    removed = remove_reminder(rem_id, ctx.author.id)
    if not removed:
        return await ctx.send(embed=make_embed(f"No active reminder found with ID `{rem_id}` matching your account.", discord.Color.red()), ephemeral=True)
    desc = f"Successfully cancelled and deleted reminder ID `{rem_id}`."
    card = make_v2_card(f"# {Emojis.BACKSPACE} Reminder Cancelled\n\n{desc}", color=ORBIT_COLOR)
    if card:
        return await ctx.send(view=card, ephemeral=True)
    await ctx.send(embed=make_embed(desc, ORBIT_COLOR, title=f"{Emojis.BACKSPACE} Reminder Cancelled"), ephemeral=True)

@remind_group.command(name="cancel", description="Cancel a pending reminder by ID.")
async def remind_cancel_cmd(ctx: commands.Context, reminder_id: str):
    await _do_remind_cancel(ctx, reminder_id)

async def setup(bot: commands.Bot):
    from Components.Commands.Reminder.remind import remind_group
    if "remind" not in bot.all_commands:
        bot.add_command(remind_group)
