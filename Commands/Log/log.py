import typing
import discord
from discord import app_commands
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, Button, ActionRow

from Commands.Log._storage import (
    load_log_config,
    setup_log,
    toggle_log_category,
    reset_log_config
)

class LogToggleDashboard(LayoutView):
    def __init__(self, guild: discord.Guild, config: dict):
        super().__init__(timeout=300)
        self.guild = guild
        self.config = config
        self._build_items()

    def _build_items(self):
        self.clear_items()
        enabled = self.config.get("enabled", False)
        ch_id = self.config.get("channel_id")
        ch_text = f"<#{ch_id}>" if ch_id else "`Not Set`"
        status_text = "`Active (ON)`" if enabled and any(self.config.get("channels", {}).values()) else "`Inactive (Disabled)`"

        cats_map = self.config.get("channels", {})
        cats_lines = []
        for cat in ["moderation", "messages", "members", "channels", "roles", "voice"]:
            assigned_ch = cats_map.get(cat)
            if assigned_ch and enabled:
                state_str = f"`Active` -> <#{assigned_ch}>"
            else:
                state_str = "`OFF (Disabled)`"
            cats_lines.append(f"- **{cat.capitalize()}:** {state_str}")
        cats_display = "\n".join(cats_lines) if cats_lines else "No categories configured."

        container = Container(
            TextDisplay(content=f"### Interactive Log Control Panel: **{self.guild.name}**\n**System Status:** {status_text} | **Master Channel:** {ch_text}"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Category Channels & States:**\n{cats_display}\n\n*Click the buttons below to toggle individual log categories ON/OFF right now.*")
        )
        self.add_item(container)

        btn_mod = Button(
            label="Moderation",
            style=discord.ButtonStyle.success if cats_map.get("moderation") and enabled else discord.ButtonStyle.secondary
        )
        btn_msg = Button(
            label="Messages",
            style=discord.ButtonStyle.success if cats_map.get("messages") and enabled else discord.ButtonStyle.secondary
        )
        btn_mem = Button(
            label="Members",
            style=discord.ButtonStyle.success if cats_map.get("members") and enabled else discord.ButtonStyle.secondary
        )

        btn_ch = Button(
            label="Channels",
            style=discord.ButtonStyle.success if cats_map.get("channels") and enabled else discord.ButtonStyle.secondary
        )
        btn_role = Button(
            label="Roles",
            style=discord.ButtonStyle.success if cats_map.get("roles") and enabled else discord.ButtonStyle.secondary
        )
        btn_vc = Button(
            label="Voice",
            style=discord.ButtonStyle.success if cats_map.get("voice") and enabled else discord.ButtonStyle.secondary
        )

        all_on = enabled and any(v is not None for v in cats_map.values())
        btn_all = Button(
            label="Disable All" if all_on else "Enable All",
            style=discord.ButtonStyle.danger if all_on else discord.ButtonStyle.primary
        )

        btn_mod.callback = lambda i: self._handle_toggle(i, "moderation")
        btn_msg.callback = lambda i: self._handle_toggle(i, "messages")
        btn_mem.callback = lambda i: self._handle_toggle(i, "members")
        btn_ch.callback = lambda i: self._handle_toggle(i, "channels")
        btn_role.callback = lambda i: self._handle_toggle(i, "roles")
        btn_vc.callback = lambda i: self._handle_toggle(i, "voice")
        btn_all.callback = lambda i: self._handle_toggle(i, "all")

        self.add_item(ActionRow(btn_mod, btn_msg, btn_mem))
        self.add_item(ActionRow(btn_ch, btn_role, btn_vc))
        self.add_item(ActionRow(btn_all))

    async def _handle_toggle(self, interaction: discord.Interaction, cat: str):
        if not interaction.user.guild_permissions.manage_guild:
            return await interaction.response.send_message("You need Manage Server permission to change log settings.", ephemeral=True)
        self.config = toggle_log_category(interaction.guild.id, cat)
        self._build_items()
        await interaction.response.edit_message(view=self)

class LogStatusLayout(LayoutView):
    def __init__(self, guild: discord.Guild, config: dict):
        super().__init__()
        enabled = config.get("enabled", False)
        ch_id = config.get("channel_id")
        ch_text = f"<#{ch_id}>" if ch_id else "`Not Set`"
        status_text = "`Active (Enabled)`" if enabled and any(config.get("channels", {}).values()) else "`Inactive (Disabled)`"

        cats_map = config.get("channels", {})
        cats_lines = []
        for cat in ["moderation", "messages", "members", "channels", "roles", "voice"]:
            assigned_ch = cats_map.get(cat)
            if assigned_ch and enabled:
                state_str = f"`Active` -> <#{assigned_ch}>"
            else:
                state_str = "`OFF (Disabled)`"
            cats_lines.append(f"- **{cat.capitalize()}:** {state_str}")
        cats_display = "\n".join(cats_lines) if cats_lines else "No categories configured."

        self.container = Container(
            TextDisplay(content=f"### Logging System Status: **{guild.name}**\n**Status:** {status_text} | **Master Channel:** {ch_text}"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Category Channels:**\n{cats_display}")
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

async def _do_log_setup(
    ctx: commands.Context,
    channel: discord.TextChannel = None,
    moderation: discord.TextChannel = None,
    messages: discord.TextChannel = None,
    members: discord.TextChannel = None,
    channels: discord.TextChannel = None,
    roles: discord.TextChannel = None,
    voice: discord.TextChannel = None
):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)

    default_ch_id = channel.id if channel else None
    if default_ch_id is None and all(ch is None for ch in [moderation, messages, members, channels, roles, voice]):
        if isinstance(ctx.channel, discord.TextChannel):
            default_ch_id = ctx.channel.id

    overrides = {}
    if moderation: overrides["moderation"] = moderation.id
    if messages: overrides["messages"] = messages.id
    if members: overrides["members"] = members.id
    if channels: overrides["channels"] = channels.id
    if roles: overrides["roles"] = roles.id
    if voice: overrides["voice"] = voice.id

    config = setup_log(ctx.guild.id, default_channel_id=default_ch_id, channel_overrides=overrides)
    view = LogToggleDashboard(ctx.guild, config)
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

async def _do_log_toggle(ctx: commands.Context, category: str = None):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)
    if category and category.lower() in ["moderation", "messages", "members", "channels", "roles", "voice", "all"]:
        config = toggle_log_category(ctx.guild.id, category.lower())
    else:
        config = load_log_config(ctx.guild.id)
    view = LogToggleDashboard(ctx.guild, config)
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
        view = LogToggleDashboard(ctx.guild, config)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

@log_group.command(name="setup", description="Assign specific or shared channels to server log categories.")
@commands.has_permissions(manage_guild=True)
@app_commands.describe(
    channel="Optional: Master channel for all categories not specified below",
    moderation="Optional: Specific channel for moderation logs (bans, timeouts)",
    messages="Optional: Specific channel for message edits/deletions",
    members="Optional: Specific channel for member joins/leaves/nicks",
    channels="Optional: Specific channel for channel creation/deletion",
    roles="Optional: Specific channel for role changes",
    voice="Optional: Specific channel for voice activity"
)
async def log_setup_cmd(
    ctx: commands.Context,
    channel: discord.TextChannel = None,
    moderation: discord.TextChannel = None,
    messages: discord.TextChannel = None,
    members: discord.TextChannel = None,
    channels: discord.TextChannel = None,
    roles: discord.TextChannel = None,
    voice: discord.TextChannel = None
):
    await _do_log_setup(ctx, channel, moderation, messages, members, channels, roles, voice)

@log_group.command(name="toggle", description="Interactive toggle board for turning log categories ON or OFF.")
@commands.has_permissions(manage_guild=True)
@app_commands.describe(category="Optional: Specific category to toggle (moderation, messages, members, channels, roles, voice, all)")
async def log_toggle_cmd(
    ctx: commands.Context,
    category: typing.Literal["moderation", "messages", "members", "channels", "roles", "voice", "all"] = None
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
    async def log_setup_prefix(self, ctx: commands.Context, channel: discord.TextChannel = None):
        await _do_log_setup(ctx, channel)

    @commands.command(name="log_toggle", aliases=["logtoggle"], hidden=True)
    @commands.has_permissions(manage_guild=True)
    async def log_toggle_prefix(self, ctx: commands.Context, category: str = None):
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
        elif isinstance(error, commands.BadArgument):
            await ctx.send("Could not find that channel. Usage: `/log setup channel:#channel`", ephemeral=True)

    @log_toggle_cmd.error
    @log_toggle_prefix.error
    async def log_toggle_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Manage Server permission to toggle logging categories.", ephemeral=True)

    @log_reset_cmd.error
    @log_reset_prefix.error
    async def log_reset_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Manage Server permission to reset server logs.", ephemeral=True)

async def setup(bot: commands.Bot):
    if "log" not in bot.all_commands:
        bot.add_command(log_group)
    await bot.add_cog(LogCog(bot))
