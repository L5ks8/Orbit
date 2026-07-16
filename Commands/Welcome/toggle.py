import discord
from discord import app_commands
from discord.ext import commands
from Commands.Welcome.welcome import welcome_group
from Database.storagehandler import set_welcome_status
from Commands.Welcome._views import WelcomeStatusLayout

async def _do_wl_toggle(ctx: commands.Context, enabled: bool):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)

    config = await set_welcome_status(ctx.guild.id, enabled)
    view = WelcomeStatusLayout(ctx.guild, config, ctx.author.id)
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

@welcome_group.command(name="toggle", description="Turn welcome notifications on or off.")
@commands.has_permissions(manage_guild=True)
@app_commands.describe(enabled="Set to True to turn ON or False to turn OFF")
async def toggle_cmd(ctx: commands.Context, enabled: bool):
    await _do_wl_toggle(ctx, enabled)

class WelcomeToggleCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="wl_toggle", hidden=True)
    @commands.has_permissions(manage_guild=True)
    async def wl_toggle_prefix(self, ctx: commands.Context, enabled: bool):
        await _do_wl_toggle(ctx, enabled)

async def setup(bot: commands.Bot):
    from Commands.Welcome.welcome import welcome_group
    if "welcome" not in bot.all_commands:
        bot.add_command(welcome_group)
    await bot.add_cog(WelcomeToggleCog(bot))
