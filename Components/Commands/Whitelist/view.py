import discord
from discord.ext import commands
from Components.Commands.Whitelist._views import WhitelistListLayout
from Components.Commands._utils import make_embed

async def _do_wl_list(ctx: commands.Context):
    if not ctx.guild:
        return await ctx.send(embed=make_embed("This command must be run inside a server.", discord.Color.red()), ephemeral=True)
    view = WhitelistListLayout(ctx.guild, ctx.bot, ctx.author.id)
    kwargs = view.get_kwargs(ctx.guild.id)
    await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())

@commands.hybrid_command(name="checkwhitelist", aliases=["wl_list", "whitelist_view"], description="Lists all whitelisted users with options to add/remove IDs.")
@commands.has_permissions(administrator=True)
async def checkwhitelist_cmd(ctx: commands.Context):
    await _do_wl_list(ctx)

async def setup(bot: commands.Bot):
    if "checkwhitelist" not in bot.all_commands:
        bot.add_command(checkwhitelist_cmd)
