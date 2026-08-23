import json
import pathlib
import discord
from discord.ext import commands
from discord.ui import View, Select, Button
from Components.Commands.OwnerOnly._monitor import record_command

class StorageBrowserSelect(Select):
    def __init__(self, parent_view: "StorageBrowserView"):
        self.parent_view = parent_view
        options = []
        
        try:
            from Components.Database.mongodb import get_db
            db = get_db()
            if db is not None:
                for coll in db.list_collection_names()[:15]:
                    options.append(discord.SelectOption(label=f"MongoDB: {coll}", value=f"mongo:{coll}"))
        except Exception:
            pass

        storage_dir = pathlib.Path("Storage")
        if storage_dir.exists():
            for p in storage_dir.glob("*.json"):
                options.append(discord.SelectOption(label=f"Global: {p.name}", value=f"file:{p}"))
            for folder in storage_dir.iterdir():
                if folder.is_dir() and folder.name.isdigit():
                    for p in folder.glob("*.json"):
                        options.append(discord.SelectOption(label=f"Guild {folder.name}: {p.name}"[:100], value=f"file:{p}"))

        if not options:
            options.append(discord.SelectOption(label="No storage files found", value="none"))

        super().__init__(placeholder="Select JSON/Mongo Database from Storage...", options=options[:25], min_values=1, max_values=1)

    async def callback(self, interaction: discord.Interaction):
        await interaction.response.defer()
        if self.values[0] != "none":
            self.parent_view.selected_path = self.values[0]
        try:
            await interaction.edit_original_response(embed=self.parent_view.get_embed(), view=self.parent_view)
        except Exception:
            pass

class StorageBrowserView(View):
    def __init__(self, owner: discord.abc.User):
        super().__init__(timeout=None)
        self.owner = owner
        self.selected_path = "Storage/devmode.json" if pathlib.Path("Storage/devmode.json").exists() else None
        
        self.add_item(StorageBrowserSelect(self))

        btn_close = Button(label="Close Browser", style=discord.ButtonStyle.secondary)
        async def _close_cb(interaction: discord.Interaction):
            try:
                await interaction.message.delete()
            except Exception:
                pass
        btn_close.callback = _close_cb
        self.add_item(btn_close)

    def get_embed(self) -> discord.Embed:
        file_str = "No file selected."
        if self.selected_path:
            if self.selected_path.startswith("mongo:"):
                coll_name = self.selected_path.split(":", 1)[1]
                try:
                    from Components.Database.mongodb import get_db
                    db = get_db()
                    docs = list(db[coll_name].find().limit(5))
                    for d in docs:
                        d["_id"] = str(d.get("_id"))
                    raw_dump = json.dumps(docs, indent=2)[:3000]
                    file_str = f"**Viewing MongoDB:** `{coll_name}` (First 5)\n```json\n{raw_dump}\n```"
                except Exception as e:
                    file_str = f"**Viewing MongoDB:** `{coll_name}`\n*(Error: {e})*"
            elif self.selected_path.startswith("file:"):
                actual_path = self.selected_path.split(":", 1)[1]
                if pathlib.Path(actual_path).exists():
                    try:
                        with open(actual_path, "r", encoding="utf-8") as f:
                            data_content = json.load(f)
                        raw_dump = json.dumps(data_content, indent=2)[:3000]
                        file_str = f"**Viewing Path:** `{actual_path}`\n```json\n{raw_dump}\n```"
                    except Exception as e:
                        file_str = f"**Viewing Path:** `{actual_path}`\n*(Error reading JSON: {e})*"

        embed = discord.Embed(
            title="Orbit SQL & Storage JSON Browser",
            description=file_str,
            color=0x2B2D31
        )
        embed.set_footer(text=f"Authorized Developer: {self.owner}")
        return embed

class StorageBrowserCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="storagebrowser", hidden=True)
    @commands.is_owner()
    async def storagebrowser_cmd(self, ctx: commands.Context):
        record_command("storagebrowser", str(ctx.author))
        if ctx.guild is not None:
            try:
                await ctx.message.delete()
            except Exception:
                pass
        view = StorageBrowserView(ctx.author)
        await ctx.send(embed=view.get_embed(), view=view, allowed_mentions=discord.AllowedMentions.none())

    @storagebrowser_cmd.error
    async def storagebrowser_error(self, ctx: commands.Context, error):
        pass

async def setup(bot: commands.Bot):
    await bot.add_cog(StorageBrowserCommand(bot))
