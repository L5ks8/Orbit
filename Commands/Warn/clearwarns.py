import discord
from discord.ext import commands
from discord.ui import Container, TextDisplay, Separator
from Commands.Warn._storage import clear_user_warnings
from Commands.Log._storage import log_event
from Commands._utils import MemberOrIDConverter, format_usage



async def _do_clearwarnings(ctx: commands.Context, user: discord.Member):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)
    cleared_count = clear_user_warnings(ctx.guild.id, user.id)
    if cleared_count == 0:
        return await ctx.send(f"**{user.display_name}** has no formal warnings on this server.", ephemeral=True)
    
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

    from Embeds import get_command_embed
    kwargs = get_command_embed(ctx.guild.id, "clearwarns", msg_type="clear", member_mention=user.mention, member_id=user.id, cleared_count=cleared_count)
    await ctx.send(**kwargs, delete_after=5, allowed_mentions=discord.AllowedMentions.none())

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
            await ctx.send("You need Moderate Members permission to manage warnings.", ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send(format_usage("-clearwarns", "<@member>"), ephemeral=True)
        elif isinstance(error, commands.BadArgument):
            await ctx.send(f"{format_usage('-clearwarns', '<@member>')}", ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(ClearWarnsCog(bot))

