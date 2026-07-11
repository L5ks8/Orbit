import discord
from discord import app_commands
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Ticket._storage import load_ticket_config
from Commands.Ticket._group import ticket_group

@ticket_group.command(name="add", description="Add a member to the current support ticket channel.")
@app_commands.describe(member="The member to grant access to this ticket")
async def add_cmd(ctx: commands.Context, member: discord.Member):
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

@add_cmd.error
async def add_error(ctx: commands.Context, error):
    if isinstance(error, commands.MissingRequiredArgument):
        await ctx.send("Usage: `-ticket add <@member>`", ephemeral=True)
    elif isinstance(error, (commands.MemberNotFound, commands.BadArgument)):
        await ctx.send("Member not found in this server.", ephemeral=True)
    else:
        await ctx.send(f"An error occurred: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    pass
