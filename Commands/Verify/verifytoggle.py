import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Verify._storage import toggle_verify_config
from Commands.Verify._group import verify_group

@verify_group.command(name="toggle", description="Turn CAPTCHA verification on or off for this server.")
@commands.has_permissions(manage_guild=True)
async def toggle_cmd(ctx: commands.Context):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)

    config = toggle_verify_config(ctx.guild.id)
    enabled = config["enabled"]

    header_str = f"### CAPTCHA Verification Toggled: **{ctx.guild.name}**\n**Status:** {'Active (Enabled)' if enabled else 'Inactive (Disabled)'}"
    info_str = (
        f"**System Status:** `{'ON' if enabled else 'OFF'}`\n\n"
        f"-# Users attempting to verify when disabled will be notified that verification is inactive."
    )

    container = Container(
        TextDisplay(content=header_str),
        Separator(spacing=discord.SeparatorSpacing.small),
        TextDisplay(content=info_str)
    )
    status_view = LayoutView()
    status_view.add_item(container)
    await ctx.send(view=status_view, allowed_mentions=discord.AllowedMentions.none())

@toggle_cmd.error
async def toggle_error(ctx: commands.Context, error):
    if isinstance(error, commands.MissingPermissions):
        await ctx.send("You need Manage Server permission to toggle verification.", ephemeral=True)
    else:
        await ctx.send(f"An error occurred: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    if "verify" not in bot.all_commands:
        bot.add_command(verify_group)
