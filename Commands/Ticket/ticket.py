import discord
from discord.ext import commands

@commands.hybrid_group(name="ticket", description="Support ticket system commands.")
@commands.has_permissions(manage_channels=True)
async def ticket_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        await ctx.send("Please specify a subcommand: `setup`, `add`, `remove`, `close`, or `delete`.", ephemeral=True)

async def setup(bot: commands.Bot):
    if "ticket" not in bot.all_commands:
        bot.add_command(ticket_group)
