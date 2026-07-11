from discord.ext import commands

@commands.hybrid_group(name="info", description="General information and inspection commands (`user`).")
async def info_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        await ctx.send("Usage: `/info <user>`", ephemeral=True)

@commands.hybrid_group(name="server", description="Server overview and inspection commands (`info`).")
async def server_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        await ctx.send("Usage: `/server info`", ephemeral=True)

async def setup(bot: commands.Bot):
    if "info" not in bot.all_commands:
        bot.add_command(info_group)
    if "server" not in bot.all_commands:
        bot.add_command(server_group)
