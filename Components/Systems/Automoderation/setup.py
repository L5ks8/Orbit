import discord
from discord.ext import commands
from discord import app_commands
from Components.Systems.Automoderation._views import AutoModDashboardLayout
from Components.Commands._utils import make_embed, InteractionContext

async def _do_automod_panel(ctx):
    if not ctx.guild:
        return await ctx.send(embed=make_embed("This command can only be used inside a server.", discord.Color.red()), ephemeral=True)
    view = AutoModDashboardLayout(ctx.guild.id)
    await ctx.send(**view.get_kwargs(), allowed_mentions=discord.AllowedMentions.none())

@app_commands.command(name="automod-setup", description="Open AutoMod dashboard.")
@app_commands.default_permissions(administrator=True)
async def automod_setup_cmd(interaction: discord.Interaction):
    ctx = InteractionContext(interaction)
    await _do_automod_panel(ctx)

async def setup(bot: commands.Bot):
    bot.tree.add_command(automod_setup_cmd)
