from discord.ext import commands

@commands.hybrid_group(name="warn", description="Server warning management system (`add`, `list`, `remove`).")
async def warn_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        await ctx.send("Usage: `/warn <add/list/remove>`", ephemeral=True)

async def setup(bot: commands.Bot):
    if "warn" not in bot.all_commands:
        bot.add_command(warn_group)
