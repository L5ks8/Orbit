import discord
from discord.ext import commands
from Components.Systems.Automoderation.automod import automod_group
from Components.Systems.Automoderation._views import AutoModDashboardLayout
from Components.Commands._utils import make_embed

class AutoModCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @automod_group.error
    async def automod_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send(embed=make_embed("You need Administrator permissions to configure AutoMod.", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

async def _do_automod_panel(ctx: commands.Context):
    if not ctx.guild:
        return await ctx.send(embed=make_embed("This command can only be used inside a server.", discord.Color.red()), ephemeral=True)
    view = AutoModDashboardLayout(ctx.guild.id)
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

@automod_group.command(name="setup", aliases=["panel"], description="Open AutoMod dashboard.")
@commands.has_permissions(administrator=True)
async def automod_setup_cmd(ctx: commands.Context):
    await _do_automod_panel(ctx)

class AutoModPrefixFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="am_setup", aliases=["am_panel", "automodsetup"], hidden=True)
    @commands.has_permissions(administrator=True)
    async def am_setup_prefix(self, ctx: commands.Context):
        await _do_automod_panel(ctx)

async def setup(bot: commands.Bot):
    from Components.Systems.Automoderation.automod import automod_group
    from Components.Commands._utils import make_embed
    if "automod" not in bot.all_commands:
        bot.add_command(automod_group)
    await bot.add_cog(AutoModCommand(bot))
    await bot.add_cog(AutoModPrefixFallback(bot))
