import discord
from discord.ext import commands
from Commands._utils import make_embed

@commands.hybrid_group(name="slowmode", description="Channel slowmode commands.")
@commands.has_permissions(manage_channels=True)
async def slowmode_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        await ctx.send(embed=make_embed("Please use `/slowmode set <seconds>` or `/slowmode reset`.", discord.Color.green()), ephemeral=True)

async def setup(bot: commands.Bot):
    if "slowmode" not in bot.all_commands:
        bot.add_command(slowmode_group)
