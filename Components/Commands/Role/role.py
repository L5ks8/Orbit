import discord
from discord.ext import commands

from Components.Commands._utils import make_embed, make_v2_card, ORBIT_COLOR
from Components.emojis import Emojis

@commands.hybrid_group(name="role", description="Server role management commands.")
@commands.has_permissions(manage_roles=True)
async def role_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        await ctx.send(embed=make_embed("Please use `/role add`, `/role remove`, `/role info`, `/role all`, `/role rall`, `/role create`, or `/role settings`."), ephemeral=True)

async def setup(bot: commands.Bot):
    if "role" not in bot.all_commands:
        bot.add_command(role_group)