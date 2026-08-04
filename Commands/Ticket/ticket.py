import io
import asyncio
import discord
from discord import app_commands
from discord.ext import commands


from Commands.Ticket._storage import (
    load_ticket_config,
    setup_ticket_config,
    reset_ticket_config,
    is_blacklisted,
    add_to_blacklist,
    remove_from_blacklist
)
from Commands.Ticket._views import (
    PersistentTicketPanelLayout,
    TicketControlLayout,
    close_ticket_flow
)

async def _do_ticket_add(ctx: commands.Context, member: discord.Member):
    await ctx.defer()
    if not ctx.guild or not isinstance(ctx.channel, discord.TextChannel):
        return await ctx.send("This command must be run inside a server ticket channel.", ephemeral=True)

    config = load_ticket_config(ctx.guild.id)
    support_role_id = config.get("support_role_id")
    ticket_data = config.get("active_tickets", {}).get(str(ctx.channel.id))

    if not ticket_data and not ctx.channel.name.startswith("ticket-"):
        return await ctx.send("This channel is not recognized as an active support ticket.", ephemeral=True)

    is_staff = ctx.author.guild_permissions.manage_guild
    if isinstance(ctx.author, discord.Member) and support_role_id:
        if any(r.id == support_role_id for r in getattr(ctx.author, 'roles', [])):
            is_staff = True

    if not is_staff:
        return await ctx.send("Only support staff or administrators can add members to tickets.", ephemeral=True)

    try:
        await ctx.channel.set_permissions(
            member,
            read_messages=True,
            send_messages=True,
            attach_files=True,
            read_message_history=True,
            reason=f"Added to ticket by {ctx.author}"
        )

        from Embeds import get_command_embed
        kwargs = get_command_embed(ctx.guild.id, "ticket", msg_type="add", channel_name=ctx.channel.name, member_mention=member.mention, member_id=member.id, author_mention=ctx.author.mention)
        await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())

    except discord.Forbidden:
        await ctx.send(f"I do not have permission to modify channel overwrites for {member.mention}.", ephemeral=True)
    except Exception as e:
        await ctx.send(f"An error occurred adding {member.mention} to the ticket: {e}", ephemeral=True)

async def _do_ticket_remove(ctx: commands.Context, member: discord.Member):
    await ctx.defer()
    if not ctx.guild or not isinstance(ctx.channel, discord.TextChannel):
        return await ctx.send("This command must be run inside a server ticket channel.", ephemeral=True)

    config = load_ticket_config(ctx.guild.id)
    support_role_id = config.get("support_role_id")
    ticket_data = config.get("active_tickets", {}).get(str(ctx.channel.id))

    if not ticket_data and not ctx.channel.name.startswith("ticket-"):
        return await ctx.send("This channel is not recognized as an active support ticket.", ephemeral=True)

    is_staff = ctx.author.guild_permissions.manage_guild
    if isinstance(ctx.author, discord.Member) and support_role_id:
        if any(r.id == support_role_id for r in getattr(ctx.author, 'roles', [])):
            is_staff = True

    if not is_staff:
        return await ctx.send("Only support staff or administrators can remove members from tickets.", ephemeral=True)

    if member.id == ctx.bot.user.id or member.guild_permissions.manage_guild:
        return await ctx.send("You cannot remove administrators or the bot from a ticket.", ephemeral=True)

    try:
        await ctx.channel.set_permissions(member, overwrite=None, reason=f"Removed from ticket by {ctx.author}")

        from Embeds import get_command_embed
        kwargs = get_command_embed(ctx.guild.id, "ticket", msg_type="remove", channel_name=ctx.channel.name, member_mention=member.mention, member_id=member.id, author_mention=ctx.author.mention)
        await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())

    except discord.Forbidden:
        await ctx.send(f"I do not have permission to modify channel overwrites for {member.mention}.", ephemeral=True)
    except Exception as e:
        await ctx.send(f"An error occurred removing {member.mention} from the ticket: {e}", ephemeral=True)

async def _do_ticket_close(ctx: commands.Context, reason: str):
    await ctx.defer()
    if not ctx.guild or not isinstance(ctx.channel, discord.TextChannel):
        return await ctx.send("This command must be run inside a server ticket channel.", ephemeral=True)

    config = load_ticket_config(ctx.guild.id)
    support_role_id = config.get("support_role_id")
    ticket_data = config.get("active_tickets", {}).get(str(ctx.channel.id))

    if not ticket_data and not ctx.channel.name.startswith("ticket-"):
        return await ctx.send("This channel is not recognized as an active support ticket.", ephemeral=True)

    creator_id = ticket_data.get("creator_id") if ticket_data else None
    is_authorized = ctx.author.id == creator_id or ctx.author.guild_permissions.manage_guild
    if isinstance(ctx.author, discord.Member) and support_role_id:
        if any(r.id == support_role_id for r in getattr(ctx.author, 'roles', [])):
            is_authorized = True

    if not is_authorized:
        return await ctx.send("You do not have permission to close this ticket (`Creator or Support Staff only`).", ephemeral=True)

    await ctx.send(f"Initiating ticket closure by {ctx.author.mention} (`Reason: {reason}`)...")
    asyncio.create_task(close_ticket_flow(ctx.guild, ctx.channel, ctx.author, reason))

