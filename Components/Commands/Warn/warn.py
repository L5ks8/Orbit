import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Components.Commands.Warn._storage import add_warning, get_user_warnings
from Components.Dashboard.Automoderation.log_storage import log_event
from Components.Commands.ModLog._modlog_storage import add_modlog
from Components.Commands.Cases._storage import create_case
from Components.Commands._utils import MemberOrIDConverter, format_usage, make_embed
from Components.Commands.Whitelist._storage import is_whitelisted



async def _do_warn_add(ctx: commands.Context, user: discord.Member | discord.User, reason: str):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send(embed=make_embed("This command must be run inside a server.", discord.Color.red()), ephemeral=True)
    if user.id == ctx.author.id:
        return await ctx.send(embed=make_embed("You cannot warn yourself.", discord.Color.red()), ephemeral=True)
        
    from Components.Commands._utils import is_immune, make_embed
    if is_immune(ctx.guild.id, user):
        return await ctx.send(embed=make_embed("This user is immune to moderation actions.", discord.Color.red()), ephemeral=True)
        
    if is_whitelisted(ctx.guild.id, user.id):
        return await ctx.send(embed=make_embed("This user is on the global moderation whitelist (`Immune to Warnings`).", discord.Color.red()), ephemeral=True)
    if isinstance(user, discord.Member):
        if user.top_role >= ctx.author.top_role and ctx.author != ctx.guild.owner:
            return await ctx.send(embed=make_embed("You cannot warn a user with an equal or higher role.", discord.Color.red()), ephemeral=True)

    warn_entry = add_warning(ctx.guild.id, user.id, reason, ctx.author.id)
    case_id = create_case(ctx.guild.id, user.id, ctx.author.id, "warn", reason)
    add_modlog(ctx.guild.id, user.id, ctx.author.id, "Warn", reason)
    warns = get_user_warnings(ctx.guild.id, user.id)
    total_warns = len(warns)
    
    import datetime
    punishment_text = ""
    duration = None
    if isinstance(user, discord.Member):
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
                from Components.Commands.Warn._storage import clear_user_warnings
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
        dm_embed = discord.Embed(title=f"️ Formal Warning Received", color=discord.Color.red())
        dm_embed.add_field(name="Server", value=ctx.guild.name, inline=False)
        dm_embed.add_field(name="Warn ID", value=f"`{warn_entry['warn_id']}`", inline=False)
        dm_embed.add_field(name="Reason", value=f"{reason}{punishment_text}", inline=False)
        
        from Components.Commands.Appeals._storage import load_appeals_config
        appeals_cfg = load_appeals_config(ctx.guild.id)
        if appeals_cfg.get("enabled"):
            allowed = appeals_cfg.get("allowed_punishments", [])
            if "warn" in allowed:
                custom_url = appeals_cfg.get("custom_url", "orbit")
                import urllib.parse
                encoded_url = urllib.parse.quote(custom_url)
                import os
                base_url = os.environ.get("BASE_URL")
                dm_embed.add_field(name="Appeals", value=f"You can appeal this warning at: {base_url}/appeal/{encoded_url}", inline=False)

        await user.send(embed=dm_embed)
    except Exception:
        pass
    try:
        await ctx.message.delete()
    except Exception:
        pass
    public_embed = discord.Embed(title=f"️ Warning Issued", color=discord.Color.orange())
    public_embed.add_field(name="User", value=user.mention, inline=False)
    public_embed.add_field(name="Warn ID", value=f"`{warn_entry['warn_id']}`", inline=True)
    public_embed.add_field(name="Total Warnings", value=f"`{total_warns}`", inline=True)
    public_embed.add_field(name="Moderator", value=f"<@{warn_entry['moderator_id']}>", inline=False)
    public_embed.add_field(name="Reason", value=warn_entry['reason'], inline=False)
    public_embed.add_field(name="Date", value=f"<t:{warn_entry['timestamp']}:f> (<t:{warn_entry['timestamp']}:R>)", inline=False)
    
    await log_event(
        ctx.guild,
        "moderation_action",
        "User Warned (`-warn`)",
        f"**Target:** {user.mention} (`{user.id}`)\n**Moderator:** {ctx.author.mention} (`{ctx.author.id}`)\n**Warn ID:** `{warn_entry['warn_id']}`\n**Total Warnings:** `{total_warns}`\n**Reason:** {reason}{punishment_text}"
    )
    
    await ctx.send(embed=public_embed, delete_after=5, allowed_mentions=discord.AllowedMentions.none())

@commands.hybrid_command(
    name="warn",
    description="Issue a formal warning to a member or user ID (`-warn <@member|ID> [reason]`)."
)
@commands.has_permissions(moderate_members=True)
async def warn_cmd(ctx: commands.Context, user: str, *, reason: str = "No reason provided."):
    resolved_user = await MemberOrIDConverter().convert(ctx, user)
    await _do_warn_add(ctx, resolved_user, reason)

@warn_cmd.error
async def warn_cmd_error(ctx: commands.Context, error):
    if isinstance(error, commands.MissingPermissions):
        await ctx.send(embed=make_embed("You need Moderate Members permission to issue warnings.", discord.Color.red()), ephemeral=True)
    elif isinstance(error, commands.MissingRequiredArgument):
        await ctx.send(embed=make_embed(format_usage("-warn", "<@member/ID>", "[reason]"), discord.Color.red()), ephemeral=True)
    elif isinstance(error, commands.BadArgument):
        await ctx.send(embed=make_embed(f"Error: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    if "warn" not in bot.all_commands:
        bot.add_command(warn_cmd)



