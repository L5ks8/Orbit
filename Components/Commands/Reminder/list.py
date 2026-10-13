import discord
from discord.ext import commands
from Components.Commands.Reminder.reminder import reminder_group
from Components.Commands.Reminder.remind import remind_group
from Components.Commands.Reminder._storage import get_user_reminders
from Components.Commands._utils import ORBIT_COLOR, make_v2_card
from Components.emojis import Emojis

async def _do_remind_list(ctx: commands.Context):
    await ctx.defer(ephemeral=True)
    user_rems = get_user_reminders(ctx.author.id)

    if not user_rems:
        content_str = "*You currently have no active scheduled reminders.*"
    else:
        lines = []
        for idx, r in enumerate(user_rems[:15], start=1):
            lines.append(f"**{idx}. ID:** `{r.get('id')}` | **Due:** <t:{r.get('expires_at', 0)}:R>\n> {r.get('text')}")
        content_str = "\n\n".join(lines)
        
    card = make_v2_card(f"# Orbit Active Reminders\n\n{content_str}", color=ORBIT_COLOR)
    if card:
        return await ctx.send(view=card, ephemeral=True, allowed_mentions=discord.AllowedMentions.none())

    embed = discord.Embed(
        title="Orbit Active Reminders",
        description=content_str,
        color=ORBIT_COLOR
    )
    await ctx.send(embed=embed, ephemeral=True, allowed_mentions=discord.AllowedMentions.none())

@remind_group.command(name="list", description="View your active scheduled reminders.")
async def remind_list_cmd(ctx: commands.Context):
    await _do_remind_list(ctx)

async def setup(bot: commands.Bot):
    from Components.Commands.Reminder.remind import remind_group
    if "remind" not in bot.all_commands:
        bot.add_command(remind_group)

