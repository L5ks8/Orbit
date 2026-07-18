import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Warn._storage import add_warning, get_user_warnings
from Commands.Whitelist._storage import is_whitelisted
from Commands.Log._storage import log_event
from Commands._utils import MemberOrIDConverter, format_usage

class WarnIssuedLayout(LayoutView):
    def __init__(self, member: discord.Member, warn_entry: dict, total_warns: int):
        super().__init__()
        header_str = (
            f"### ⚠️ Warning Issued: {member.mention}\n"
            f"**Warn ID:** `{warn_entry['warn_id']}` | **Total Warnings:** `{total_warns}`"
        )
        info_str = (
            f"**Moderator:** <@{warn_entry['moderator_id']}>\n"
            f"**Reason:** {warn_entry['reason']}\n"
            f"**Date:** <t:{warn_entry['timestamp']}:f> (<t:{warn_entry['timestamp']}:R>)"
        )
        self.container = Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=info_str)
        )
        self.add_item(self.container)

async def _do_warn_add(ctx: commands.Context, user: discord.Member, reason: str):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)
    if user.id == ctx.author.id:
        return await ctx.send("You cannot warn yourself.", ephemeral=True)
    if is_whitelisted(ctx.guild.id, user.id):
        return await ctx.send("This user is on the global moderation whitelist (`Immune to Warnings`).", ephemeral=True)
    if user.top_role >= ctx.author.top_role and ctx.author != ctx.guild.owner:
        return await ctx.send("You cannot warn a user with an equal or higher role.", ephemeral=True)
    warn_entry = add_warning(ctx.guild.id, user.id, reason, ctx.author.id)
    warns = get_user_warnings(ctx.guild.id, user.id)
    total_warns = len(warns)
    
    import datetime
    punishment_text = ""
    duration = None
    if total_warns == 2:
        duration = datetime.timedelta(minutes=15)
        punishment_text = "\n**Automatic Action:** +15m Timeout"
    elif total_warns == 3:
        duration = datetime.timedelta(minutes=45)
        punishment_text = "\n**Automatic Action:** +45m Timeout"
    elif total_warns == 4:
        duration = datetime.timedelta(days=1)
        punishment_text = "\n**Automatic Action:** +1d Timeout"
    elif total_warns == 5:
        duration = datetime.timedelta(days=3)
        punishment_text = "\n**Automatic Action:** +3d Timeout"
    elif total_warns >= 6:
        punishment_text = "\n**Automatic Action:** Kicked from server (6 Warnings Limit Reached)"
        try:
            await user.kick(reason=f"Automatic kick: Reached {total_warns} warnings.")
            from Commands.Warn._storage import clear_user_warnings
            clear_user_warnings(ctx.guild.id, user.id)
        except discord.Forbidden:
            punishment_text = "\n**Automatic Action:** Failed to kick user (Missing Permissions)"
        except Exception as e:
            punishment_text = f"\n**Automatic Action:** Failed to kick user ({e})"

    if duration:
        try:
            new_until = discord.utils.utcnow() + duration
            if user.is_timed_out() and user.timed_out_until:
                new_until = user.timed_out_until + duration
            
            max_until = discord.utils.utcnow() + datetime.timedelta(days=28)
            if new_until > max_until:
                new_until = max_until
                
            await user.timeout(new_until, reason=f"Automatic punishment for {total_warns} warnings")
        except discord.Forbidden:
            punishment_text = "\n**Automatic Action:** Failed to apply timeout (Missing Permissions)"
        except Exception as e:
            punishment_text = f"\n**Automatic Action:** Failed to apply timeout ({e})"

    try:
        dm_view = LayoutView()
        dm_header = f"### ⚠️ Formal Warning Received\n**Server:** `{ctx.guild.name}`"
        dm_info = f"**Warn ID:** `{warn_entry['warn_id']}`\n**Reason:** {reason}{punishment_text}"
        dm_container = Container(
            TextDisplay(content=dm_header),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=dm_info)
        )
        dm_view.add_item(dm_container)
        await user.send(view=dm_view)
    except Exception:
        pass
    try:
        await ctx.message.delete()
    except Exception:
        pass
    view = WarnIssuedLayout(user, warn_entry, total_warns)
    await log_event(
        ctx.guild,
        "moderation_action",
        "User Warned (`-warn`)",
        f"**Target:** {user.mention} (`{user.id}`)\n**Moderator:** {ctx.author.mention} (`{ctx.author.id}`)\n**Warn ID:** `{warn_entry['warn_id']}`\n**Total Warnings:** `{total_warns}`\n**Reason:** {reason}{punishment_text}"
    )
    await ctx.send(view=view, delete_after=5, allowed_mentions=discord.AllowedMentions.none())

@commands.hybrid_command(
    name="warn",
    description="Issue a formal warning to a member."
)
@commands.has_permissions(moderate_members=True)
async def warn_cmd(ctx: commands.Context, user: discord.Member, *, reason: str = "No reason provided."):
    await _do_warn_add(ctx, user, reason)

@warn_cmd.error
async def warn_cmd_error(ctx: commands.Context, error):
    if isinstance(error, commands.MissingPermissions):
        await ctx.send("You need Moderate Members permission to issue warnings.", ephemeral=True)
    elif isinstance(error, commands.MissingRequiredArgument):
        await ctx.send(format_usage("-warn", "<@member>", "[reason]"), ephemeral=True)
    elif isinstance(error, commands.BadArgument):
        await ctx.send("Could not find that member. Usage: `-warn <@member> [reason]`", ephemeral=True)

async def setup(bot: commands.Bot):
    if "warn" not in bot.all_commands:
        bot.add_command(warn_cmd)

