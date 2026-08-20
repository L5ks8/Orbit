import discord
from discord.ext import commands
from Commands._utils import make_embed

@commands.hybrid_group(name="reactionrole", aliases=["rr", "btnrole"], description="Manage button role panels.")
@commands.has_permissions(administrator=True)
async def reactionrole_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        await ctx.send(embed=make_embed("Usage: `/reactionrole create <title> <role1> [role2...]`", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    if "reactionrole" not in bot.all_commands:
        bot.add_command(reactionrole_group)