async def _do_ticket_transcript(ctx: commands.Context):
    await ctx.defer()
    if not ctx.guild or not isinstance(ctx.channel, discord.TextChannel):
        return await ctx.send("This command must be run inside a server ticket channel.", ephemeral=True)

    config = load_ticket_config(ctx.guild.id)
    support_role_id = config.get("support_role_id")
    ticket_data = config.get("active_tickets", {}).get(str(ctx.channel.id))

    if not ticket_data and not ctx.channel.name.startswith("ticket-"):
        return await ctx.send("This channel is not recognized as an active support ticket.", ephemeral=True)

    creator_id = ticket_data.get("creator_id", "Unknown") if ticket_data else "Unknown"
    subject = ticket_data.get("subject", "Unknown") if ticket_data else "Unknown"

    is_authorized = ctx.author.id == creator_id or ctx.author.guild_permissions.manage_guild
    if isinstance(ctx.author, discord.Member) and support_role_id:
        if any(r.id == support_role_id for r in getattr(ctx.author, 'roles', [])):
            is_authorized = True

    if not is_authorized:
        return await ctx.send("You do not have permission to export transcripts for this ticket (`Creator or Support Staff only`).", ephemeral=True)

    messages = []
    try:
        async for m in ctx.channel.history(limit=500, oldest_first=True):
            messages.append(m)
    except Exception as e:
        return await ctx.send(f"Failed to fetch channel history: {e}", ephemeral=True)

    lines = [
        "=== TICKET TRANSCRIPT ===",
        f"Server: {ctx.guild.name} ({ctx.guild.id})",
        f"Ticket Channel: #{ctx.channel.name} ({ctx.channel.id})",
        f"Creator ID: {creator_id}",
        f"Subject: {subject}",
        f"Exported By: {ctx.author.display_name} ({ctx.author.id})",
        "=========================\n"
    ]

    for m in messages:
        timestamp = m.created_at.strftime("%Y-%m-%d %H:%M:%S")
        lines.append(f"[{timestamp}] {m.author.display_name} ({m.author.id}): {m.content}")
        t_str = m.created_at.strftime("%Y-%m-%d %H:%M:%S")
        avatar_url = m.author.display_avatar.url if m.author.display_avatar else "https://cdn.discordapp.com/embed/avatars/0.png"
        safe_content = html.escape(m.content or "")
        msgs_html.append(f'''        <div class="message">
            <div class="avatar"><img src="{avatar_url}"></div>
            <div class="msg-content">
                <div class="msg-header"><span class="msg-author">{html.escape(m.author.display_name)}</span><span class="msg-time">{t_str}</span></div>
                <div class="msg-text">{safe_content}</div>
            </div>
        </div>''')
    
    transcript_text = html_template + "\n".join(msgs_html) + "\n    </div>\n</body>\n</html>"
    file = discord.File(fp=io.BytesIO(transcript_text.encode("utf-8")), filename=f"transcript-{ctx.channel.name}.html")

    from Embeds import get_command_embed
    kwargs = get_command_embed(ctx.guild.id, "ticket", msg_type="transcript", channel_name=ctx.channel.name, channel_id=ctx.channel.id, subject=subject, messages_count=len(messages), creator_id=creator_id, executor_mention=ctx.author.mention, executor_id=ctx.author.id)
    await ctx.send(**kwargs, file=file, allowed_mentions=discord.AllowedMentions.none())

def _parse_duration(duration_str: str):
    if not duration_str:
        return None
    import re
    match = re.match(r"^(\d+)([smhd]?)$", duration_str.lower().strip())
    if not match:
        return None
    val = int(match.group(1))
    unit = match.group(2)
    if unit == 's': return val
    if unit == 'm': return val * 60
    if unit == 'h': return val * 3600
    if unit == 'd': return val * 86400
    return val

async def _do_ticket_blacklist(ctx: commands.Context, member: discord.Member, duration: str = None):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)
    if not ctx.author.guild_permissions.manage_guild:
        config = load_ticket_config(ctx.guild.id)
        support_role_id = config.get("support_role_id")
        if not support_role_id or not any(r.id == support_role_id for r in getattr(ctx.author, 'roles', [])):
            return await ctx.send("Only support staff or administrators can blacklist users.", ephemeral=True)
    
    dur_secs = _parse_duration(duration) if duration else None
    add_to_blacklist(ctx.guild.id, member.id, dur_secs)
    
    dur_text = f"for {duration}" if dur_secs else "permanently"
    await ctx.send(f"✅ {member.mention} has been blacklisted from opening tickets {dur_text}.")

