from discord.ext import commands

@commands.hybrid_group(name="tempvoice", description="Temporary voice channel management.")
async def jtc_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        await ctx.send("Usage: `-tempvoice setup` or use the control buttons inside your temporary voice channel.", ephemeral=True)

async def setup(bot: commands.Bot):
    if "tempvoice" not in bot.all_commands:
        bot.add_command(jtc_group)
