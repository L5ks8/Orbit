import discord
from discord.ext import commands
from Commands.Whitelist._group import whitelist_group
from Commands.Whitelist._views import WhitelistDashboardLayout

class WhitelistCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @whitelist_group.error
    async def whitelist_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Administrator permissions to manage the global whitelist.", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

async def _do_whitelist_panel(ctx: commands.Context):
    if not ctx.guild:
        return await ctx.send("This command can only be used inside a server.", ephemeral=True)
    if ctx.author.id != ctx.guild.owner_id:
        return await ctx.send("Only the Server Owner can use the whitelist system.", ephemeral=True)
    view = WhitelistDashboardLayout(ctx.guild.id, ctx.author.id)
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

@whitelist_group.command(name="panel", aliases=["setup"], description="Opens the interactive Whitelist Dashboard.")
async def whitelist_panel_cmd(ctx: commands.Context):
    await _do_whitelist_panel(ctx)

class WhitelistPrefixFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="wl_panel", hidden=True)
    async def wl_panel_prefix(self, ctx: commands.Context):
        await _do_whitelist_panel(ctx)

async def setup(bot: commands.Bot):
    if "whitelist" not in bot.all_commands:
        bot.add_command(whitelist_group)
    await bot.add_cog(WhitelistCommand(bot))
    await bot.add_cog(WhitelistPrefixFallback(bot))
