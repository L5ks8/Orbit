import discord
from discord import app_commands
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Verify._storage import setup_verify_config
from Commands.Verify._views import PersistentVerifyLayout
from Commands.Verify._group import verify_group

@verify_group.command(name="setup", description="Configure CAPTCHA channel, verified role, role removal, and auto-kick.")
@commands.has_permissions(manage_guild=True)
@app_commands.describe(
    channel="The channel where the verification card will be posted",
    role="The role granted after solving the CAPTCHA",
    remove_role="Optional: Role removed after verifying (e.g. Unverified/Quarantine role)",
    auto_kick_minutes="Optional: Minutes before unverified joining members get kicked (`0 = Disabled`)"
)
async def setup_cmd(ctx: commands.Context, channel: discord.TextChannel, role: discord.Role, remove_role: discord.Role = None, auto_kick_minutes: int = 0):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)

    remove_role_id = remove_role.id if remove_role else None
    config = setup_verify_config(ctx.guild.id, channel.id, role.id, remove_role_id, auto_kick_minutes)
    
    view = PersistentVerifyLayout()
    try:
        await channel.send(view=view, allowed_mentions=discord.AllowedMentions.none())
    except Exception as e:
        return await ctx.send(f"Could not post verification card inside {channel.mention}: {e}", ephemeral=True)

    kick_str = f"`{auto_kick_minutes} minutes`" if auto_kick_minutes > 0 else "`Disabled (No auto-kick)`"
    rem_str = remove_role.mention if remove_role else "`None (Disabled)`"
    header_str = f"### CAPTCHA Verification Configured: **{ctx.guild.name}**\n**Verification Channel:** {channel.mention}"
    info_str = (
        f"**Granted Role:** {role.mention}\n"
        f"**Removed Role (After Verify):** {rem_str}\n"
        f"**Auto-Kick Timer:** {kick_str}\n\n"
        f"-# The interactive verification panel is now live in {channel.mention}."
    )

    container = Container(
        TextDisplay(content=header_str),
        Separator(spacing=discord.SeparatorSpacing.small),
        TextDisplay(content=info_str)
    )
    status_view = LayoutView()
    status_view.add_item(container)
    await ctx.send(view=status_view, allowed_mentions=discord.AllowedMentions.none())

@setup_cmd.error
async def setup_error(ctx: commands.Context, error):
    if isinstance(error, commands.MissingPermissions):
        await ctx.send("You need Manage Server permission to configure verification.", ephemeral=True)
    elif isinstance(error, commands.MissingRequiredArgument):
        await ctx.send("Usage: `-verify setup <#channel> <@role> [remove_role] [auto_kick_minutes]`", ephemeral=True)
    else:
        await ctx.send(f"An error occurred: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    if "verify" not in bot.all_commands:
        bot.add_command(verify_group)
    bot.add_view(PersistentVerifyLayout())
