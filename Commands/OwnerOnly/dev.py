import discord
from discord.ext import commands
from Commands._utils import make_embed

PAGES = [
    {
        "title": "System Lifecycle",
        "description": (
            "**`-dev` (Central Hub Overview)**\n"
            "> Displays this primary overview of all exclusive developer commands.\n\n"
            "**`-restart` / `-update`**\n"
            "> Restarts the bot process or fetches the latest updates.\n\n"
            "**`-status` [type] [text]**\n"
            "> Control panel to set the bot's status and activity.\n\n"
            "**`-devmode <true/false> [reason]`**\n"
            "> Toggles global developer lock, blocking non-owner execution.\n\n"
            "**`-sync [here/local]`**\n"
            "> Pushes and synchronizes all application slash commands."
        )
    },
    {
        "title": "Monitoring & Logs",
        "description": (
            "**`-console`**\n"
            "> Launches an execution console with an async Python evaluation modal.\n\n"
            "**`-errors`**\n"
            "> Inspects the last system exceptions and tracebacks caught.\n\n"
            "**`-logs`**\n"
            "> Displays the real-time event log stream (commands, errors, etc).\n\n"
            "**`-sysinfo`**\n"
            "> CPU/RAM usage, uptime, DB ping, and active tasks."
        )
    },
    {
        "title": "Guild Cluster & Cloud",
        "description": (
            "**`-servers` | `-leaveserver` | `-getinvite`**\n"
            "> View all servers, leave a specific server, or generate an invite.\n\n"
            "**`-guildinfo <Server-ID>`**\n"
            "> Get detailed statistics about a specific server.\n\n"
            "**`-analytics`**\n"
            "> View global bot usage statistics and cache performance.\n\n"
            "**`-gblacklist <id>` | `-gblacklistremove <id>`**\n"
            "> Add or remove a Server ID from the global blacklist.\n\n"
            "**`-cloudbackup` | `-cloudrestore` | `-setbackupchannel`**\n"
            "> Configures automated database backup/restore loop.\n\n"
            "**`-broadcast <message>`**\n"
            "> Send a direct message to all server owners."
        )
    },
    {
        "title": "Data Management & Misc",
        "description": (
            "**`-storagebrowser` | `-getstorage`**\n"
            "> Interactively browse or download `Storage/` JSON files.\n\n"
            "**`-dbquery <sql>`**\n"
            "> Execute direct queries via MongoDB Python client.\n\n"
            "**`-getip <user/ip>`**\n"
            "> Search verification logs by User ID or IP address.\n\n"
            "**`-dmclear`**\n"
            "> Clears Orbit's recent direct message history in your DMs."
        )
    },
    {
        "title": "Access & Permissions",
        "description": (
            "**`-adddev <@user>`**\n"
            "> Add a user as a bot developer (grants owner-only command access).\n\n"
            "**`-removedev <@user>`**\n"
            "> Remove a user from the developer list."
        )
    },
    {
        "title": "Database & Storage",
        "description": (
            "**`-dbwipe <Server-ID>`**\n"
            "> Permanently deletes all database records and local storage for a specific server.\n\n"
            "**`-wipeuser <User-ID>`**\n"
            "> Permanently deletes all database records for a specific user.\n\n"
            "**`-clearcache`**\n"
            "> Flushes internal caches (like the prefix cache) to sync with the database."
        )
    },
    {
        "title": "Development & Testing",
        "description": (
            "**`-shell <command>`**\n"
            "> Executes a system shell command and returns the output.\n\n"
            "**`-sudo <@user> <command>`**\n"
            "> Executes a command on behalf of another user."
        )
    },
    {
        "title": "Bot Profile Management",
        "description": (
            "**`-setavatar [url/attachment]` | `-resetavatar`**\n"
            "> Changes or resets the bot's profile picture.\n\n"
            "**`-setusername <name>` | `-resetusername`**\n"
            "> Changes or resets the bot's global username."
        )
    }
]

