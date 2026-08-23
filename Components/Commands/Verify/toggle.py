import discord
from discord.ext import commands

from Components.Commands.Verify._storage import toggle_verify_config
from Components.Commands.Verify.verify import verify_group

async def _do_verify_toggle(ctx: commands.Context):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send(embed=make_embed("This command must be run inside a server.", discord.Color.red()), ephemeral=True)

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

@verify_group.command(name="toggle", description="Enable or disable CAPTCHA verification.")
@commands.has_permissions(manage_guild=True)
async def toggle_cmd(ctx: commands.Context):
    await _do_verify_toggle(ctx)

class VerifyToggleCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @toggle_cmd.error
    async def toggle_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send(embed=make_embed("You need Manage Server permission to toggle verification.", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

class VerifyToggleFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="vf_toggle", aliases=["verifytoggle"], hidden=True)
    @commands.has_permissions(manage_guild=True)
    async def toggle_prefix(self, ctx: commands.Context):
        await _do_verify_toggle(ctx)

async def setup(bot: commands.Bot):
    from Components.Commands.Verify.verify import verify_group
    from Components.Commands._utils import make_embed
    if "verification" not in bot.all_commands:
        bot.add_command(verify_group)
    await bot.add_cog(VerifyToggleCog(bot))
    await bot.add_cog(VerifyToggleFallback(bot))
