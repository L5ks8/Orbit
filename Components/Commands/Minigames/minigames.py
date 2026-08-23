import discord
from discord.ext import commands
from Components.Commands._utils import make_embed

@commands.hybrid_group(name="minigames", description="Fun economy minigames.", invoke_without_command=True)
async def minigames_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        await ctx.send(embed=make_embed("Use a minigame subcommand (e.g. /minigames blackjack).", discord.Color.blue()), ephemeral=True)

async def setup(bot: commands.Bot):
    if "minigames" not in bot.all_commands:
        bot.add_command(minigames_group)
