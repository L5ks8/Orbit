import discord
from discord.ext import commands
from Commands._utils import make_embed

@commands.hybrid_group(name="tempvoice", aliases=["jtc", "jointocreate"], description="Temporary voice channel commands.")
@commands.has_permissions(administrator=True)
async def tempvoice_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        await ctx.send(embed=make_embed("Please use `/tempvoice setup`."), ephemeral=True)

async def setup(bot: commands.Bot):
    if "tempvoice" not in bot.all_commands:
        bot.add_command(tempvoice_group)
