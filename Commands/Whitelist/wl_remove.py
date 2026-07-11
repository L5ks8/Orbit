import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Whitelist._storage import remove_from_whitelist
from Commands.Whitelist._group import whitelist_group

class WhitelistRemoveLayout(LayoutView):
    def __init__(self, user: discord.Member, author: discord.Member):
        super().__init__()
        self.container = Container(
            TextDisplay(content=f"### Whitelist Status: Removed\n**User:** {user.mention} (`{user.id}`) is no longer immune to moderation."),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Removed by:** {author.mention}")
        )
        self.add_item(self.container)

async def _do_wl_remove(ctx: commands.Context, member: discord.Member):
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)
    if ctx.author.id != ctx.guild.owner_id:
        return await ctx.send("Only the Server Owner can remove users from the whitelist.", ephemeral=True)
    success = remove_from_whitelist(ctx.guild.id, member.id)
    if not success:
        return await ctx.send("User is not on the global whitelist.", ephemeral=True)
    view = WhitelistRemoveLayout(member, ctx.author)
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

@whitelist_group.command(name="remove", aliases=["del", "delete"], description="Removes a member from the global moderation whitelist.")
async def wl_remove_cmd(ctx: commands.Context, member: discord.Member):
    await _do_wl_remove(ctx, member)

class WhitelistRemoveFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="wl_remove", hidden=True)
    async def wl_remove_prefix(self, ctx: commands.Context, member: discord.Member):
        await _do_wl_remove(ctx, member)

async def setup(bot: commands.Bot):
    if "whitelist" not in bot.all_commands:
        bot.add_command(whitelist_group)
    await bot.add_cog(WhitelistRemoveFallback(bot))
