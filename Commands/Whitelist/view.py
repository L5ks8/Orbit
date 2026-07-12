import discord
from discord.ext import commands
from Commands.Whitelist._views import WhitelistListLayout
from Commands.Whitelist.whitelist import whitelist_group

async def _do_wl_list(ctx: commands.Context):
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)
    view = WhitelistListLayout(ctx.guild, ctx.bot, ctx.author.id)
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

@whitelist_group.command(name="view", aliases=["list"], description="Lists all whitelisted users with options to add/remove IDs.")
@commands.has_permissions(administrator=True)
async def wl_view_cmd(ctx: commands.Context):
    await _do_wl_list(ctx)

class WhitelistListCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="wl_list", hidden=True)
    @commands.has_permissions(administrator=True)
    async def wl_list_prefix(self, ctx: commands.Context):
        await _do_wl_list(ctx)

async def setup(bot: commands.Bot):
    from Commands.Whitelist.whitelist import whitelist_group
    if "whitelist" not in bot.all_commands:
        bot.add_command(whitelist_group)
    await bot.add_cog(WhitelistListCog(bot))
