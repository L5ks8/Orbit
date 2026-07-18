utf-8import discord
from discord.ext import commands

@commands.hybrid_group(name="role", description="Server role management commands.")
@commands.has_permissions(manage_roles=True)
async def role_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        await ctx.send("Please use `/role add`, `/role remove`, `/role info`, `/role all`, `/role rall`, or `/role settings`.", ephemeral=True)

async def setup(bot: commands.Bot):
    if "role" not in bot.all_commands:
        bot.add_command(role_group)
