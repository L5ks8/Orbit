import discord
from discord.ext import commands
from Components.Commands._utils import make_embed

@commands.hybrid_group(name="autoresponder", aliases=["ar", "reply"], description="Manage auto-responses.", invoke_without_command=True)
async def autoresponder_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        await ctx.send(embed=make_embed("Use `/autoresponder list`, `/autoresponder add`, or `/autoresponder remove`.", discord.Color.blue()), ephemeral=True)

async def setup(bot: commands.Bot):
    if "autoresponder" not in bot.all_commands:
        bot.add_command(autoresponder_group)
