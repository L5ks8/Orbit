import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Whitelist._storage import add_to_whitelist
from Commands.Whitelist._group import whitelist_group

class WhitelistAddLayout(LayoutView):
    def __init__(self, user: discord.Member, reason: str, author: discord.Member):
        super().__init__()
        self.container = Container(
            TextDisplay(content=f"### Whitelist Status: Added\n**User:** {user.mention} (`{user.id}`) is now immune to moderation."),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Reason:** {reason}\n**Added by:** {author.mention}")
        )
        self.add_item(self.container)

async def _do_wl_add(ctx: commands.Context, member: discord.Member, reason: str):
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)
    if ctx.author.id != ctx.guild.owner_id:
        return await ctx.send("Only the Server Owner can add users to the whitelist.", ephemeral=True)
    success = add_to_whitelist(ctx.guild.id, member.id, reason, ctx.author.id)
    if not success:
        return await ctx.send("User is already on the global whitelist.", ephemeral=True)
    view = WhitelistAddLayout(member, reason, ctx.author)
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

@whitelist_group.command(name="add", description="Adds a member to the global moderation immunity whitelist.")
async def wl_add_cmd(ctx: commands.Context, member: discord.Member, *, reason: str = "Global Immunity"):
    await _do_wl_add(ctx, member, reason)

class WhitelistAddFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="wl_add", hidden=True)
    async def wl_add_prefix(self, ctx: commands.Context, member: discord.Member, *, reason: str = "Global Immunity"):
        await _do_wl_add(ctx, member, reason)

async def setup(bot: commands.Bot):
    if "whitelist" not in bot.all_commands:
        bot.add_command(whitelist_group)
    await bot.add_cog(WhitelistAddFallback(bot))
