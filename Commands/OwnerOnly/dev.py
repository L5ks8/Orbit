import discord
from discord.ext import commands

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
            "**`-clearcache`**\n"
            "> Flushes internal caches (like the prefix cache) to sync with the database."
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

    @commands.command(name="adddev", hidden=True)
    @commands.is_owner()
    async def add_dev(self, ctx: commands.Context, user: discord.User):
        import json, os
        path = os.path.join("Database", "developers.json")
        os.makedirs("Database", exist_ok=True)
        devs = []
        if os.path.exists(path):
            try:
                with open(path, "r") as f:
                    devs = json.load(f)
            except Exception:
                pass
        if user.id not in devs:
            devs.append(user.id)
            with open(path, "w") as f:
                json.dump(devs, f)
            await ctx.send(f"Added {user.mention} as a developer.")
        else:
            await ctx.send("User is already a developer.")

    @commands.command(name="removedev", hidden=True)
    @commands.is_owner()
    async def remove_dev(self, ctx: commands.Context, user: discord.User):
        import json, os
        path = os.path.join("Database", "developers.json")
        devs = []
        if os.path.exists(path):
            try:
                with open(path, "r") as f:
                    devs = json.load(f)
            except Exception:
                pass
        if user.id in devs:
            devs.remove(user.id)
            with open(path, "w") as f:
                json.dump(devs, f)
            await ctx.send(f"Removed {user.mention} from developers.")
        else:
            await ctx.send("User is not a developer.")

    @commands.command(name="dbwipe", hidden=True)
    @commands.is_owner()
    async def db_wipe(self, ctx: commands.Context, guild_id: int):
        from Database.mongodb import get_db
        import os, shutil
        db = get_db()
        deleted_count = 0
        if db is not None:
            for coll_name in db.list_collection_names():
                coll = db[coll_name]
                # Try string _id (settings), int guild_id (levels, economy), string guild_id
                res1 = coll.delete_many({"_id": str(guild_id)})
                res2 = coll.delete_many({"guild_id": guild_id})
                res3 = coll.delete_many({"guild_id": str(guild_id)})
                deleted_count += res1.deleted_count + res2.deleted_count + res3.deleted_count
        
        storage_path = os.path.join("Storage", str(guild_id))
        shutil.rmtree(storage_path, ignore_errors=True)
        
        await ctx.send(f"Wiped all database records and storage files for Server ID `{guild_id}`. ({deleted_count} DB records deleted)")

    @commands.command(name="clearcache", hidden=True)
    @commands.is_owner()
    async def clear_cache(self, ctx: commands.Context):
        try:
            import bot
            bot.PREFIX_CACHE.clear()
            cleared = "Prefix Cache"
        except Exception as e:
            cleared = f"Failed to clear cache: {e}"
        await ctx.send(f"**Caches Cleared:**\n- {cleared}")

async def setup(bot: commands.Bot):
    await bot.add_cog(DevCommand(bot))