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
from Commands.Ticket.transcript_render import parse_transcript, generate_transcript_image
from Commands.Ticket._views import (
    PersistentTicketPanelLayout,
    TicketControlLayout,
    close_ticket_flow
)

async def _do_ticket_add(ctx: commands.Context, member: discord.Member):
    await ctx.defer()
    if not ctx.guild or not isinstance(ctx.channel, discord.TextChannel):
        return await ctx.send(embed=make_embed("This command must be run inside a server ticket channel.", discord.Color.red()), ephemeral=True)

    config = load_ticket_config(ctx.guild.id)
    support_role_id = config.get("support_role_id")
    ticket_data = config.get("active_tickets", {}).get(str(ctx.channel.id))

    if not ticket_data and not ctx.channel.name.startswith("ticket-"):
        return await ctx.send(embed=make_embed("This channel is not recognized as an active support ticket.", discord.Color.red()), ephemeral=True)

    is_staff = ctx.author.guild_permissions.manage_guild
    if isinstance(ctx.author, discord.Member) and support_role_id:
        if any(r.id == support_role_id for r in getattr(ctx.author, 'roles', [])):
            is_staff = True

    if not is_staff:
        return await ctx.send(embed=make_embed("Only support staff or administrators can add members to tickets.", discord.Color.red()), ephemeral=True)

    try:
        await ctx.channel.set_permissions(
            member,
            read_messages=True,
            send_messages=True,
            attach_files=True,
            read_message_history=True,
            reason=f"Added to ticket by {ctx.author}"
        )

        embed = discord.Embed(title=f"Member Added: #{ctx.channel.name}", color=discord.Color.green())
        embed.add_field(name="User Added", value=f"{member.mention} (`{member.id}`)", inline=False)
        embed.add_field(name="Added By", value=ctx.author.mention, inline=False)
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

    except discord.Forbidden:
        await ctx.send(embed=make_embed(f"I do not have permission to modify channel overwrites for {member.mention}.", discord.Color.red()), ephemeral=True)
    except Exception as e:
        await ctx.send(embed=make_embed(f"An error occurred adding {member.mention} to the ticket: {e}", discord.Color.red()), ephemeral=True)

async def _do_ticket_remove(ctx: commands.Context, member: discord.Member):
    await ctx.defer()
    if not ctx.guild or not isinstance(ctx.channel, discord.TextChannel):
        return await ctx.send(embed=make_embed("This command must be run inside a server ticket channel.", discord.Color.red()), ephemeral=True)

    config = load_ticket_config(ctx.guild.id)
    support_role_id = config.get("support_role_id")
    ticket_data = config.get("active_tickets", {}).get(str(ctx.channel.id))

    if not ticket_data and not ctx.channel.name.startswith("ticket-"):
        return await ctx.send(embed=make_embed("This channel is not recognized as an active support ticket.", discord.Color.red()), ephemeral=True)

    is_staff = ctx.author.guild_permissions.manage_guild
    if isinstance(ctx.author, discord.Member) and support_role_id:
        if any(r.id == support_role_id for r in getattr(ctx.author, 'roles', [])):
            is_staff = True

    if not is_staff:
        return await ctx.send(embed=make_embed("Only support staff or administrators can remove members from tickets.", discord.Color.red()), ephemeral=True)

    if member.id == ctx.bot.user.id or member.guild_permissions.manage_guild:
        return await ctx.send(embed=make_embed("You cannot remove administrators or the bot from a ticket.", discord.Color.red()), ephemeral=True)

    try:
        await ctx.channel.set_permissions(member, overwrite=None, reason=f"Removed from ticket by {ctx.author}")

        embed = discord.Embed(title=f"Member Removed: #{ctx.channel.name}", color=discord.Color.red())
        embed.add_field(name="User Removed", value=f"{member.mention} (`{member.id}`)", inline=False)
        embed.add_field(name="Removed By", value=ctx.author.mention, inline=False)
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

    except discord.Forbidden:
        await ctx.send(embed=make_embed(f"I do not have permission to modify channel overwrites for {member.mention}.", discord.Color.red()), ephemeral=True)
    except Exception as e:
        await ctx.send(embed=make_embed(f"An error occurred removing {member.mention} from the ticket: {e}", discord.Color.red()), ephemeral=True)

async def _do_ticket_close(ctx: commands.Context, reason: str):
    await ctx.defer()
    if not ctx.guild or not isinstance(ctx.channel, discord.TextChannel):
        return await ctx.send(embed=make_embed("This command must be run inside a server ticket channel.", discord.Color.red()), ephemeral=True)

    config = load_ticket_config(ctx.guild.id)
    support_role_id = config.get("support_role_id")
    ticket_data = config.get("active_tickets", {}).get(str(ctx.channel.id))

    if not ticket_data and not ctx.channel.name.startswith("ticket-"):
        return await ctx.send(embed=make_embed("This channel is not recognized as an active support ticket.", discord.Color.red()), ephemeral=True)

    creator_id = ticket_data.get("creator_id") if ticket_data else None
    is_authorized = ctx.author.id == creator_id or ctx.author.guild_permissions.manage_guild
    if isinstance(ctx.author, discord.Member) and support_role_id:
        if any(r.id == support_role_id for r in getattr(ctx.author, 'roles', [])):
            is_authorized = True

    if not is_authorized:
        return await ctx.send(embed=make_embed("You do not have permission to close this ticket (`Creator or Support Staff only`).", discord.Color.red()), ephemeral=True)

    await ctx.send(embed=make_embed(f"Initiating ticket closure by {ctx.author.mention} (`Reason: {reason}`)..."))
    asyncio.create_task(close_ticket_flow(ctx.guild, ctx.channel, ctx.author, reason))

