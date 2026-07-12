import discord
from discord.ext import commands

@commands.hybrid_group(name="nick", aliases=["nickname"], description="Nickname management commands.")
@commands.has_permissions(manage_nicknames=True)
async def nick_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        await ctx.send("Please use `/nick set <@member> <nickname>` or `/nick reset <@member>`.", ephemeral=True)

async def setup(bot: commands.Bot):
    if "nick" not in bot.all_commands:
        bot.add_command(nick_group)
