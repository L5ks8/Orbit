import discord
from discord.ext import commands

@commands.hybrid_group(name="warn", fallback="add", description="Issues a formal warning or manages server warnings (`-warn @user [reason]`).")
@commands.has_permissions(moderate_members=True)
async def warn_group(ctx: commands.Context, user: discord.Member = None, *, reason: str = "No reason provided."):
    if ctx.invoked_subcommand is None:
        if user is None:
            return await ctx.send("Please specify a member to warn: `-warn @user [reason]` or `/warn <user> [reason]`", ephemeral=True)
        from Commands.Warn.warn import _do_warn_add
        await _do_warn_add(ctx, user, reason)

@warn_group.error
async def warn_group_error(ctx: commands.Context, error):
    if isinstance(error, commands.MissingPermissions):
        await ctx.send("You need Moderate Members permission to issue warnings.", ephemeral=True)
    elif isinstance(error, commands.BadArgument):
        await ctx.send("Could not find that member. Usage: `-warn @user [reason]`", ephemeral=True)
    else:
        pass

async def setup(bot: commands.Bot):
    if "warn" not in bot.all_commands:
        bot.add_command(warn_group)
