import discord
from discord.ext import commands
from Commands.Whitelist._views import WhitelistListLayout

async def _do_wl_list(ctx: commands.Context):
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)
    view = WhitelistListLayout(ctx.guild, ctx.bot, ctx.author.id)
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

@commands.hybrid_command(name="checkwhitelist", aliases=["wl_list", "whitelist_view"], description="Lists all whitelisted users with options to add/remove IDs.")
@commands.has_permissions(administrator=True)
async def checkwhitelist_cmd(ctx: commands.Context):
    await _do_wl_list(ctx)

class WhitelistListCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="wl_list_prefix", hidden=True)
    @commands.has_permissions(administrator=True)
    async def wl_list_prefix(self, ctx: commands.Context):
        await _do_wl_list(ctx)

async def setup(bot: commands.Bot):
    if "checkwhitelist" not in bot.all_commands:
        bot.add_command(checkwhitelist_cmd)
    await bot.add_cog(WhitelistListCog(bot))

