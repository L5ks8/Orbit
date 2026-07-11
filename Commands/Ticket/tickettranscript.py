import io
import discord
from discord import app_commands
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Ticket._storage import load_ticket_config
from Commands.Ticket._group import ticket_group

@ticket_group.command(name="transcript", description="Generate and export a full text transcript of the current ticket channel.")
async def transcript_cmd(ctx: commands.Context):
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
        t_str = m.created_at.strftime("%Y-%m-%d %H:%M:%S")
        lines.append(f"[{t_str}] {m.author.display_name} ({m.author.id}): {m.content}")

    transcript_text = "\n".join(lines)
    transcript_bytes = transcript_text.encode("utf-8")
    file = discord.File(fp=io.BytesIO(transcript_bytes), filename=f"transcript-{ctx.channel.name}.txt")

    creator_obj = None
    if creator_id != "Unknown":
        try:
            creator_obj = ctx.guild.get_member(int(creator_id))
        except Exception:
            pass

    creator_mention = creator_obj.mention if creator_obj else f"<@{creator_id}>"
    creator_username = f"@{creator_obj.name}" if creator_obj else f"@{creator_id}"
    creator_id_str = str(creator_obj.id) if creator_obj else str(creator_id)

    executor_mention = ctx.author.mention
    executor_username = f"@{ctx.author.name}" if hasattr(ctx.author, "name") and ctx.author.name else str(ctx.author)
    executor_id_str = str(getattr(ctx.author, "id", "Unknown"))

    section_closed = f"### Ticket Transcript Export\n{executor_mention} exported a ticket transcript."
    section_close_info = (
        f"### Transcript Information\n"
        f"> **Ticket Name:** {ctx.channel.name}\n"
        f"> **Ticket ID:** {ctx.channel.id}\n"
        f"> **Messages Exported:** {len(messages)}"
    )
    section_creator_info = (
        f"### Creator Information\n"
        f"> **Creator:** {creator_mention}\n"
        f"> **Creator Username:** {creator_username}\n"
        f"> **Creator ID:** {creator_id_str}"
    )
    section_executor_info = (
        f"### Executor Information\n"
        f"> **Executor:** {executor_mention}\n"
        f"> **Executor Username:** {executor_username}\n"
        f"> **Executor ID:** {executor_id_str}"
    )

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

@transcript_cmd.error
async def transcript_error(ctx: commands.Context, error):
    await ctx.send(f"An error occurred exporting the transcript: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    pass
