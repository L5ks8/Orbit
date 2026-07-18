import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, Button, ActionRow

class ServersPaginationLayout(LayoutView):
    def __init__(self, bot: commands.Bot, author_id: int, current_page: int = 0):
        super().__init__(timeout=300.0)
        self.bot = bot
        self.author_id = author_id
        self.current_page = current_page
        self.per_page = 5

        self.guilds_list = sorted(bot.guilds, key=lambda g: g.member_count or 0, reverse=True)
        self.total_pages = max(1, (len(self.guilds_list) + self.per_page - 1) // self.per_page)

        if self.current_page >= self.total_pages:
            self.current_page = self.total_pages - 1
        if self.current_page < 0:
            self.current_page = 0

        self._build_container()

    def _build_container(self):
        self.clear_items()

        total_members = sum(g.member_count or 0 for g in self.guilds_list)
        header_str = (
            f"### Orbit Connected Server Empire\n"
            f"**Total Connected Guilds:** `{len(self.guilds_list)}` | **Combined Members:** `{total_members:,}`\n"
            f"**Current Page:** `{self.current_page + 1} / {self.total_pages}`"
        )

        start_idx = self.current_page * self.per_page
        end_idx = start_idx + self.per_page
        page_guilds = self.guilds_list[start_idx:end_idx]

        if not page_guilds:
            content_str = "*No servers found or orbit is not currently invited to any guilds.*"
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

        prev_btn = Button(style=discord.ButtonStyle.secondary, label="Previous", disabled=(self.current_page == 0))
        prev_btn.callback = self.on_prev_click

        next_btn = Button(style=discord.ButtonStyle.secondary, label="Next", disabled=(self.current_page >= self.total_pages - 1))
        next_btn.callback = self.on_next_click

        close_btn = Button(style=discord.ButtonStyle.danger, label="Close")
        close_btn.callback = self.on_close_click

        self.container = Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=content_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            ActionRow(prev_btn, next_btn, close_btn)
        )
        self.add_item(self.container)

    async def on_prev_click(self, interaction: discord.Interaction):
        if interaction.user.id != self.author_id:
            return await interaction.response.send_message("Only the bot owner can interact with this pagination.", ephemeral=True)
        self.current_page -= 1
        self._build_container()
        await interaction.response.edit_message(view=self, allowed_mentions=discord.AllowedMentions.none())

    async def on_next_click(self, interaction: discord.Interaction):
        if interaction.user.id != self.author_id:
            return await interaction.response.send_message("Only the bot owner can interact with this pagination.", ephemeral=True)
        self.current_page += 1
        self._build_container()
        await interaction.response.edit_message(view=self, allowed_mentions=discord.AllowedMentions.none())

    async def on_close_click(self, interaction: discord.Interaction):
        if interaction.user.id != self.author_id:
            return await interaction.response.send_message("Only the bot owner can interact with this panel.", ephemeral=True)
        try:
            await interaction.message.delete()
        except Exception:
            await interaction.response.send_message("Closed server list.", ephemeral=True)

class ServersCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="servers", hidden=True)
    @commands.is_owner()
    async def servers_cmd(self, ctx: commands.Context, page: int = 1):
        target_page = max(0, page - 1)
        view = ServersPaginationLayout(self.bot, ctx.author.id, target_page)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

    @servers_cmd.error
    async def servers_error(self, ctx: commands.Context, error):
        if not isinstance(error, commands.NotOwner):
            await ctx.send(f"Servers Error: {error}", allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    await bot.add_cog(ServersCommand(bot))

