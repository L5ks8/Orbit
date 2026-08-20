import discord
from discord.ext import commands
from Commands._utils import make_embed

@commands.hybrid_group(name="verification", description="Member verification commands.", invoke_without_command=True)
@commands.has_permissions(manage_guild=True)
async def verify_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        await ctx.send(embed=make_embed("Please use `/verification setup`."), ephemeral=True)

async def setup(bot: commands.Bot):
    if "verification" not in bot.all_commands:
        bot.add_command(verify_group)
