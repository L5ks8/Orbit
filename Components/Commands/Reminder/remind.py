import discord
from discord.ext import commands
from Components.Commands._utils import make_embed

@commands.hybrid_group(name="remind", aliases=["reminder"], description="Manage personal and server reminders.")
async def remind_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        await ctx.send(embed=make_embed("Please use `/remind set`, `/remind list`, or `/remind cancel`."), ephemeral=True)

async def setup(bot: commands.Bot):
    if "remind" not in bot.all_commands:
        bot.add_command(remind_group)
