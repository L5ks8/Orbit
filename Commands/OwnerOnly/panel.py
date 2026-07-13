import json
import pathlib
import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button, Select
from Commands.OwnerOnly._monitor import get_system_metrics, get_error_log, clear_errors, record_command

class MasterPanelLayoutView(LayoutView):
    def __init__(self, bot: commands.Bot, owner: discord.abc.User):
        super().__init__(timeout=None)
        self.bot = bot
        self.owner = owner
        self.current_tab = "dashboard"
        
        # Servers pagination
        self.servers_page = 0
        self.per_page = 5
        self.guilds_list = sorted(bot.guilds, key=lambda g: g.member_count or 0, reverse=True)
        self.total_server_pages = max(1, (len(self.guilds_list) + self.per_page - 1) // self.per_page)

        # Storage browser
        self.selected_storage_path = None
        
        self.build_ui()

    def build_ui(self):
        self.clear_items()
        
        # Tab selector
        options = [
            discord.SelectOption(label="Performance Dashboard", value="dashboard", description="RAM, CPU, Cache Hits, Throughput"),
            discord.SelectOption(label="System Error Inspector", value="errors", description="View internal system ring buffer"),
            discord.SelectOption(label="Server Directory", value="servers", description="List all connected Discord guilds"),
            discord.SelectOption(label="Storage Explorer", value="storage", description="Browse internal JSON databases")
        ]
        
        tab_select = Select(placeholder="Select Control Panel Module...", options=options, min_values=1, max_values=1)
        
        async def _tab_cb(interaction: discord.Interaction):
            if interaction.user.id != self.owner.id:
                return await interaction.response.send_message("Not authorized.", ephemeral=True)
            self.current_tab = tab_select.values[0]
            self.build_ui()
            await interaction.response.edit_message(view=self)
            
        tab_select.callback = _tab_cb
        
        # Build specific tab container
        if self.current_tab == "dashboard":
            self.container = self._build_dashboard_container()
        elif self.current_tab == "errors":
            self.container = self._build_errors_container()
        elif self.current_tab == "servers":
            self.container = self._build_servers_container()
        elif self.current_tab == "storage":
            self.container = self._build_storage_container()

        self.add_item(self.container)
        self.add_item(ActionRow(tab_select))

        # Add specific action rows for the current tab
        if self.current_tab == "errors":
            btn_clear = Button(label="Clear Error Buffer", style=discord.ButtonStyle.danger)
            async def _clear_cb(interaction: discord.Interaction):
                if interaction.user.id != self.owner.id: return
                clear_errors()
                self.build_ui()
                await interaction.response.edit_message(view=self)
            btn_clear.callback = _clear_cb
            self.add_item(ActionRow(btn_clear))
            
        elif self.current_tab == "servers":
            prev_btn = Button(style=discord.ButtonStyle.secondary, label="Previous", disabled=(self.servers_page == 0))
            next_btn = Button(style=discord.ButtonStyle.secondary, label="Next", disabled=(self.servers_page >= self.total_server_pages - 1))
            
            async def _prev_cb(interaction: discord.Interaction):
                if interaction.user.id != self.owner.id: return
                self.servers_page -= 1
                self.build_ui()
                await interaction.response.edit_message(view=self)
                
            async def _next_cb(interaction: discord.Interaction):
                if interaction.user.id != self.owner.id: return
                self.servers_page += 1
                self.build_ui()
                await interaction.response.edit_message(view=self)
                
            prev_btn.callback = _prev_cb
            next_btn.callback = _next_cb
            self.add_item(ActionRow(prev_btn, next_btn))
            
        elif self.current_tab == "storage":
            storage_dir = pathlib.Path("Storage")
            s_options = []
            if storage_dir.exists():
                for p in storage_dir.glob("*.json"):
                    s_options.append(discord.SelectOption(label=f"Global: {p.name}", value=str(p)))
                for folder in storage_dir.iterdir():
                    if folder.is_dir() and folder.name.isdigit():
                        for p in folder.glob("*.json"):
                            if len(s_options) < 25:
                                s_options.append(discord.SelectOption(label=f"Guild {folder.name}: {p.name}"[:100], value=str(p)))
                                
            if not s_options:
                s_options.append(discord.SelectOption(label="No storage files found", value="none"))
                
            file_select = Select(placeholder="Select JSON File...", options=s_options[:25], min_values=1, max_values=1)
            
            async def _file_cb(interaction: discord.Interaction):
                if interaction.user.id != self.owner.id: return
                if file_select.values[0] != "none":
                    self.selected_storage_path = file_select.values[0]
                self.build_ui()
                await interaction.response.edit_message(view=self)
                
            file_select.callback = _file_cb
            self.add_item(ActionRow(file_select))


    def _build_dashboard_container(self) -> Container:
        metrics = get_system_metrics(self.bot)
        header_str = f"**RAM Hit Rate:** `{metrics['cache_hit_rate']}%`"
        content_str = (
            f"**In-Memory RAM Cache Statistics:**\n"
            f"> **Cache Hits (Zero Disk Read):** `{metrics['cache_hits']}`\n"
            f"> **Cache Misses (First Disk Read):** `{metrics['cache_misses']}`\n"
            f"> **Cache Writes (Synchronized Save):** `{metrics['cache_writes']}`\n\n"
            f"**Message & Command Throughput:**\n"
            f"> **Total Messages Processed:** `{metrics['messages']}`\n"
            f"> **Total Commands Executed:** `{metrics['commands']}`\n\n"
            f"**Asyncio & OS Concurrency:**\n"
            f"> **Active Asyncio Tasks:** `{metrics['asyncio_tasks']}`\n"
            f"> **Active OS Python Threads:** `{metrics['threads']}`\n"
            f"> **Connected Cluster Shards:** `{metrics['shards']}` (`{metrics['ping_ms']} ms avg`)\n\n"
            f"**Hardware & OS:**\n"
            f"> **RAM Usage:** `{metrics['ram_mb']} MB` (`{metrics['total_ram']} GB OS Total`)\n"
            f"> **CPU Load:** `{metrics['cpu_pct']}%` (`{metrics['sys_cpu']}% OS Total`)"
        )
        return Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=content_str)
        )

    def _build_errors_container(self) -> Container:
        errs = get_error_log()
        header_str = "**System Errors:**"
        
        if not errs:
            content_str = "0 Errors."
        else:
            lines = []
            for e in errs[:5]:
                clean_msg = str(e.get("message", ""))[:65]
                lines.append(f"`[{e.get('timestamp', '')}]` **[{e.get('source', '')}]** — `{clean_msg}`")
            content_str = f"**Caught Error Ring Buffer ({len(errs)} stored):**\n" + "\n".join(lines)
            
            latest_tb = errs[0].get("traceback", "")
            if latest_tb:
                content_str += f"\n\n**Latest Traceback ({errs[0].get('source', '')}):**\n```python\n{latest_tb[:450]}\n```"

            if len(content_str) > 1700:
                content_str = content_str[:1700] + "\n``` (truncated)"
                
        return Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=content_str)
        )

    def _build_servers_container(self) -> Container:
        total_members = sum(g.member_count or 0 for g in self.guilds_list)
        header_str = (
            f"**Guilds:** `{len(self.guilds_list)}` | **Members:** `{total_members:,}` | "
            f"**Page:** `{self.servers_page + 1} / {self.total_server_pages}`"
        )

        start_idx = self.servers_page * self.per_page
        end_idx = start_idx + self.per_page
        page_guilds = self.guilds_list[start_idx:end_idx]

        if not page_guilds:
            content_str = "None."
        else:
            lines = []
            for idx, g in enumerate(page_guilds, start=start_idx + 1):
                owner_str = f"<@{g.owner_id}> (`{g.owner_id}`)" if g.owner_id else "Unknown"
                lines.append(
                    f"**{idx}. {g.name}**\n"
                    f"> **ID:** `{g.id}` | **Members:** `{g.member_count or 0:,}`\n"
                    f"> **Owner:** {owner_str}"
                )
            content_str = "\n\n".join(lines)

        return Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=content_str)
        )

    def _build_storage_container(self) -> Container:
        header_str = "**JSON Storage Browser:**"
        
        file_str = "No file selected."
        if self.selected_storage_path and pathlib.Path(self.selected_storage_path).exists():
            try:
                with open(self.selected_storage_path, "r", encoding="utf-8") as f:
                    data_content = json.load(f)
                raw_dump = json.dumps(data_content, indent=2)[:1300]
                file_str = f"**Viewing Path:** `{self.selected_storage_path}`\n```json\n{raw_dump}\n```"
            except Exception as e:
                file_str = f"`{self.selected_storage_path}`\n*(Error: {e})*"

        return Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=file_str)
        )


class PanelCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="panel", aliases=["hub", "dashboard", "errors", "servers"], hidden=True)
    @commands.is_owner()
    async def panel_cmd(self, ctx: commands.Context):
        record_command("panel", str(ctx.author))
        if ctx.guild is not None:
            try:
                await ctx.message.delete()
            except Exception:
                pass
        view = MasterPanelLayoutView(self.bot, ctx.author)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

    @panel_cmd.error
    async def panel_error(self, ctx: commands.Context, error):
        pass

async def setup(bot: commands.Bot):
    await bot.add_cog(PanelCommand(bot))
