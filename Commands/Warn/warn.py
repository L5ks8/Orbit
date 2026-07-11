import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Warn._storage import add_warning, get_user_warnings
from Commands.Whitelist._storage import is_whitelisted
from Commands.Warn._group import warn_group

class WarnIssuedLayout(LayoutView):
    def __init__(self, member: discord.Member, warn_entry: dict, total_warns: int):
        super().__init__()
        header_str = f"### Warning Issued: {member.mention}\n**Warn ID:** `{warn_entry['warn_id']}` | **Total Warnings:** `{total_warns}`"
        info_str = (
            f"**Moderator:** <@{warn_entry['moderator_id']}>\n"
            f"**Reason:** {warn_entry['reason']}\n"
            f"**Date:** <t:{warn_entry['timestamp']}:f> (<t:{warn_entry['timestamp']}:R>)"
        )

        self.container = Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=info_str)
        )
        self.add_item(self.container)

async def _do_warn_add(ctx: commands.Context, user: discord.Member, reason: str):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)
    if user.id == ctx.author.id:
        return await ctx.send("You cannot warn yourself.", ephemeral=True)
    if is_whitelisted(ctx.guild.id, user.id):
        return await ctx.send("This user is on the global moderation whitelist (`Immune to Warnings`).", ephemeral=True)
    if user.top_role >= ctx.author.top_role and ctx.author != ctx.guild.owner:
        return await ctx.send("You cannot warn a user with an equal or higher role.", ephemeral=True)

    warn_entry = add_warning(ctx.guild.id, user.id, reason, ctx.author.id)
    total_warns = len(get_user_warnings(ctx.guild.id, user.id))

    try:
        await user.send(f"You have received a formal warning in **{ctx.guild.name}**.\n**Warn ID:** `{warn_entry['warn_id']}` | **Reason:** {reason}")
    except Exception:
        pass

    view = WarnIssuedLayout(user, warn_entry, total_warns)
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

@warn_group.command(name="add", description="Issues a formal warning to a server member (`/warn add`).")
@commands.has_permissions(moderate_members=True)
async def warn_add_cmd(ctx: commands.Context, user: discord.Member, *, reason: str = "No reason provided."):
    await _do_warn_add(ctx, user, reason)

class WarnCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @warn_add_cmd.error
    async def warn_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Moderate Members permission to issue warnings.", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

class WarnPrefixFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="warn add", aliases=["warnadd"], hidden=True)
    @commands.has_permissions(moderate_members=True)
    async def warn_add_prefix(self, ctx: commands.Context, user: discord.Member, *, reason: str = "No reason provided."):
        await _do_warn_add(ctx, user, reason)

async def setup(bot: commands.Bot):
    await bot.add_cog(WarnCommand(bot))
    await bot.add_cog(WarnPrefixFallback(bot))
