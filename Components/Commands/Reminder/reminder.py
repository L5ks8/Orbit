import discord
from discord.ext import commands
from Components.Commands._utils import make_embed

@commands.hybrid_group(name="reminder", aliases=["remind"], description="Manage your reminders.", invoke_without_command=True)
async def reminder_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        await ctx.send(embed=make_embed("Use `/reminder set`, `/reminder list`, or `/reminder cancel`.", discord.Color.blue()), ephemeral=True)

async def setup(bot: commands.Bot):
    if "reminder" not in bot.all_commands:
        bot.add_command(reminder_group)
