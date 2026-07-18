import io
import asyncio
import discord
from discord import app_commands
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator

from Commands.Ticket._storage import (
    load_ticket_config,
    setup_ticket_config,
    reset_ticket_config
)
from Commands.Ticket._views import (
    PersistentTicketPanelLayout,
    TicketControlLayout,
    TicketConfigDynamicView,
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

        header_str = f"### Member Added to Ticket: **#{ctx.channel.name}**\n**Status:** Access Granted"
        info_str = f"**User Added:** {member.mention} (`{member.id}`)\n**Added By:** {ctx.author.mention}"

        container = Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=info_str)
        )
        status_view = LayoutView()
        status_view.add_item(container)
        await ctx.send(view=status_view, allowed_mentions=discord.AllowedMentions.none())

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

        header_str = f"### Member Removed from Ticket: **#{ctx.channel.name}**\n**Status:** Access Revoked"
        info_str = f"**User Removed:** {member.mention} (`{member.id}`)\n**Removed By:** {ctx.author.mention}"

        container = Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=info_str)
        )
        status_view = LayoutView()
        status_view.add_item(container)
        await ctx.send(view=status_view, allowed_mentions=discord.AllowedMentions.none())

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
        for att in m.attachments:
            lines.append(f"  [Attachment] {att.url}")
        for embed in m.embeds:
            title = embed.title or ""
            desc = embed.description or ""
            if title or desc:
                lines.append(f"  [Embed] {title} | {desc}")

    file_bytes = "\n".join(lines).encode("utf-8")
    file = discord.File(io.BytesIO(file_bytes), filename=f"transcript-{ctx.channel.name}.txt")

    section_closed = f"### Ticket Transcript Generated\n**Ticket:** `#{ctx.channel.name}` (`{ctx.channel.id}`)"
    section_close_info = (
        f"**Subject:** `{subject}`\n"
        f"**Messages Archived:** `{len(messages)}`"
    )
    section_creator_info = f"**Creator ID:** `{creator_id}`"
    section_executor_info = f"**Exported By:** {ctx.author.mention} (`{ctx.author.id}`)"

    container = Container(
        TextDisplay(content=section_closed),
        Separator(spacing=discord.SeparatorSpacing.small),
        TextDisplay(content=section_close_info),
        Separator(spacing=discord.SeparatorSpacing.small),
        TextDisplay(content=section_creator_info),
        Separator(spacing=discord.SeparatorSpacing.small),
        TextDisplay(content=section_executor_info)
    )
    view = LayoutView()
    view.add_item(container)
    await ctx.send(view=view, file=file, allowed_mentions=discord.AllowedMentions.none())

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

async def setup(bot: commands.Bot):
    if "ticket" not in bot.all_commands:
        bot.add_command(ticket_group)
    await bot.add_cog(TicketCog(bot))

