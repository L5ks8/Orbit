import discord
from discord import app_commands
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Ticket._storage import load_ticket_config
from Commands.Ticket.ticket import ticket_group

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

@ticket_group.command(name="remove", description="Remove a member from the ticket.")
@app_commands.describe(member="The member to remove from this ticket")
async def remove_cmd(ctx: commands.Context, member: discord.Member):
    await _do_ticket_remove(ctx, member)

class TicketRemoveCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @remove_cmd.error
    async def remove_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage: `-ticket remove <@member>`", ephemeral=True)
        elif isinstance(error, (commands.MemberNotFound, commands.BadArgument)):
            await ctx.send("Member not found in this server.", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

class TicketRemoveFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="tk_remove", aliases=["ticketremove"], hidden=True)
    async def remove_prefix(self, ctx: commands.Context, member: discord.Member):
        await _do_ticket_remove(ctx, member)

async def setup(bot: commands.Bot):
    from Commands.Ticket.ticket import ticket_group
    if "ticket" not in bot.all_commands:
        bot.add_command(ticket_group)
    await bot.add_cog(TicketRemoveCog(bot))
    await bot.add_cog(TicketRemoveFallback(bot))
