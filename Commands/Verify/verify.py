utf-8import discord
from discord.ext import commands

@commands.hybrid_group(name="verify", description="Member verification commands.")
@commands.has_permissions(manage_guild=True)
async def verify_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        await ctx.send("Please use `/verify setup`.", ephemeral=True)

async def setup(bot: commands.Bot):
    if "verify" not in bot.all_commands:
        bot.add_command(verify_group)
