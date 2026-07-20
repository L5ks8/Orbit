import discord
from discord.ext import commands
from discord.ui import Container, TextDisplay, Separator
from Commands.Warn._storage import delete_warning, get_user_warnings
from Commands.Log._storage import log_event
from Commands._utils import MemberOrIDConverter, format_usage



async def _do_delwarn(ctx: commands.Context, user: discord.Member, warn_id: str):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)
    success = delete_warning(ctx.guild.id, user.id, warn_id)
    if not success:
        return await ctx.send(f"Could not find warning ID `{warn_id}` for **{user.display_name}**.", ephemeral=True)
    warns = get_user_warnings(ctx.guild.id, user.id)
    remaining = len(warns)
    try:
        await ctx.message.delete()
    except Exception:
        pass
    await log_event(
        ctx.guild,
        "moderation_action",
        "Warning Deleted (`-delwarn`)",
        f"**Target:** {user.mention} (`{user.id}`)\n**Moderator:** {ctx.author.mention} (`{ctx.author.id}`)\n**Removed Warn ID:** `{warn_id}`\n**Remaining Warnings:** `{remaining}`"
    )
    from Embeds import get_command_embed
    kwargs = get_command_embed(ctx.guild.id, "delwarn", msg_type="delete", member_mention=user.mention, member_id=user.id, warn_id=warn_id, remaining=remaining)
    await ctx.send(**kwargs, delete_after=5, allowed_mentions=discord.AllowedMentions.none())

class DelWarnCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="delwarn", aliases=["removewarn", "warnremove"], description="Remove a specific warning from a member by ID.")
    @commands.has_permissions(moderate_members=True)
    async def delwarn_cmd(self, ctx: commands.Context, user: discord.Member, warn_id: str):
        await _do_delwarn(ctx, user, warn_id)

    @delwarn_cmd.error
    async def delwarn_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Moderate Members permission to manage warnings.", ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send(format_usage("-delwarn", "<@member>", "<warn_id>"), ephemeral=True)
        elif isinstance(error, commands.BadArgument):
            await ctx.send(f"{format_usage('-delwarn', '<@member>', '<warn_id>')}", ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(DelWarnCog(bot))

