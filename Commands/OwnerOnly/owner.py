import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button

class OwnerOverviewLayout(LayoutView):
    def __init__(self, owner: discord.abc.User):
        super().__init__(timeout=None)
        header_str = f"### Owner Control Center\n**Authorized Developer:** {owner.mention} (`{owner.id}`)"
        
        commands_str = (
            "**`-owner` (Central Hub Overview)**\n"
            "> Displays this primary overview of all exclusive developer and diagnostic commands.\n\n"
            "**`-setbackupchannel <#channel/id>` | `-cloudbackup` | `-cloudrestore` (Auto-Cloud Recovery)**\n"
            "> Configures and manually triggers the automated 12-hour Discord channel database backup and restore loop.\n\n"
            "**`-status` [type] [text] (Activity & Presence Hub)**\n"
            "> Interactive V2 control panel or command to set activity (`playing`, `watching`, `listening`, `streaming`, `competing`) and bot status (`online`, `idle`, `dnd`, `invisible`).\n\n"
            "**`-presence <online/idle/dnd/invisible>` (Bot Presence Changer)**\n"
            "> Dedicated shortcut to switch Orbit's online status indicator (e.g. Do Not Disturb, Idle/Abwesend, Offline).\n\n"
            "**`-shards` (Cluster & Shard Diagnostics)**\n"
            "> Inspects live shard topology, websocket ping, and per-shard guild distribution.\n\n"
            "**`-monitor` (RAM & CPU Hardware Monitor)**\n"
            "> Tracks real-time process RAM (`MB`), virtual OS memory (`GB`), CPU load (`%`), and thread counts.\n\n"
            "**`-console` (Interactive Live Terminal)**\n"
            "> Launches a V2 execution console with a button to pop open a live async Python evaluation modal.\n\n"
            "**`-eval <code>` (Direct Code Evaluation)**\n"
            "> Evaluates raw asynchronous Python bytecode or expressions directly inside the bot process.\n\n"
            "**`-errors` (System Error Inspector)**\n"
            "> Inspects the last 50 system exceptions and tracebacks caught across command execution and background loops.\n\n"
            "**`-storagebrowser` (Storage & JSON File Browser)**\n"
            "> Interactive dropdown explorer for inspecting live `Storage/` JSON database files directly in Discord.\n\n"
            "**`-dashboard` (Performance & Cache Throughput)**\n"
            "> Displays real-time RAM cache hit rates, message processing speeds, and asyncio task counts.\n\n"
            "**`-livelogs` (Live System Event Stream)**\n"
            "> Displays the real-time event log stream (last 50 commands, errors, and cogs loaded).\n\n"
            "**`-servers [page]` (Guild Cluster Directory)**\n"
            "> Interactive paginated directory listing every Discord server Orbit is currently joined to.\n\n"
            "**`-dmclear` (DM History Purge)**\n"
            "> Clears Orbit's recent direct message history inside the developer's DM channel.\n\n"
            "**`-devmode <true/false> [reason]` (Global Maintenance Mode)**\n"
            "> Toggles global developer lock, blocking non-owner execution across all servers.\n\n"
            "**`-reload <module/all>` (Module Hot-Reloader)**\n"
            "> Dynamically unloads and reloads specific cog modules or the entire command tree without restarting.\n\n"
            "**`-sync [here/local]` (Command Tree Synchronizer)**\n"
            "> Pushes and synchronizes all application slash commands globally across Discord or to the current guild.\n\n"
            "**`-getstorage` (RAM Archive Exporter)**\n"
            "> Compresses all persistent `Storage/` JSON files in memory and dispatches the ZIP directly to developer DMs.\n\n"
            "**`-getinvite <guild_id>` (Server Invite Generator)**\n"
            "> Generates a one-time invitation link to any remote server cluster by ID."
        )

        self.container = Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=commands_str)
        )
        self.add_item(self.container)

        btn_close = Button(label="Close Control Center", style=discord.ButtonStyle.secondary)

        async def _close_cb(interaction: discord.Interaction):
            try:
                await interaction.message.delete()
            except Exception:
                pass

        btn_close.callback = _close_cb
        self.add_item(ActionRow(btn_close))


class OwnerCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="owner", hidden=True)
    @commands.is_owner()
    async def owner_cmd(self, ctx: commands.Context):
        from Commands.OwnerOnly._monitor import record_command
        record_command("owner", str(ctx.author))
        if ctx.guild is not None:
            try:
                await ctx.message.delete()
            except Exception:
                pass
        view = OwnerOverviewLayout(ctx.author)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

    @owner_cmd.error
    async def owner_error(self, ctx: commands.Context, error):
        pass


async def setup(bot: commands.Bot):
    await bot.add_cog(OwnerCommand(bot))
