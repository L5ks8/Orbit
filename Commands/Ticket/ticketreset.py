import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Ticket._group import ticket_group
from Commands.Ticket._storage import load_ticket_config, reset_ticket_config

class TicketResetSuccessLayout(LayoutView):
    def __init__(self, moderator: discord.Member, deleted_channels: int):
        super().__init__()
        header_str = f"### Orbit Support Desk Reset\n**Moderator:** {moderator.mention}"
        info_str = (
            f"**System Status:** `Wiped & Deactivated`\n"
            f"**Active Channels Deleted:** `{deleted_channels}`\n"
            f"**Ticket Counter:** Reset to `0`\n\n"
            f"*Use `/ticket setup` whenever you are ready to configure a new support desk!*"
        )

        self.container = Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=info_str)
        )
        self.add_item(self.container)

async def _do_ticket_reset(ctx: commands.Context):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)

    config = load_ticket_config(ctx.guild.id)
    active_tickets = config.get("active_tickets", {})
    deleted_channels = 0

    for ch_id_str in list(active_tickets.keys()):
        try:
            ch_id = int(ch_id_str)
            channel = ctx.guild.get_channel(ch_id)
            if channel is not None:
                await channel.delete(reason=f"Ticket System Reset by {ctx.author}")
                deleted_channels += 1
        except Exception:
            pass

    reset_ticket_config(ctx.guild.id)
    view = TicketResetSuccessLayout(ctx.author, deleted_channels)
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

@ticket_group.command(name="reset", description="Resets the server ticket system completely (`/ticket reset`).")
@commands.has_permissions(manage_guild=True)
async def ticket_reset_cmd(ctx: commands.Context):
    await _do_ticket_reset(ctx)

class TicketResetCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @ticket_reset_cmd.error
    async def ticket_reset_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Manage Server permission to reset the ticket system.", ephemeral=True)
        else:
            await ctx.send(f"An error occurred while resetting tickets: {error}", ephemeral=True)

class TicketResetPrefixFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="ticket reset", aliases=["ticketreset", "resettickets"], hidden=True)
    @commands.has_permissions(manage_guild=True)
    async def ticket_reset_prefix(self, ctx: commands.Context):
        await _do_ticket_reset(ctx)

async def setup(bot: commands.Bot):
    await bot.add_cog(TicketResetCommand(bot))
    await bot.add_cog(TicketResetPrefixFallback(bot))
