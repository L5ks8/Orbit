import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Blacklist._storage import remove_from_blacklist
from Commands.Blacklist._group import blacklist_group

class BlacklistRemoveLayout(LayoutView):
    def __init__(self, target: discord.abc.User, author: discord.Member):
        super().__init__()
        self.container = Container(
            TextDisplay(content=f"### User Removed from Blacklist\n**Target:** {target.mention} (`{target.id}`)"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Moderator:** {author.mention}\n*The user is no longer blacklisted on this server.*")
        )
        self.add_item(self.container)

async def _do_bl_remove(ctx: commands.Context, user: discord.abc.User):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)

    success = remove_from_blacklist(ctx.guild.id, user.id)
    if not success:
        return await ctx.send("This user is not currently on the server blacklist.", ephemeral=True)

    view = BlacklistRemoveLayout(user, ctx.author)
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

@blacklist_group.command(name="remove", description="Remove a user from the server blacklist.")
@commands.has_permissions(administrator=True)
async def bl_remove_cmd(ctx: commands.Context, user: discord.User):
    await _do_bl_remove(ctx, user)

class BlacklistRemoveFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="bl_remove", hidden=True)
    @commands.has_permissions(administrator=True)
    async def bl_remove_prefix(self, ctx: commands.Context, user: discord.User):
        await _do_bl_remove(ctx, user)

async def setup(bot: commands.Bot):
    if "blacklist" not in bot.all_commands:
        bot.add_command(blacklist_group)
    await bot.add_cog(BlacklistRemoveFallback(bot))
