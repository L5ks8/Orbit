import discord
from discord.ext import commands
from Commands.Blacklist._views import BlacklistListLayout
from Commands.Blacklist.blacklist import blacklist_group

async def _do_bl_list(ctx: commands.Context):
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)
    view = BlacklistListLayout(ctx.guild, ctx.bot, ctx.author.id)
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

@blacklist_group.command(name="view", aliases=["list"], description="Lists all blacklisted users with options to add/remove IDs.")
@commands.has_permissions(administrator=True)
async def bl_view_cmd(ctx: commands.Context):
    await _do_bl_list(ctx)

class BlacklistListCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="bl_list", hidden=True)
    @commands.has_permissions(administrator=True)
    async def bl_list_prefix(self, ctx: commands.Context):
        await _do_bl_list(ctx)

async def setup(bot: commands.Bot):
    from Commands.Blacklist.blacklist import blacklist_group
    if "blacklist" not in bot.all_commands:
        bot.add_command(blacklist_group)
    await bot.add_cog(BlacklistListCog(bot))
