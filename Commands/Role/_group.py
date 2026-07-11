import discord
from discord.ext import commands

@commands.hybrid_group(name="role", description="Server role management commands (`add`, `remove`, `info`, `all`, `rall`, `settings`).")
async def role_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        await ctx.send("Please specify a subcommand: `add`, `remove`, `info`, `all`, `rall`, or `settings`.", ephemeral=True)

@commands.hybrid_group(name="all", description="View all server items (`roles`).")
async def all_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        await ctx.send("Please specify what to list, e.g. `-all roles`.", ephemeral=True)

async def setup(bot: commands.Bot):
    if "role" not in bot.all_commands:
        bot.add_command(role_group)
    if "all" not in bot.all_commands:
        bot.add_command(all_group)