class DevCategorySelect(discord.ui.Select):
    def __init__(self, parent_view: "DevLayout"):
        self.parent_view = parent_view
        options = [
            discord.SelectOption(
                label=page["title"],
                value=str(idx),
                default=(idx == parent_view.current_page)
            )
            for idx, page in enumerate(PAGES)
        ]
        super().__init__(placeholder="Jump directly to a category...", options=options)

    async def callback(self, interaction: discord.Interaction):
        if interaction.user.id != self.parent_view.author_id:
            return await interaction.response.send_message(embed=make_embed("You cannot control this panel.", discord.Color.red()), ephemeral=True)
        
        page_idx = int(self.values[0])
        self.parent_view.current_page = page_idx
        await interaction.response.edit_message(**self.parent_view.get_kwargs())

class DevLayout(discord.ui.View):
    def __init__(self, bot: commands.Bot, author_id: int, current_page: int = 0):
        super().__init__(timeout=300)
        self.bot = bot
        self.author_id = author_id
        self.current_page = current_page

    def get_kwargs(self):
        page = PAGES[self.current_page]

        select_menu = DevCategorySelect(self)

        btn_prev = discord.ui.Button(label="Previous", style=discord.ButtonStyle.secondary, disabled=(self.current_page == 0))
        btn_page = discord.ui.Button(label=f"Page {self.current_page + 1}/{len(PAGES)}", style=discord.ButtonStyle.primary, disabled=True)
        btn_next = discord.ui.Button(label="Next", style=discord.ButtonStyle.secondary, disabled=(self.current_page == len(PAGES) - 1))
        btn_close = discord.ui.Button(label="Close", style=discord.ButtonStyle.danger)

        async def prev_cb(interaction: discord.Interaction):
            if interaction.user.id != self.author_id:
                return await interaction.response.send_message(embed=make_embed("You cannot control this panel.", discord.Color.red()), ephemeral=True)
            if self.current_page > 0:
                self.current_page -= 1
                await interaction.response.edit_message(**self.get_kwargs())

        async def next_cb(interaction: discord.Interaction):
            if interaction.user.id != self.author_id:
                return await interaction.response.send_message(embed=make_embed("You cannot control this panel.", discord.Color.red()), ephemeral=True)
            if self.current_page < len(PAGES) - 1:
                self.current_page += 1
                await interaction.response.edit_message(**self.get_kwargs())

        async def close_cb(interaction: discord.Interaction):
            if interaction.user.id != self.author_id:
                return await interaction.response.send_message(embed=make_embed("You cannot control this panel.", discord.Color.red()), ephemeral=True)
            try:
                await interaction.message.delete()
            except Exception:
                pass

        btn_prev.callback = prev_cb
        btn_next.callback = next_cb
        btn_close.callback = close_cb

        components = [select_menu, btn_prev, btn_page, btn_next, btn_close]

        embed = discord.Embed(
            title=f"Developer Control Center - {page['title']}",
            description=page["description"],
            color=0x2B2D31
        )
        embed.set_footer(text=f"Page {self.current_page + 1} of {len(PAGES)}")

        self.clear_items()
        for comp in components:
            self.add_item(comp)

        return {"embed": embed, "view": self}

class DevCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="dev", aliases=["panel", "system"], hidden=True)
    @commands.is_owner()
    async def dev_cmd(self, ctx: commands.Context):
        from Commands.OwnerOnly._monitor import record_command
        from Commands._utils import make_embed
        record_command("dev", str(ctx.author))
        if ctx.guild is not None:
            try:
                await ctx.message.delete()
            except Exception:
                pass
        
        view = DevLayout(self.bot, ctx.author.id, 0)
        await ctx.send(**view.get_kwargs(), allowed_mentions=discord.AllowedMentions.none())

    @dev_cmd.error
    async def dev_error(self, ctx: commands.Context, error):
        pass

async def setup(bot: commands.Bot):
    await bot.add_cog(DevCommand(bot))