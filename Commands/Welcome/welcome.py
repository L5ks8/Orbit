import discord
from discord.ext import commands

@commands.hybrid_group(name="welcome", description="Server welcome system commands.")
@commands.has_permissions(manage_guild=True)
async def welcome_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        await ctx.send("Please use `/welcome setup`, `/welcome toggle`, or `/welcome reset`.", ephemeral=True)

async def setup(bot: commands.Bot):
    if "welcome" not in bot.all_commands:
        bot.add_command(welcome_group)
