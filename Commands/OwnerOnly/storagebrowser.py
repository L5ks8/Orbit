import json
import pathlib
import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Select, Button
from Commands.OwnerOnly._monitor import record_command

class StorageBrowserSelect(Select):
    def __init__(self, parent_view: "StorageBrowserLayoutView"):
        self.parent_view = parent_view
        storage_dir = pathlib.Path("Storage")
        options = []
        if storage_dir.exists():
            for p in storage_dir.glob("*.json"):
                options.append(discord.SelectOption(label=f"Global: {p.name}", value=str(p)))
            for folder in storage_dir.iterdir():
                if folder.is_dir() and folder.name.isdigit():
                    for p in folder.glob("*.json"):
                        options.append(discord.SelectOption(label=f"Guild {folder.name}: {p.name}"[:100], value=str(p)))

        if not options:
            options.append(discord.SelectOption(label="No storage files found", value="none"))

        super().__init__(placeholder="Select JSON Database File from Storage...", options=options[:25], min_values=1, max_values=1)

    async def callback(self, interaction: discord.Interaction):
        await interaction.response.defer()
        if self.values[0] != "none":
            self.parent_view.selected_path = self.values[0]
        self.parent_view.build_ui()
        try:
            await interaction.edit_original_response(view=self.parent_view)
        except Exception:
            pass


class StorageBrowserLayoutView(LayoutView):
    def __init__(self, owner: discord.abc.User):
        super().__init__(timeout=None)
        self.owner = owner
        self.selected_path = "Storage/devmode.json" if pathlib.Path("Storage/devmode.json").exists() else None
        self.build_ui()

    def build_ui(self):
        self.clear_items()
        file_select = StorageBrowserSelect(self)

        file_str = "No file selected."
        if self.selected_path and pathlib.Path(self.selected_path).exists():
            try:
                with open(self.selected_path, "r", encoding="utf-8") as f:
                    data_content = json.load(f)
                raw_dump = json.dumps(data_content, indent=2)[:1300]
                file_str = f"**Viewing Path:** `{self.selected_path}`\n```json\n{raw_dump}\n```"
            except Exception as e:
                file_str = f"**Viewing Path:** `{self.selected_path}`\n*(Error reading JSON: {e})*"

        self.container = Container(
            TextDisplay(content=f"### Orbit SQL & Storage JSON Browser\n**Authorized Developer:** {self.owner.mention}"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=file_str)
        )
        self.add_item(self.container)

        btn_close = Button(label="Close Browser", style=discord.ButtonStyle.secondary)

        async def _close_cb(interaction: discord.Interaction):
            try:
                await interaction.message.delete()
            except Exception:
                self.clear_items()
                self.container = Container(
                    TextDisplay(content="### Orbit SQL & Storage JSON Browser\n*Browser Closed by Owner.*")
                )
                self.add_item(self.container)
                await interaction.response.edit_message(view=self)

        btn_close.callback = _close_cb

        self.add_item(ActionRow(file_select))
        self.add_item(ActionRow(btn_close))


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
        view = StorageBrowserLayoutView(ctx.author)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

    @storagebrowser_cmd.error
    async def storagebrowser_error(self, ctx: commands.Context, error):
        pass


async def setup(bot: commands.Bot):
    await bot.add_cog(StorageBrowserCommand(bot))
