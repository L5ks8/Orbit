import discord
from discord.ext import commands
from Commands.Warn._group import warn_group, _do_warn_add, WarnHubLayout


@warn_group.command(name="add", description="Issues a formal warning to a server member.")
@commands.has_permissions(moderate_members=True)
async def warn_add_cmd(ctx: commands.Context, user: discord.Member, *, reason: str = "No reason provided."):
    await _do_warn_add(ctx, user, reason)


class WarnAddCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="warn", hidden=True)
    @commands.has_permissions(moderate_members=True)
    async def warn_prefix(self, ctx: commands.Context, user: discord.Member = None, *, reason: str = "No reason provided."):
        if user is None:
            view = WarnHubLayout()
            return await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())
        await _do_warn_add(ctx, user, reason)

    @warn_add_cmd.error
    @warn_prefix.error
    async def warn_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Moderate Members permission to issue warnings.", ephemeral=True)
        elif isinstance(error, commands.BadArgument):
            await ctx.send("Could not find that member. Usage: `-warn @user [reason]`", ephemeral=True)


async def setup(bot: commands.Bot):
    await bot.add_cog(WarnAddCog(bot))