async def _do_ticket_transcript(ctx: commands.Context):
    await ctx.defer()
    if not ctx.guild or not isinstance(ctx.channel, discord.TextChannel):
        return await ctx.send(embed=make_embed("This command must be run inside a server ticket channel.", discord.Color.red()), ephemeral=True)

    config = load_ticket_config(ctx.guild.id)
    support_role_id = config.get("support_role_id")
    ticket_data = config.get("active_tickets", {}).get(str(ctx.channel.id))

    if not ticket_data and not ctx.channel.name.startswith("ticket-"):
        return await ctx.send(embed=make_embed("This channel is not recognized as an active support ticket.", discord.Color.red()), ephemeral=True)

    creator_id = ticket_data.get("creator_id", "Unknown") if ticket_data else "Unknown"
    subject = ticket_data.get("subject", "Unknown") if ticket_data else "Unknown"

    is_authorized = ctx.author.id == creator_id or ctx.author.guild_permissions.manage_guild
    if isinstance(ctx.author, discord.Member) and support_role_id:
        if any(r.id == support_role_id for r in getattr(ctx.author, 'roles', [])):
            is_authorized = True

    if not is_authorized:
        return await ctx.send(embed=make_embed("You do not have permission to export transcripts for this ticket (`Creator or Support Staff only`).", discord.Color.red()), ephemeral=True)

    messages = []
    try:
        async for m in ctx.channel.history(limit=500, oldest_first=True):
            messages.append(m)
    except Exception as e:
        return await ctx.send(embed=make_embed(f"Failed to fetch channel history: {e}", discord.Color.red()), ephemeral=True)

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

    embed = discord.Embed(title="Ticket Transcript Generated", color=discord.Color.blue())
    embed.add_field(name="Ticket", value=f"`#{ctx.channel.name}` (`{ctx.channel.id}`)", inline=False)
    embed.add_field(name="Subject", value=f"`{subject}`", inline=True)
    embed.add_field(name="Messages", value=f"`{len(messages)}`", inline=True)
    embed.add_field(name="Creator ID", value=f"`{creator_id}`", inline=False)
    embed.add_field(name="Exported By", value=f"{ctx.author.mention} (`{ctx.author.id}`)", inline=False)
    await ctx.send(embed=embed, file=file, allowed_mentions=discord.AllowedMentions.none())

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
        return await ctx.send(embed=discord.Embed(description="This command must be run inside a server.", color=discord.Color.red()), ephemeral=True)
    if not ctx.author.guild_permissions.manage_guild:
        config = load_ticket_config(ctx.guild.id)
        support_role_id = config.get("support_role_id")
        if not support_role_id or not any(r.id == support_role_id for r in getattr(ctx.author, 'roles', [])):
            return await ctx.send(embed=discord.Embed(description="Only support staff or administrators can blacklist users.", color=discord.Color.red()), ephemeral=True)
    
    dur_secs = _parse_duration(duration) if duration else None
    add_to_blacklist(ctx.guild.id, member.id, dur_secs)
    
    dur_text = f"for {duration}" if dur_secs else "permanently"
    await ctx.send(embed=discord.Embed(description=f"{member.mention} has been blacklisted from opening tickets {dur_text}.", color=discord.Color.green()))

async def _do_ticket_unblacklist(ctx: commands.Context, member: discord.Member):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send(embed=discord.Embed(description="This command must be run inside a server.", color=discord.Color.red()), ephemeral=True)
    if not ctx.author.guild_permissions.manage_guild:
        config = load_ticket_config(ctx.guild.id)
        support_role_id = config.get("support_role_id")
        if not support_role_id or not any(r.id == support_role_id for r in getattr(ctx.author, 'roles', [])):
            return await ctx.send(embed=discord.Embed(description="Only support staff or administrators can unblacklist users.", color=discord.Color.red()), ephemeral=True)
    
    removed = remove_from_blacklist(ctx.guild.id, member.id)
    if removed:
        await ctx.send(embed=discord.Embed(description=f"{member.mention} has been removed from the ticket blacklist.", color=discord.Color.green()))
    else:
        await ctx.send(embed=discord.Embed(description=f"{member.mention} was not blacklisted.", color=discord.Color.yellow()), ephemeral=True)

