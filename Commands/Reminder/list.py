import discord
from discord.ext import commands
from Commands.Reminder.remind import remind_group
from Commands.Reminder._storage import get_user_reminders

async def _do_remind_list(ctx: commands.Context):
    await ctx.defer(ephemeral=True)
    user_rems = get_user_reminders(ctx.author.id)

    from Embeds import get_command_embed
    kwargs = get_command_embed(ctx.guild.id if ctx.guild else None, "reminder", msg_type="list", reminders=user_rems)
    await ctx.send(**kwargs, ephemeral=True, allowed_mentions=discord.AllowedMentions.none())

@remind_group.command(name="list", description="View your active scheduled reminders.")
async def remind_list_cmd(ctx: commands.Context):
    await _do_remind_list(ctx)

class ReminderListCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="rm_list", aliases=["remindlist"], hidden=True)
    async def rm_list_prefix(self, ctx: commands.Context):
        await _do_remind_list(ctx)

async def setup(bot: commands.Bot):
    from Commands.Reminder.remind import remind_group
    if "remind" not in bot.all_commands:
        bot.add_command(remind_group)
    await bot.add_cog(ReminderListCog(bot))

