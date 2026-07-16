import discord
from discord.ext import commands
from Commands.Welcome.welcome import welcome_group
from Database.storagehandler import reset_welcome
from Commands.Welcome._views import WelcomeStatusLayout

async def _do_wl_reset(ctx: commands.Context):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)

    config = await reset_welcome(ctx.guild.id)
    view = WelcomeStatusLayout(ctx.guild, config, ctx.author.id)
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

@welcome_group.command(name="reset", description="Reset welcome configuration.")
@commands.has_permissions(manage_guild=True)
async def reset_cmd(ctx: commands.Context):
    await _do_wl_reset(ctx)

class WelcomeResetCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="wl_reset", hidden=True)
    @commands.has_permissions(manage_guild=True)
    async def wl_reset_prefix(self, ctx: commands.Context):
        await _do_wl_reset(ctx)

async def setup(bot: commands.Bot):
    from Commands.Welcome.welcome import welcome_group
    if "welcome" not in bot.all_commands:
        bot.add_command(welcome_group)
    await bot.add_cog(WelcomeResetCog(bot))