@commands.hybrid_group(name="ticket", description="Support ticket tools.")
@commands.has_permissions(manage_channels=True)
async def ticket_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        await ctx.send(embed=make_embed("Use: `add`, `remove`, `close`, or `transcript`.", discord.Color.red()), ephemeral=True)

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

render_group = app_commands.Group(name="render", description="Render images from data")

class RenderTranscriptView(discord.ui.View):
    def __init__(self, interaction: discord.Interaction, messages, current_page: int = 0):
        super().__init__(timeout=300)
        self.interaction = interaction
        self.messages = messages
        self.current_page = current_page
        self.per_page = 50
        self.total_pages = max(1, (len(messages) + self.per_page - 1) // self.per_page)
        
        self.btn_prev = discord.ui.Button(label="Previous", style=discord.ButtonStyle.secondary, disabled=self.current_page == 0)
        self.btn_prev.callback = self.on_prev
        self.add_item(self.btn_prev)
        
        self.btn_page = discord.ui.Button(label=f"Page {self.current_page + 1}/{self.total_pages}", style=discord.ButtonStyle.secondary, disabled=True)
        self.add_item(self.btn_page)
        
        self.btn_next = discord.ui.Button(label="Next", style=discord.ButtonStyle.primary, disabled=self.current_page == self.total_pages - 1)
        self.btn_next.callback = self.on_next
        self.add_item(self.btn_next)

    async def _update_page(self, interaction: discord.Interaction):
        await interaction.response.defer()
        img = await generate_transcript_image(self.messages, self.current_page, self.per_page)
        if not img:
            return await interaction.followup.send(embed=make_embed("Failed to render page.", discord.Color.red()), ephemeral=True)
            
        import io
        b = io.BytesIO()
        img.save(b, format='PNG')
        b.seek(0)
        file = discord.File(fp=b, filename=f"transcript_p{self.current_page+1}.png")
        
        self.btn_prev.disabled = (self.current_page == 0)
        self.btn_next.disabled = (self.current_page == self.total_pages - 1)
        self.btn_page.label = f"Page {self.current_page + 1}/{self.total_pages}"
        
        await interaction.message.edit(attachments=[file], view=self)

    async def on_prev(self, interaction: discord.Interaction):
        self.current_page -= 1
        await self._update_page(interaction)

    async def on_next(self, interaction: discord.Interaction):
        self.current_page += 1
        await self._update_page(interaction)


@render_group.command(name="transcript", description="Render a ticket transcript HTML file into a chat history image")
@app_commands.describe(file="The transcript HTML file to render")
async def render_transcript_cmd(interaction: discord.Interaction, file: discord.Attachment):
    if not file.filename.endswith(".html"):
        return await interaction.response.send_message(embed=make_embed("Please upload a valid .html transcript file."), ephemeral=True)
        
    await interaction.response.defer()
    try:
        content_bytes = await file.read()
        content_str = content_bytes.decode('utf-8', errors='ignore')
        
        messages = parse_transcript(content_str)
        if not messages:
            return await interaction.followup.send(embed=make_embed("No valid messages found in the transcript file."), ephemeral=True)
            
        img = await generate_transcript_image(messages, page=0, per_page=50)
        if not img:
            return await interaction.followup.send(embed=make_embed("Failed to render image.", discord.Color.red()), ephemeral=True)
            
        import io
        from Commands._utils import make_embed
        b = io.BytesIO()
        img.save(b, format='PNG')
        b.seek(0)
        discord_file = discord.File(fp=b, filename="transcript_p1.png")
        
        view = RenderTranscriptView(interaction, messages, current_page=0)
        await interaction.followup.send(file=discord_file, view=view)
        
    except Exception as e:
        await interaction.followup.send(embed=make_embed(f"An error occurred while rendering: {e}", discord.Color.red()), ephemeral=True)

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
        await ctx.send(embed=make_embed(f"Ticket add failed: {error}", discord.Color.red()), ephemeral=True)

    @ticket_remove_cmd.error
    async def remove_error(self, ctx: commands.Context, error):
        await ctx.send(embed=make_embed(f"Ticket remove failed: {error}", discord.Color.red()), ephemeral=True)

    @ticket_close_cmd.error
    async def close_error(self, ctx: commands.Context, error):
        await ctx.send(embed=make_embed(f"Ticket close failed: {error}", discord.Color.red()), ephemeral=True)

    @ticket_transcript_cmd.error
    async def transcript_error(self, ctx: commands.Context, error):
        await ctx.send(embed=make_embed(f"Ticket transcript failed: {error}", discord.Color.red()), ephemeral=True)

    @ticket_blacklist_cmd.error
    async def blacklist_error(self, ctx: commands.Context, error):
        await ctx.send(embed=make_embed(f"Ticket blacklist failed: {error}", discord.Color.red()), ephemeral=True)

    @ticket_unblacklist_cmd.error
    async def unblacklist_error(self, ctx: commands.Context, error):
        await ctx.send(embed=make_embed(f"Ticket unblacklist failed: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    if "ticket" not in bot.all_commands:
        bot.add_command(ticket_group)
    bot.tree.add_command(render_group)
    await bot.add_cog(TicketCog(bot))
