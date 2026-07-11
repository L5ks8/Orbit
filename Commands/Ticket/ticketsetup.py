import discord
from discord import app_commands
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Ticket._storage import setup_ticket_config
from Commands.Ticket._views import PersistentTicketPanelLayout, TicketControlLayout, TicketConfigDynamicView
from Commands.Ticket._group import ticket_group

@ticket_group.command(name="setup", description="Configure the ticket system options count and target channel.")
@commands.has_permissions(manage_guild=True)
@app_commands.describe(
    options="Number of ticket category option slots to configure (1 to 10)",
    panel_channel="The channel where the 'Open Ticket' panel card will be sent",
    log_channel="Optional: Channel where closed ticket transcripts will be saved",
    title="Optional: Custom header title for the ticket desk panel",
    description="Optional: Custom description explanation for the ticket desk panel"
)
async def setup_cmd(
    ctx: commands.Context,
    options: int,
    panel_channel: discord.TextChannel,
    log_channel: discord.TextChannel = None,
    title: str = "Support Ticket Desk",
    description: str = "Click the button below to open a direct support channel with our team."
):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)

    opt_count = max(1, min(10, options))
    options_slots = [{"name": f"Option {i+1}", "role_id": None, "category_id": None} for i in range(opt_count)]
    opt_names = [s["name"] for s in options_slots]

    log_ch_id = log_channel.id if log_channel else None
    setup_ticket_config(ctx.guild.id, panel_channel.id, None, None, log_ch_id, title, description, opt_names, options_slots)

    view = TicketConfigDynamicView(ctx.guild.id)
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

@setup_cmd.error
async def setup_error(ctx: commands.Context, error):
    if isinstance(error, commands.MissingPermissions):
        await ctx.send("You need Manage Server permission to configure tickets.", ephemeral=True)
    elif isinstance(error, commands.MissingRequiredArgument):
        await ctx.send("Usage: `-ticket setup <options_count_1-10> <#panel_channel> [log_channel] [title] [description]`", ephemeral=True)
    elif isinstance(error, commands.BadArgument):
        await ctx.send("Usage: `-ticket setup <options_count_1-10> <#panel_channel> [log_channel]` (Check options count integer)", ephemeral=True)
    else:
        await ctx.send(f"An error occurred: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    pass
