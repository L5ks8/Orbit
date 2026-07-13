import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button

class OwnerOverviewLayout(LayoutView):
    def __init__(self, owner: discord.abc.User):
        super().__init__(timeout=None)
        
        commands_str = (
            "**`-panel` (Central Hub Overview)**\n"
            "> Master dashboard for performance, system errors, connected servers, and JSON storage.\n\n"
            "**`-owner` (Developer Command Directory)**\n"
            "> Displays this list of all exclusive developer and diagnostic commands.\n\n"
            "**`-restart` / `-reboot` (Safety Reboot)**\n"
            "> Backs up all `Storage/` JSONs and cleanly reboots the bot process.\n\n"
            "**`-reload [module/all]` (Hot-Reloader)**\n"
            "> Dynamically unloads/reloads command extensions without a full restart.\n\n"
            "**`-gblacklist <user_id>` / `-gunblacklist` (Global Blocklist)**\n"
            "> Globally bans a user from using any Orbit command on any server.\n\n"
            "**`-blacklistserver <id>` / `-leaveserver <id>` (Server Management)**\n"
            "> Forces Orbit to instantly leave a server, or permanently blacklists a server ID.\n\n"
            "**`-cloudbackup` / `-cloudrestore` (Cloud Recovery)**\n"
            "> Manually triggers the automated 12-hour Discord channel database backup and restore loop.\n\n"
            "**`-status` / `-presence` (Activity & Presence Hub)**\n"
            "> Control panel to set bot activity (`playing`, `watching`) and status (`online`, `dnd`).\n\n"
            "**`-console` / `-eval <code>` (Live Terminal)**\n"
            "> Evaluates raw asynchronous Python bytecode or expressions directly inside the bot process.\n\n"
            "**`-livelogs` (Live System Event Stream)**\n"
            "> Displays the real-time event log stream (last 50 commands, errors, and cogs loaded).\n\n"
            "**`-dmclear` (DM History Purge)**\n"
            "> Clears Orbit's recent direct message history inside the developer's DM channel.\n\n"
            "**`-devmode <true/false>` (Global Maintenance Mode)**\n"
            "> Toggles global developer lock, blocking non-owner execution across all servers.\n\n"
            "**`-sync [here/local]` (Command Tree Synchronizer)**\n"
            "> Synchronizes all application slash commands globally across Discord or to the current guild.\n\n"
            "**`-getstorage` / `-getinvite <id>` (Export & Invites)**\n"
            "> Exports `Storage/` JSONs as a ZIP, or generates a one-time invite to a remote server cluster."
        )

        self.container = Container(
            TextDisplay(content=f"**Orbit Developer Command Directory:**"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=commands_str)
        )
        self.add_item(self.container)

        btn_close = Button(label="Close Directory", style=discord.ButtonStyle.secondary)

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

    @commands.command(name="owner", aliases=["devhelp", "ownerhelp"], hidden=True)
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
