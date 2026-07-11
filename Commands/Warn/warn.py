import discord
from discord.ext import commands
from Commands.Warn._group import warn_group, _do_warn_add


@warn_group.command(name="add", description="Issues a formal warning to a server member.")
@commands.has_permissions(moderate_members=True)
async def warn_add_cmd(ctx: commands.Context, user: discord.Member, *, reason: str = "No reason provided."):
    await _do_warn_add(ctx, user, reason)


@warn_add_cmd.error
async def warn_add_error(ctx: commands.Context, error):
    if isinstance(error, commands.MissingPermissions):
        await ctx.send("You need Moderate Members permission to issue warnings.", ephemeral=True)
    elif isinstance(error, commands.BadArgument):
        await ctx.send("Could not find that member. Usage: `/warn add @user [reason]`", ephemeral=True)


async def setup(bot: commands.Bot):
    pass
