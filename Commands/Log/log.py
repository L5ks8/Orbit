import typing
import discord
from discord import app_commands
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator

from Commands.Log._storage import (
    load_log_config,
    setup_log,
    toggle_log_category,
    reset_log_config
)

class LogStatusLayout(LayoutView):
    def __init__(self, guild: discord.Guild, config: dict):
        super().__init__()
        enabled = config.get("enabled", False)
        ch_id = config.get("channel_id")
        ch_text = f"<#{ch_id}>" if ch_id else "`Not Set`"
        status_text = "`Active (Enabled)`" if enabled and ch_id else "`Inactive (Disabled)`"

        cats = config.get("categories", {})
        cats_lines = []
        for cat, state in cats.items():
            state_str = "`ON`" if state else "`OFF`"
            cats_lines.append(f"- **{cat.capitalize()}:** {state_str}")
        cats_display = "\n".join(cats_lines) if cats_lines else "No categories configured."

        self.container = Container(
            TextDisplay(content=f"### Logging System Status: **{guild.name}**\n**Status:** {status_text} | **Channel:** {ch_text}"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Log Categories:**\n{cats_display}")
        )
        self.add_item(self.container)

class LogSetupLayout(LayoutView):
    def __init__(self, channel: discord.TextChannel):
        super().__init__()
        self.container = Container(
            TextDisplay(content="### Logging System Configured"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Log Channel:** {channel.mention} (`{channel.id}`)\n**Status:** `Active`\n**Categories:** All standard log categories (`moderation`, `messages`, `members`, `channels`, `roles`, `voice`) are enabled by default.\nUse `/log toggle <category>` to enable or disable specific categories.")
        )
        self.add_item(self.container)

class LogToggleLayout(LayoutView):
    def __init__(self, category: str, new_state: bool):
        super().__init__()
        state_str = "`Enabled (ON)`" if new_state else "`Disabled (OFF)`"
        self.container = Container(
            TextDisplay(content=f"### Log Category Updated: `{category.capitalize()}`"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Category:** `{category}`\n**New State:** {state_str}")
        )
        self.add_item(self.container)

class LogResetLayout(LayoutView):
    def __init__(self, guild: discord.Guild):
        super().__init__()
        self.container = Container(
            TextDisplay(content=f"### Logging System Reset: **{guild.name}**"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content="**Status:** `Reset & Disabled`\nAll configured log channels and logging categories have been wiped and disabled.")
        )
        self.add_item(self.container)

async def _do_log_setup(ctx: commands.Context, channel: discord.TextChannel):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)
    setup_log(ctx.guild.id, channel.id)
    view = LogSetupLayout(channel)
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

async def _do_log_toggle(ctx: commands.Context, category: str):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)
    valid_cats = ["moderation", "messages", "members", "channels", "roles", "voice", "all"]
    cat = category.lower()
    if cat not in valid_cats:
        return await ctx.send(f"Invalid category `{category}`. Valid options: `moderation`, `messages`, `members`, `channels`, `roles`, `voice`, `all`.", ephemeral=True)
    config = toggle_log_category(ctx.guild.id, cat)
    if cat == "all":
        state = config.get("enabled", False)
    else:
        state = config.get("categories", {}).get(cat, False)
    view = LogToggleLayout(cat, state)
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

async def _do_log_reset(ctx: commands.Context):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)
    reset_log_config(ctx.guild.id)
    view = LogResetLayout(ctx.guild)
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

@commands.hybrid_group(name="log", description="Server logging system.")
@commands.has_permissions(manage_guild=True)
async def log_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        if not ctx.guild:
            return await ctx.send("This command must be run inside a server.", ephemeral=True)
        config = load_log_config(ctx.guild.id)
        view = LogStatusLayout(ctx.guild, config)
        await ctx.send(view=view, ephemeral=True, allowed_mentions=discord.AllowedMentions.none())

@log_group.command(name="setup", description="Configure and enable the server log channel.")
@commands.has_permissions(manage_guild=True)
@app_commands.describe(channel="The channel where log events will be posted")
async def log_setup_cmd(ctx: commands.Context, channel: discord.TextChannel):
    await _do_log_setup(ctx, channel)

@log_group.command(name="toggle", description="Turn specific logging categories on or off (`moderation`, `messages`, `members`, etc.).")
@commands.has_permissions(manage_guild=True)
@app_commands.describe(category="The log category to toggle on or off")
async def log_toggle_cmd(
    ctx: commands.Context,
    category: typing.Literal["moderation", "messages", "members", "channels", "roles", "voice", "all"]
):
    await _do_log_toggle(ctx, category)

@log_group.command(name="reset", description="Reset and turn off the server logging system.")
@commands.has_permissions(manage_guild=True)
async def log_reset_cmd(ctx: commands.Context):
    await _do_log_reset(ctx)

@log_group.error
async def log_group_error(ctx: commands.Context, error):
    if isinstance(error, commands.MissingPermissions):
        await ctx.send("You need Manage Server permission to manage server logs.", ephemeral=True)

class LogCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="log_setup", aliases=["logsetup"], hidden=True)
    @commands.has_permissions(manage_guild=True)
    async def log_setup_prefix(self, ctx: commands.Context, channel: discord.TextChannel):
        await _do_log_setup(ctx, channel)

    @commands.command(name="log_toggle", aliases=["logtoggle"], hidden=True)
    @commands.has_permissions(manage_guild=True)
    async def log_toggle_prefix(self, ctx: commands.Context, category: str):
        await _do_log_toggle(ctx, category)

    @commands.command(name="log_reset", aliases=["logreset"], hidden=True)
    @commands.has_permissions(manage_guild=True)
    async def log_reset_prefix(self, ctx: commands.Context):
        await _do_log_reset(ctx)

    @log_setup_cmd.error
    @log_setup_prefix.error
    async def log_setup_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Manage Server permission to set up logging.", ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage: `/log setup channel:#channel` or `-log setup #channel`", ephemeral=True)
        elif isinstance(error, commands.BadArgument):
            await ctx.send("Could not find that channel. Usage: `/log setup channel:#channel`", ephemeral=True)

    @log_toggle_cmd.error
    @log_toggle_prefix.error
    async def log_toggle_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Manage Server permission to toggle logging categories.", ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage: `/log toggle category:<name>` or `-log toggle <category>`", ephemeral=True)

    @log_reset_cmd.error
    @log_reset_prefix.error
    async def log_reset_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Manage Server permission to reset server logs.", ephemeral=True)

async def setup(bot: commands.Bot):
    if "log" not in bot.all_commands:
        bot.add_command(log_group)
    await bot.add_cog(LogCog(bot))
