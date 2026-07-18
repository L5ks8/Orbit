import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button

class DevOverviewLayout(LayoutView):
    def __init__(self, owner: discord.abc.User):
        super().__init__(timeout=None)
        header_str = f"### Developer Control Center\n**Authorized Developer:** {owner.mention} (`{owner.id}`)"
        
        commands_str = (
            "**`-dev` (Central Hub Overview)**\n"
            "> Displays this primary overview of all exclusive developer commands.\n\n"
            "**`-restart` / `-update` (System Lifecycle)**\n"
            "> Restarts the bot process or fetches the latest updates.\n\n"
            "**`-status` [type] [text] (Activity & Presence Hub)**\n"
            "> Interactive V2 control panel to set the bot's status and activity.\n\n"
            "**`-console` (Interactive Live Terminal)**\n"
            "> Launches a V2 execution console with an async Python evaluation modal.\n\n"
            "**`-errors` (System Error Inspector)**\n"
            "> Inspects the last system exceptions and tracebacks caught.\n\n"
            "**`-logs` (Live System Event Stream)**\n"
            "> Displays the real-time event log stream (commands, errors, etc).\n\n"
            "**`-storagebrowser` | `-getstorage` (Data Management)**\n"
            "> Interactively browse or download `Storage/` JSON files.\n\n"
            "**`-servers` | `-leaveserver` | `-getinvite` (Guild Cluster Control)**\n"
            "> View all servers, leave a specific server, or generate an invite.\n\n"
            "**`-gblacklist <id>` | `-gblacklistremove <id>` (Global Defense)**\n"
            "> Add or remove a Server ID from the global blacklist. Blacklisted servers are auto-left.\n\n"
            "**`-cloudbackup` | `-cloudrestore` | `-setbackupchannel` (Cloud Recovery)**\n"
            "> Configures and manually triggers the automated database backup/restore loop.\n\n"
            "**`-dmclear` (DM History Purge)**\n"
            "> Clears Orbit's recent direct message history in your DMs.\n\n"
            "**`-devmode <true/false> [reason]` (Global Maintenance Mode)**\n"
            "> Toggles global developer lock, blocking non-owner execution.\n\n"
            "**`-sync [here/local]` (Command Tree Synchronizer)**\n"
            "> Pushes and synchronizes all application slash commands."
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

class DevCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="dev", aliases=["panel", "system"], hidden=True)
    @commands.is_owner()
    async def dev_cmd(self, ctx: commands.Context):
        from Commands.OwnerOnly._monitor import record_command
        record_command("dev", str(ctx.author))
        if ctx.guild is not None:
            try:
                await ctx.message.delete()
            except Exception:
                pass
        view = DevOverviewLayout(ctx.author)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

    @dev_cmd.error
    async def dev_error(self, ctx: commands.Context, error):
        pass

async def setup(bot: commands.Bot):
    await bot.add_cog(DevCommand(bot))
