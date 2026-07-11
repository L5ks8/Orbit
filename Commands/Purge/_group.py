import discord
from discord.ext import commands

@commands.hybrid_group(name="purge", aliases=["clear", "clean"], description="Channel message cleanup & bulk deletion (`amount`, `all`).")
@commands.has_permissions(manage_messages=True)
@commands.bot_has_permissions(manage_messages=True)
async def purge_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        if ctx.interaction is None and ctx.message:
            parts = ctx.message.content.split()
            if len(parts) > 1:
                first_arg = parts[1].lower()
                if first_arg == "all":
                    from Commands.Purge.purgeall import _do_purge_all
                    return await _do_purge_all(ctx)
                try:
                    amt = int(first_arg)
                    target_user = ctx.message.mentions[0] if ctx.message.mentions else None
                    from Commands.Purge.purgeamount import _do_purge_amount
                    return await _do_purge_amount(ctx, amt, target_user)
                except ValueError:
                    pass
        await ctx.send("Usage: `/purge amount <1-100>` or `/purge all` (Prefix: `-purge 50` or `-purge all`)", ephemeral=True)

async def setup(bot: commands.Bot):
    if "purge" not in bot.all_commands:
        bot.add_command(purge_group)
