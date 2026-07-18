utf-8import discord
from discord.ext import commands

@commands.hybrid_group(name="info", description="General information and inspection commands.")
async def info_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        await ctx.send("Please use `/info user <@member>`.", ephemeral=True)

async def setup(bot: commands.Bot):
    if "info" not in bot.all_commands:
        bot.add_command(info_group)
