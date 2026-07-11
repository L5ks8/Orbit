import discord
from discord import app_commands
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Role._group import role_group

PERMISSION_MAP = {
    "visible": "view_channel",
    "send": "send_messages",
    "react": "add_reactions",
    "embed": "embed_links",
    "attach": "attach_files",
    "history": "read_message_history",
    "mention": "mention_everyone",
    "voice_connect": "connect",
    "voice_speak": "speak",
    "voice_video": "stream",
    "manage_messages": "manage_messages",
    "manage_channels": "manage_channels",
    "manage_roles": "manage_roles",
}

PERMISSION_CHOICES = [app_commands.Choice(name=k, value=k) for k in PERMISSION_MAP]

class RoleSettingsResultLayout(LayoutView):
    def __init__(self, role: discord.Role, permission_label: str, state: str, success: int, failed: int, skipped: int, moderator: discord.Member):
        super().__init__()
        state_display = "✅ Enabled" if state == "on" else ("❌ Disabled" if state == "off" else "↩️ Reset (Neutral)")
        header_str = f"### Role Channel Permission Updated\n**Role:** {role.mention} (`{role.id}`)"
        info_str = (
            f"**Permission:** `{permission_label}`\n"
            f"**New State:** {state_display}\n"
            f"**Channels Modified:** `{success}` | **Failed:** `{failed}` | **Skipped:** `{skipped}`\n"
            f"**Moderator:** {moderator.mention}"
        )
        self.container = Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=info_str)
        )
        self.add_item(self.container)

@role_group.command(name="settings", description="Set a permission for a role across every channel and category.")
@commands.has_permissions(administrator=True)
@commands.bot_has_permissions(manage_roles=True)
@app_commands.describe(
    role="The role to configure permissions for",
    permission="The permission to change across all channels",
    state="Enable, disable, or reset the permission"
)
@app_commands.choices(
    permission=PERMISSION_CHOICES,
    state=[
        app_commands.Choice(name="on", value="on"),
        app_commands.Choice(name="off", value="off"),
        app_commands.Choice(name="reset", value="reset"),
    ]
)
async def role_settings_cmd(ctx: commands.Context, role: discord.Role, permission: str, state: str):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)

    perm_key = PERMISSION_MAP.get(permission.lower())
    if not perm_key:
        valid = ", ".join(f"`{k}`" for k in PERMISSION_MAP)
        return await ctx.send(f"Unknown permission `{permission}`. Valid options: {valid}", ephemeral=True)

    if state.lower() not in ("on", "off", "reset"):
        return await ctx.send("State must be `on`, `off`, or `reset`.", ephemeral=True)

    if role >= ctx.guild.me.top_role:
        return await ctx.send("I cannot modify overwrites for a role that is higher than or equal to my highest role.", ephemeral=True)

    perm_value = True if state.lower() == "on" else (False if state.lower() == "off" else None)

    success = 0
    failed = 0
    skipped = 0

    all_channels = list(ctx.guild.channels)
    for channel in all_channels:
        if isinstance(channel, (discord.VoiceChannel, discord.StageChannel)) and perm_key in ("send_messages", "embed_links", "attach_files"):
            skipped += 1
            continue
        if isinstance(channel, discord.TextChannel) and perm_key in ("connect", "speak", "stream"):
            skipped += 1
            continue

        try:
            overwrites = channel.overwrites_for(role)
            current_value = getattr(overwrites, perm_key, None)
            if current_value == perm_value:
                skipped += 1
                continue
            setattr(overwrites, perm_key, perm_value)
            await channel.set_permissions(role, overwrite=overwrites, reason=f"Role settings by {ctx.author}: {permission} -> {state}")
            success += 1
        except discord.Forbidden:
            failed += 1
        except Exception:
            failed += 1

    view = RoleSettingsResultLayout(role, permission, state.lower(), success, failed, skipped, ctx.author)
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

@role_settings_cmd.error
async def role_settings_error(ctx: commands.Context, error):
    if isinstance(error, commands.MissingPermissions):
        await ctx.send("You need Administrator permission to use role settings.", ephemeral=True)
    elif isinstance(error, commands.BotMissingPermissions):
        await ctx.send("I need Manage Roles permission to modify channel overwrites.", ephemeral=True)
    elif isinstance(error, commands.MissingRequiredArgument):
        await ctx.send("Usage: `-role settings <@role> <permission> <on/off/reset>`", ephemeral=True)
    elif isinstance(error, (commands.RoleNotFound, commands.BadArgument)):
        await ctx.send("Role not found. Make sure to mention or type the exact role name.", ephemeral=True)
    else:
        await ctx.send(f"An error occurred: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    if "role" not in bot.all_commands:
        bot.add_command(role_group)
