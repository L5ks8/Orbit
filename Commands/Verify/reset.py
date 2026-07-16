import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Verify._storage import reset_verify_config
from Commands.Verify.verify import verify_group

async def _do_verify_reset(ctx: commands.Context):
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

@verify_group.command(name="reset", description="Reset CAPTCHA verification configuration.")
@commands.has_permissions(manage_guild=True)
async def reset_cmd(ctx: commands.Context):
    await _do_verify_reset(ctx)

class VerifyResetCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @reset_cmd.error
    async def reset_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Manage Server permission to reset verification.", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

class VerifyResetFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="vf_reset", aliases=["verifyreset"], hidden=True)
    @commands.has_permissions(manage_guild=True)
    async def reset_prefix(self, ctx: commands.Context):
        await _do_verify_reset(ctx)

async def setup(bot: commands.Bot):
    from Commands.Verify.verify import verify_group
    if "verify" not in bot.all_commands:
        bot.add_command(verify_group)
    await bot.add_cog(VerifyResetCog(bot))
    await bot.add_cog(VerifyResetFallback(bot))
