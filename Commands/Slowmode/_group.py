from discord.ext import commands

@commands.hybrid_group(name="slowmode", description="Manage channel slowmode rate limits (`set`, `off`).")
async def slowmode_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        await ctx.send("Usage: `/slowmode <set/off>`", ephemeral=True)

async def setup(bot: commands.Bot):
    if "slowmode" not in bot.all_commands:
        bot.add_command(slowmode_group)
