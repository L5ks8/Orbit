import discord
from discord.ext import commands
from discord.ui import Container, TextDisplay, Separator
from Components.Commands.Warn._storage import delete_warning, get_user_warnings
from Components.Dashboard.Automoderation.log_storage import log_event
from Components.Commands._utils import MemberOrIDConverter, format_usage, make_embed



async def _do_delwarn(ctx: commands.Context, user: discord.Member, warn_id: str):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send(embed=make_embed("This command must be run inside a server.", discord.Color.red()), ephemeral=True)
    success = delete_warning(ctx.guild.id, user.id, warn_id)
    if not success:
        return await ctx.send(embed=make_embed(f"Could not find warning ID `{warn_id}` for **{user.display_name}**.", discord.Color.red()), ephemeral=True)
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
    embed = discord.Embed(
        title="? Warning Deleted",
        description=f"**Target Member:** {user.mention} (`{user.id}`)",
        color=discord.Color.green()
    )
    embed.add_field(name="Removed ID", value=f"`{warn_id}`", inline=True)
    embed.add_field(name="Remaining Warnings", value=f"`{remaining}`", inline=True)
    await ctx.send(embed=embed, delete_after=5, allowed_mentions=discord.AllowedMentions.none())

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
            await ctx.send(embed=make_embed("You need Moderate Members permission to manage warnings.", discord.Color.red()), ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send(embed=make_embed(format_usage("-delwarn", "<@member>", "<warn_id>"), discord.Color.red()), ephemeral=True)
        elif isinstance(error, commands.BadArgument):
            await ctx.send(embed=make_embed(f"{format_usage('-delwarn','<@member>','<warn_id>')}"), ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(DelWarnCog(bot))


