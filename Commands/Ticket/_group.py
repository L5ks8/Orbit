import discord
from discord.ext import commands

@commands.hybrid_group(name="ticket", description="Manage interactive support ticket systems (`setup`, `close`, `add`, `remove`, `reset`).")
@commands.has_permissions(manage_guild=True)
async def ticket_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        await ctx.send("Please use `-ticket setup`, `-ticket close`, `-ticket add`, `-ticket remove`, or `-ticket reset`.", ephemeral=True)

async def setup(bot: commands.Bot):
    if "ticket" not in bot.all_commands:
        bot.add_command(ticket_group)
