import discord
from discord.ext import commands
from discord.ui import Container, TextDisplay, Separator
from Components.Commands.Warn._storage import clear_user_warnings
from Components.Dashboard.Automoderation.log_storage import log_event
from Components.Commands._utils import MemberOrIDConverter, format_usage, make_embed



async def _do_clearwarnings(ctx: commands.Context, user: discord.Member):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send(embed=make_embed("This command must be run inside a server.", discord.Color.red()), ephemeral=True)
    cleared_count = clear_user_warnings(ctx.guild.id, user.id)
    if cleared_count == 0:
        return await ctx.send(embed=make_embed(f"**{user.display_name}** has no formal warnings on this server."), ephemeral=True)
    
    if user.is_timed_out():
        try:
            await user.timeout(None, reason="Warnings cleared via -clearwarns")
        except Exception:
            pass
    try:
        await ctx.message.delete()
    except Exception:
        pass
    await log_event(
        ctx.guild,
        "moderation_action",
        "All Warnings Cleared (`-clearwarns`)",
        f"**Target:** {user.mention} (`{user.id}`)\n**Moderator:** {ctx.author.mention} (`{ctx.author.id}`)\n**Total Cleared:** `{cleared_count}` warnings"
    )

    embed = discord.Embed(
        title="? All Warnings Cleared",
        description=f"**Target Member:** {user.mention} (`{user.id}`)",
        color=discord.Color.green()
    )
    embed.add_field(name="Total Removed", value=f"`{cleared_count}` warnings", inline=True)
    embed.add_field(name="Current Remaining", value="`0`", inline=True)
    await ctx.send(embed=embed, delete_after=5, allowed_mentions=discord.AllowedMentions.none())

class ClearWarnsCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="clearwarns", aliases=["clearwarn", "warnclear", "warnreset"], description="Clear all warnings for a member.")
    @commands.has_permissions(moderate_members=True)
    async def clearwarns_cmd(self, ctx: commands.Context, user: discord.Member):
        await _do_clearwarnings(ctx, user)

    @clearwarns_cmd.error
    async def clearwarns_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send(embed=make_embed("You need Moderate Members permission to manage warnings.", discord.Color.red()), ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send(embed=make_embed(format_usage("-clearwarns", "<@member>"), discord.Color.red()), ephemeral=True)
        elif isinstance(error, commands.BadArgument):
            await ctx.send(embed=make_embed(f"{format_usage('-clearwarns','<@member>')}"), ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(ClearWarnsCog(bot))


