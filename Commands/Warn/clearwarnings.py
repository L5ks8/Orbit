import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Warn._storage import clear_user_warnings
from Commands.Warn._group import warn_group


class ClearWarningsLayout(LayoutView):
    def __init__(self, member: discord.Member, cleared_count: int):
        super().__init__()
        header_str = f"### All Warnings Cleared\n**Target Member:** {member.mention} (`{member.id}`)"
        content_str = f"**Total Removed:** `{cleared_count}` warnings\n**Current Remaining Warnings:** `0`"
        self.container = Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=content_str)
        )
        self.add_item(self.container)


async def _do_clearwarnings(ctx: commands.Context, user: discord.Member):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)
    cleared_count = clear_user_warnings(ctx.guild.id, user.id)
    if cleared_count == 0:
        return await ctx.send(f"**{user.display_name}** has no formal warnings on this server.", ephemeral=True)
    try:
        await ctx.message.delete()
    except Exception:
        pass
    view = ClearWarningsLayout(user, cleared_count)
    await ctx.send(view=view, delete_after=5, allowed_mentions=discord.AllowedMentions.none())


@warn_group.command(name="clear", description="Clears all formal warnings for a specific member.")
@commands.has_permissions(moderate_members=True)
async def warn_clear_cmd(ctx: commands.Context, user: discord.Member):
    await _do_clearwarnings(ctx, user)


class ClearWarningsCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="clearwarnings", aliases=["warnclear", "warnreset"], hidden=True)
    @commands.has_permissions(moderate_members=True)
    async def clearwarnings_prefix(self, ctx: commands.Context, user: discord.Member):
        await _do_clearwarnings(ctx, user)

    @warn_clear_cmd.error
    @clearwarnings_prefix.error
    async def clearwarnings_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Moderate Members permission to manage warnings.", ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage: `-clearwarnings @user`", ephemeral=True)
        elif isinstance(error, commands.BadArgument):
            await ctx.send("Could not find that member. Usage: `-clearwarnings @user`", ephemeral=True)


async def setup(bot: commands.Bot):
    await bot.add_cog(ClearWarningsCog(bot))
