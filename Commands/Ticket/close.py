import asyncio
import discord
from discord import app_commands
from discord.ext import commands
from Commands.Ticket._storage import load_ticket_config
from Commands.Ticket._views import close_ticket_flow
from Commands.Ticket.ticket import ticket_group

async def _do_ticket_close(ctx: commands.Context, reason: str):
    await ctx.defer()
    if not ctx.guild or not isinstance(ctx.channel, discord.TextChannel):
        return await ctx.send("This command must be run inside a server ticket channel.", ephemeral=True)

    config = load_ticket_config(ctx.guild.id)
    support_role_id = config.get("support_role_id")
    ticket_data = config.get("active_tickets", {}).get(str(ctx.channel.id))

    if not ticket_data:
        if not ctx.channel.name.startswith("ticket-"):
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

@ticket_group.command(name="close", description="Close the ticket and generate transcript.")
@app_commands.describe(reason="Optional explanation for why the ticket is being closed")
async def close_cmd(ctx: commands.Context, reason: str = "Closed via command"):
    await _do_ticket_close(ctx, reason)

class TicketCloseCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @close_cmd.error
    async def close_error(self, ctx: commands.Context, error):
        await ctx.send(f"An error occurred while closing the ticket: {error}", ephemeral=True)

class TicketCloseFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="tk_close", aliases=["ticketclose"], hidden=True)
    async def close_prefix(self, ctx: commands.Context, *, reason: str = "Closed via command"):
        await _do_ticket_close(ctx, reason)

async def setup(bot: commands.Bot):
    from Commands.Ticket.ticket import ticket_group
    if "ticket" not in bot.all_commands:
        bot.add_command(ticket_group)
    await bot.add_cog(TicketCloseCog(bot))
    await bot.add_cog(TicketCloseFallback(bot))
