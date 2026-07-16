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

    # Check for image attachment
    if ctx.message.attachments:
        att = ctx.message.attachments[0]
        if att.content_type and att.content_type.startswith("image/"):
            from Commands.Welcome._storage import get_welcome_bg_path
            bg_path = get_welcome_bg_path(ctx.guild.id)
            try:
                await att.save(bg_path)
            except Exception as e:
                return await ctx.send(f"Failed to save background image: {e}", ephemeral=True)

    config = setup_welcome(ctx.guild.id, channel.id, message)
    formatted = format_welcome_string(config["message"], ctx.author)
    
    await ctx.send(f"**Status:** Welcome notifications enabled in {channel.mention}!\n\n*(Preview Text)*: {formatted}\n\n*If you attached an image, it was saved as your welcome background.*", allowed_mentions=discord.AllowedMentions.none())

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

    @commands.command(name="setwelcome", aliases=["wl_setup"], description="Setup welcome messages. You can attach an image to this command to set it as the background.")
    @commands.has_permissions(manage_guild=True)
    async def wl_setup_prefix(self, ctx: commands.Context, channel: discord.TextChannel, *, message: str = None):
        await _do_wl_setup(ctx, channel, message)

async def setup(bot: commands.Bot):
    from Commands.Welcome.welcome import welcome_group
    if "welcome" not in bot.all_commands:
        bot.add_command(welcome_group)
    await bot.add_cog(WelcomeSetupCog(bot))
