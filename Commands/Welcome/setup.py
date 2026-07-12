import discord
from discord import app_commands
from discord.ext import commands
from Commands.Welcome.welcome import welcome_group
from Commands.Welcome._storage import setup_welcome
from Commands.Welcome._views import format_welcome_string, WelcomeCardLayout

async def _do_wl_setup(ctx: commands.Context, channel: discord.TextChannel, message: str = None):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)

    config = setup_welcome(ctx.guild.id, channel.id, message)
    formatted = format_welcome_string(config["message"], ctx.author)
    
    preview_view = WelcomeCardLayout(ctx.author, f"**Status:** Welcome notifications enabled in {channel.mention}!\n\n*(Preview)* {formatted}")
    await ctx.send(view=preview_view, allowed_mentions=discord.AllowedMentions.none())

@welcome_group.command(name="setup", description="Configure welcome channel and message.")
@commands.has_permissions(manage_guild=True)
@app_commands.describe(
    channel="The text channel where welcome notifications will be posted",
    message="Custom message template (Variables: {user}, {server}, {count}, {username})"
)
async def setup_cmd(ctx: commands.Context, channel: discord.TextChannel, *, message: str = None):
    await _do_wl_setup(ctx, channel, message)

class WelcomeSetupCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="wl_setup", hidden=True)
    @commands.has_permissions(manage_guild=True)
    async def wl_setup_prefix(self, ctx: commands.Context, channel: discord.TextChannel, *, message: str = None):
        await _do_wl_setup(ctx, channel, message)

async def setup(bot: commands.Bot):
    from Commands.Welcome.welcome import welcome_group
    if "welcome" not in bot.all_commands:
        bot.add_command(welcome_group)
    await bot.add_cog(WelcomeSetupCog(bot))
