import discord
from discord.ext import commands
from Components.Commands._utils import make_embed

@commands.hybrid_group(name="joinrole", description="Automatic join roles system (`add`, `remove`, `list`).")
@commands.has_permissions(manage_roles=True)
async def joinrole_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        await ctx.send(embed=make_embed("Please use `/joinrole add`, `/joinrole remove`, or `/joinrole list`."), ephemeral=True)

async def setup(bot: commands.Bot):
    if "joinrole" not in bot.all_commands:
        bot.add_command(joinrole_group)
