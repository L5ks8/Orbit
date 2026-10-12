import discord
from discord.ext import commands
from Components.Commands._utils import make_embed, make_v2_card, ORBIT_COLOR
from Components.emojis import Emojis

@commands.hybrid_group(name="autoresponder", aliases=["ar", "reply"], description="Manage auto-responses.", invoke_without_command=True)
async def autoresponder_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        card = make_v2_card(f"# {Emojis.KEYBOARD} Auto Responder\n\nUse `/autoresponder list`, `/autoresponder add`, or `/autoresponder remove`.", color=ORBIT_COLOR)
        if card:
            return await ctx.send(view=card, ephemeral=True)
        await ctx.send(embed=make_embed(f"Use `/autoresponder list`, `/autoresponder add`, or `/autoresponder remove`."), ephemeral=True)

async def setup(bot: commands.Bot):
    if "autoresponder" not in bot.all_commands:
        bot.add_command(autoresponder_group)
