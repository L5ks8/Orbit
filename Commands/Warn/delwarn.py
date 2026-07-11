import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Warn._storage import delete_warning, clear_user_warnings, get_user_warnings
from Commands.Warn._group import warn_group

class DelWarnLayout(LayoutView):
    def __init__(self, member: discord.Member, action_title: str, details_str: str, remaining_warns: int):
        super().__init__()
        header_str = f"### {action_title}\n**Target Member:** {member.mention} (`{member.id}`)"
        content_str = f"{details_str}\n\n**Current Remaining Warnings:** `{remaining_warns}`"

        self.container = Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=content_str)
        )
        self.add_item(self.container)

async def _do_warn_remove(ctx: commands.Context, user: discord.Member, warn_id: str):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)

    success = delete_warning(ctx.guild.id, user.id, warn_id)
    if not success:
        return await ctx.send(f"Could not find warning ID `{warn_id}` for **{user.display_name}**.", ephemeral=True)

    remaining = len(get_user_warnings(ctx.guild.id, user.id))
    view = DelWarnLayout(
        user,
        "Warning Deleted",
        f"**Removed ID:** `{warn_id}`\n**Moderator:** {ctx.author.mention}",
        remaining
    )
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

async def _do_warn_clear(ctx: commands.Context, user: discord.Member):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)

    cleared_count = clear_user_warnings(ctx.guild.id, user.id)
    if cleared_count == 0:
        return await ctx.send(f"**{user.display_name}** currently has no formal warnings on this server.", ephemeral=True)

    view = DelWarnLayout(
        user,
        "All Warnings Cleared",
        f"**Total Removed:** `{cleared_count}` warnings\n**Moderator:** {ctx.author.mention}",
        0
    )
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

@warn_group.command(name="remove", description="Removes a specific warning from a user by ID (`/warn remove`).")
@commands.has_permissions(moderate_members=True)
async def warn_remove_cmd(ctx: commands.Context, user: discord.Member, warn_id: str):
    await _do_warn_remove(ctx, user, warn_id)

@warn_group.command(name="clear", description="Clears all formal warnings for a specific member (`/warn clear`).")
@commands.has_permissions(moderate_members=True)
async def warn_clear_cmd(ctx: commands.Context, user: discord.Member):
    await _do_warn_clear(ctx, user)

class DelWarnCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @warn_remove_cmd.error
    @warn_clear_cmd.error
    async def warn_actions_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Moderate Members permission to manage warnings.", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

class DelWarnPrefixFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="warn remove", aliases=["warnremove", "delwarn"], hidden=True)
    @commands.has_permissions(moderate_members=True)
    async def warn_remove_prefix(self, ctx: commands.Context, user: discord.Member, warn_id: str):
        await _do_warn_remove(ctx, user, warn_id)

    @commands.command(name="warn clear", aliases=["warnclear", "clearwarnings"], hidden=True)
    @commands.has_permissions(moderate_members=True)
    async def warn_clear_prefix(self, ctx: commands.Context, user: discord.Member):
        await _do_warn_clear(ctx, user)

async def setup(bot: commands.Bot):
    await bot.add_cog(DelWarnCommand(bot))
    await bot.add_cog(DelWarnPrefixFallback(bot))