async def _do_ticket_unblacklist(ctx: commands.Context, member: discord.Member):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)
    if not ctx.author.guild_permissions.manage_guild:
        config = load_ticket_config(ctx.guild.id)
        support_role_id = config.get("support_role_id")
        if not support_role_id or not any(r.id == support_role_id for r in getattr(ctx.author, 'roles', [])):
            return await ctx.send("Only support staff or administrators can unblacklist users.", ephemeral=True)
    
    removed = remove_from_blacklist(ctx.guild.id, member.id)
    if removed:
        await ctx.send(f"✅ {member.mention} has been removed from the ticket blacklist.")
    else:
        await ctx.send(f"⚠️ {member.mention} was not blacklisted.", ephemeral=True)

@commands.hybrid_group(name="ticket", description="Support ticket tools.")
@commands.has_permissions(manage_channels=True)
async def ticket_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        await ctx.send("Use: `add`, `remove`, `close`, or `transcript`.", ephemeral=True)

@ticket_group.command(name="add", description="Add a member to a ticket")
@app_commands.describe(member="The member to grant access to this ticket")
async def ticket_add_cmd(ctx: commands.Context, member: discord.Member):
    await _do_ticket_add(ctx, member)

@ticket_group.command(name="remove", description="Remove a member from a ticket")
@app_commands.describe(member="The member to remove from this ticket")
async def ticket_remove_cmd(ctx: commands.Context, member: discord.Member):
    await _do_ticket_remove(ctx, member)

@ticket_group.command(name="close", description="Close the current ticket")
@app_commands.describe(reason="Optional explanation for why the ticket is being closed")
async def ticket_close_cmd(ctx: commands.Context, reason: str = "Closed via command"):
    await _do_ticket_close(ctx, reason)

@ticket_group.command(name="transcript", description="Export this ticket transcript")
async def ticket_transcript_cmd(ctx: commands.Context):
    await _do_ticket_transcript(ctx)

@ticket_group.command(name="blacklist", description="Blacklist a user from opening tickets")
@app_commands.describe(member="The user to blacklist", duration="Duration (e.g. 1d, 2h). Leave empty for permanent.")
async def ticket_blacklist_cmd(ctx: commands.Context, member: discord.Member, duration: str = None):
    await _do_ticket_blacklist(ctx, member, duration)

@ticket_group.command(name="unblacklist", description="Remove a user from the ticket blacklist")
@app_commands.describe(member="The user to unblacklist")
async def ticket_unblacklist_cmd(ctx: commands.Context, member: discord.Member):
    await _do_ticket_unblacklist(ctx, member)

class TicketCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="tk_add", aliases=["ticketadd"], hidden=True)
    async def tk_add_prefix(self, ctx: commands.Context, member: discord.Member):
        await _do_ticket_add(ctx, member)

    @commands.command(name="tk_remove", aliases=["ticketremove"], hidden=True)
    async def tk_remove_prefix(self, ctx: commands.Context, member: discord.Member):
        await _do_ticket_remove(ctx, member)

    @commands.command(name="tk_close", aliases=["ticketclose"], hidden=True)
    async def tk_close_prefix(self, ctx: commands.Context, *, reason: str = "Closed via command"):
        await _do_ticket_close(ctx, reason)

    @commands.command(name="tk_transcript", aliases=["tickettranscript"], hidden=True)
    async def tk_transcript_prefix(self, ctx: commands.Context):
        await _do_ticket_transcript(ctx)

    @commands.command(name="tk_blacklist", aliases=["ticketblacklist"], hidden=True)
    async def tk_blacklist_prefix(self, ctx: commands.Context, member: discord.Member, *, duration: str = None):
        await _do_ticket_blacklist(ctx, member, duration)

    @commands.command(name="tk_unblacklist", aliases=["ticketunblacklist"], hidden=True)
    async def tk_unblacklist_prefix(self, ctx: commands.Context, member: discord.Member):
        await _do_ticket_unblacklist(ctx, member)

    @ticket_add_cmd.error
    async def add_error(self, ctx: commands.Context, error):
        await ctx.send(f"Ticket add failed: {error}", ephemeral=True)

    @ticket_remove_cmd.error
    async def remove_error(self, ctx: commands.Context, error):
        await ctx.send(f"Ticket remove failed: {error}", ephemeral=True)

    @ticket_close_cmd.error
    async def close_error(self, ctx: commands.Context, error):
        await ctx.send(f"Ticket close failed: {error}", ephemeral=True)

    @ticket_transcript_cmd.error
    async def transcript_error(self, ctx: commands.Context, error):
        await ctx.send(f"Ticket transcript failed: {error}", ephemeral=True)

    @ticket_blacklist_cmd.error
    async def blacklist_error(self, ctx: commands.Context, error):
        await ctx.send(f"Ticket blacklist failed: {error}", ephemeral=True)

    @ticket_unblacklist_cmd.error
    async def unblacklist_error(self, ctx: commands.Context, error):
        await ctx.send(f"Ticket unblacklist failed: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    if "ticket" not in bot.all_commands:
        bot.add_command(ticket_group)
    await bot.add_cog(TicketCog(bot))

