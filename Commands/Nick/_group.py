from discord.ext import commands

@commands.hybrid_group(name="nick", description="Server nickname management (`set`, `reset`).")
async def nick_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        await ctx.send("Usage: `/nick <set/reset>`", ephemeral=True)

async def setup(bot: commands.Bot):
    if "nick" not in bot.all_commands:
        bot.add_command(nick_group)
