import io
import discord
from discord import app_commands
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Ticket._storage import load_ticket_config
from Commands.Ticket.ticket import ticket_group

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

@ticket_group.command(name="transcript", description="Export a transcript of this ticket.")
async def transcript_cmd(ctx: commands.Context):
    await _do_ticket_transcript(ctx)

class TicketTranscriptCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @transcript_cmd.error
    async def transcript_error(self, ctx: commands.Context, error):
        await ctx.send(f"An error occurred exporting the transcript: {error}", ephemeral=True)

class TicketTranscriptFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="tk_transcript", aliases=["tickettranscript"], hidden=True)
    async def transcript_prefix(self, ctx: commands.Context):
        await _do_ticket_transcript(ctx)

async def setup(bot: commands.Bot):
    from Commands.Ticket.ticket import ticket_group
    if "ticket" not in bot.all_commands:
        bot.add_command(ticket_group)
    await bot.add_cog(TicketTranscriptCog(bot))
    await bot.add_cog(TicketTranscriptFallback(bot))
