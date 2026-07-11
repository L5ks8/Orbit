import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Verify._storage import reset_verify_config
from Commands.Verify._group import verify_group

@verify_group.command(name="reset", description="Reset CAPTCHA verification configuration and turn it off.")
@commands.has_permissions(manage_guild=True)
async def reset_cmd(ctx: commands.Context):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)

    reset_verify_config(ctx.guild.id)

    header_str = f"### CAPTCHA Verification Reset: **{ctx.guild.name}**\n**Status:** Inactive (Reset to defaults)"
    info_str = "**Action:** All verification configurations, channels, and pending auto-kicks have been cleared."

    container = Container(
        TextDisplay(content=header_str),
        Separator(spacing=discord.SeparatorSpacing.small),
        TextDisplay(content=info_str)
    )
    status_view = LayoutView()
    status_view.add_item(container)
    await ctx.send(view=status_view, allowed_mentions=discord.AllowedMentions.none())

@reset_cmd.error
async def reset_error(ctx: commands.Context, error):
    if isinstance(error, commands.MissingPermissions):
        await ctx.send("You need Manage Server permission to reset verification.", ephemeral=True)
    else:
        await ctx.send(f"An error occurred: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    if "verify" not in bot.all_commands:
        bot.add_command(verify_group)
