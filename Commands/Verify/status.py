utf-8import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Verify._storage import load_verify_config
from Commands.Verify.verify import verify_group

async def _do_verify_status(ctx: commands.Context):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)

    config = load_verify_config(ctx.guild.id)
    enabled = config.get("enabled", True)
    ch_id = config.get("channel_id")
    role_id = config.get("role_id")
    remove_role_id = config.get("remove_role_id")
    auto_kick = config.get("auto_kick_minutes", 0)

    ch_display = f"<#{ch_id}> (`{ch_id}`)" if ch_id else "`Not set`"
    role_display = f"<@&{role_id}> (`{role_id}`)" if role_id else "`Not set`"
    rem_display = f"<@&{remove_role_id}> (`{remove_role_id}`)" if remove_role_id else "`Not set`"
    kick_str = f"`{auto_kick} minutes`" if auto_kick > 0 else "`Disabled`"

    header_str = f"### Server Verification Status: **{ctx.guild.name}**\n**Status:** {'Active' if enabled and ch_id and role_id else 'Inactive'}"
    info_str = (
        f"**System Enabled:** `{'Yes' if enabled else 'No'}`\n"
        f"**Channel:** {ch_display}\n"
        f"**Granted Role:** {role_display}\n"
        f"**Removed Role:** {rem_display}\n"
        f"**Auto-Kick Timer:** {kick_str}\n"
        f"**Pending Unverified Members:** `{len(config.get('pending_kicks', {}))}`"
    )

    container = Container(
        TextDisplay(content=header_str),
        Separator(spacing=discord.SeparatorSpacing.small),
        TextDisplay(content=info_str)
    )
    status_view = LayoutView()
    status_view.add_item(container)
    await ctx.send(view=status_view, allowed_mentions=discord.AllowedMentions.none())

@verify_group.command(name="status", description="Check CAPTCHA verification configuration status.")
@commands.has_permissions(manage_guild=True)
async def status_cmd(ctx: commands.Context):
    await _do_verify_status(ctx)

class VerifyStatusCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @status_cmd.error
    async def status_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Manage Server permission to check verification status.", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

class VerifyStatusFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="vf_status", aliases=["verifystatus"], hidden=True)
    @commands.has_permissions(manage_guild=True)
    async def status_prefix(self, ctx: commands.Context):
        await _do_verify_status(ctx)

async def setup(bot: commands.Bot):
    from Commands.Verify.verify import verify_group
    if "verify" not in bot.all_commands:
        bot.add_command(verify_group)
    await bot.add_cog(VerifyStatusCog(bot))
    await bot.add_cog(VerifyStatusFallback(bot))
