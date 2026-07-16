import discord
from discord import app_commands
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.JoinToCreate.tempvoice import tempvoice_group
from Database.storagehandler import load_jtc_config, save_jtc_config

async def _do_jtc_setup(ctx: commands.Context, channel: discord.VoiceChannel, category: discord.CategoryChannel, default_user_limit: int = 0):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)

    if default_user_limit < 0 or default_user_limit > 99:
        default_user_limit = 0

    config = await load_jtc_config(ctx.guild.id)
    config["enabled"] = True
    config["hub_channel_id"] = channel.id
    config["category_id"] = category.id
    config["default_user_limit"] = default_user_limit
    await save_jtc_config(ctx.guild.id, config)

    header_str = "### Temp Voice Setup Complete"
    info_str = (
        f"**Channel:** {channel.mention} (`{channel.id}`)\n"
        f"**Category:** `{category.name}`\n"
        f"**Default User Limit:** `{'Unlimited' if default_user_limit == 0 else default_user_limit}`\n\n"
        f"-# Whenever a user joins **{channel.name}**, Orbit will dynamically create a temporary voice channel with a control panel!"
    )

    container = Container(
        TextDisplay(content=header_str),
        Separator(spacing=discord.SeparatorSpacing.small),
        TextDisplay(content=info_str)
    )
    view = LayoutView()
    view.add_item(container)

    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

@tempvoice_group.command(name="setup", description="Configure temporary voice channels.")
@commands.has_permissions(manage_guild=True, manage_channels=True)
@app_commands.describe(
    channel="The voice channel users join to create a temp channel",
    category="The category where temp voice channels will be created",
    default_user_limit="Default user limit for new temp voice channels (0 for unlimited)"
)
async def jtc_setup_cmd(ctx: commands.Context, channel: discord.VoiceChannel, category: discord.CategoryChannel, default_user_limit: int = 0):
    await _do_jtc_setup(ctx, channel, category, default_user_limit)

class JTCSetupCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @jtc_setup_cmd.error
    async def jtc_setup_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Manage Server and Manage Channels permissions to setup Temp Voice.", ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage: `-tempvoice setup <#voice_channel> <#category> [user_limit]`", ephemeral=True)
        elif isinstance(error, (commands.ChannelNotFound, commands.BadArgument)):
            await ctx.send("Could not find the specified channel or category.", ephemeral=True)
        else:
            await ctx.send(f"An error occurred during setup: {error}", ephemeral=True)

class JTCSetupPrefixFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="tv_setup", aliases=["tempvoicesetup", "jtcsetup"], hidden=True)
    @commands.has_permissions(manage_guild=True, manage_channels=True)
    async def jtc_setup_prefix(self, ctx: commands.Context, channel: discord.VoiceChannel, category: discord.CategoryChannel, default_user_limit: int = 0):
        await _do_jtc_setup(ctx, channel, category, default_user_limit)

async def setup(bot: commands.Bot):
    from Commands.JoinToCreate.tempvoice import tempvoice_group
    if "tempvoice" not in bot.all_commands:
        bot.add_command(tempvoice_group)
    await bot.add_cog(JTCSetupCog(bot))
    await bot.add_cog(JTCSetupPrefixFallback(bot))
