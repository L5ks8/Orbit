utf-8import discord
from discord.ext import commands

@commands.hybrid_group(name="channel", description="Channel management commands.")
@commands.has_permissions(manage_channels=True)
async def channel_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        await ctx.send("Please use `/channel create` or `/channel delete`.", ephemeral=True)

async def setup(bot: commands.Bot):
    if "channel" not in bot.all_commands:
        bot.add_command(channel_group)
