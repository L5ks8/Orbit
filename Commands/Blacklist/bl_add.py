import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Blacklist._storage import add_to_blacklist
from Commands.Blacklist._group import blacklist_group
from Commands.Whitelist._storage import is_whitelisted

class BlacklistAddLayout(LayoutView):
    def __init__(self, target: discord.abc.User, reason: str, author: discord.Member, ban_msg: str):
        super().__init__()
        self.container = Container(
            TextDisplay(content=f"### User Added to Blacklist\n**Target:** {target.mention} (`{target.id}`)"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Reason:** {reason}\n**Moderator:** {author.mention}{ban_msg}")
        )
        self.add_item(self.container)

async def _do_bl_add(ctx: commands.Context, user: discord.abc.User, reason: str):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)
    if is_whitelisted(ctx.guild.id, user.id):
        return await ctx.send("This user is on the global moderation whitelist (`Immune to Blacklist`).", ephemeral=True)

    success = add_to_blacklist(ctx.guild.id, user.id, reason, ctx.author.id)
    if not success:
        return await ctx.send("This user is already on the blacklist for this server.", ephemeral=True)

    member = ctx.guild.get_member(user.id)
    ban_msg = ""
    if member and not member.bot:
        try:
            await member.ban(reason=f"Blacklisted by {ctx.author} | Reason: {reason}")
            ban_msg = "\n\n**Action:** `User was present on the server and has been automatically banned.`"
        except Exception as e:
            ban_msg = f"\n\n**Action Note:** `Failed to ban user from server: {e}`"

    view = BlacklistAddLayout(user, reason, ctx.author, ban_msg)
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

@blacklist_group.command(name="add", description="Add a user to the server blacklist (auto-bans if on server).")
@commands.has_permissions(administrator=True)
async def bl_add_cmd(ctx: commands.Context, user: discord.User, *, reason: str = "No reason provided"):
    await _do_bl_add(ctx, user, reason)

class BlacklistAddFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="bl_add", hidden=True)
    @commands.has_permissions(administrator=True)
    async def bl_add_prefix(self, ctx: commands.Context, user: discord.User, *, reason: str = "No reason provided"):
        await _do_bl_add(ctx, user, reason)

async def setup(bot: commands.Bot):
    if "blacklist" not in bot.all_commands:
        bot.add_command(blacklist_group)
    await bot.add_cog(BlacklistAddFallback(bot))
