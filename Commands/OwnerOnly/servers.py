import discord
from discord.ext import commands
from discord.ui import View, Button
from Commands._utils import make_embed

class ServersPaginationView(View):
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

        self._build_ui()

    def _build_ui(self):
        self.clear_items()
        
        prev_btn = Button(style=discord.ButtonStyle.secondary, label="Previous", disabled=(self.current_page == 0))
        prev_btn.callback = self.on_prev_click

        next_btn = Button(style=discord.ButtonStyle.secondary, label="Next", disabled=(self.current_page >= self.total_pages - 1))
        next_btn.callback = self.on_next_click

        close_btn = Button(style=discord.ButtonStyle.danger, label="Close")
        close_btn.callback = self.on_close_click

        self.add_item(prev_btn)
        self.add_item(next_btn)
        self.add_item(close_btn)

    def get_embed(self) -> discord.Embed:
        total_members = sum(g.member_count or 0 for g in self.guilds_list)
        
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
            
        embed = discord.Embed(
            title="Orbit Connected Server Empire",
            description=content_str,
            color=0x2B2D31
        )
        embed.add_field(name="Stats", value=f"**Total Guilds:** `{len(self.guilds_list)}`\n**Total Members:** `{total_members:,}`", inline=False)
        embed.set_footer(text=f"Page {self.current_page + 1} / {self.total_pages}")
        return embed

    async def on_prev_click(self, interaction: discord.Interaction):
        if interaction.user.id != self.author_id:
            return await interaction.response.send_message(embed=make_embed("Only the bot owner can interact with this pagination.", discord.Color.red()), ephemeral=True)
        self.current_page -= 1
        self._build_ui()
        await interaction.response.edit_message(embed=self.get_embed(), view=self)

    async def on_next_click(self, interaction: discord.Interaction):
        if interaction.user.id != self.author_id:
            return await interaction.response.send_message(embed=make_embed("Only the bot owner can interact with this pagination.", discord.Color.red()), ephemeral=True)
        self.current_page += 1
        self._build_ui()
        await interaction.response.edit_message(embed=self.get_embed(), view=self)

    async def on_close_click(self, interaction: discord.Interaction):
        if interaction.user.id != self.author_id:
            return await interaction.response.send_message(embed=make_embed("Only the bot owner can interact with this panel.", discord.Color.red()), ephemeral=True)
        try:
            await interaction.message.delete()
        except Exception:
            pass

class ServersCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="servers", hidden=True)
    @commands.is_owner()
    async def servers_cmd(self, ctx: commands.Context, page: int = 1):
        target_page = max(0, page - 1)
        view = ServersPaginationView(self.bot, ctx.author.id, target_page)
        await ctx.send(embed=view.get_embed(), view=view, allowed_mentions=discord.AllowedMentions.none())

    @servers_cmd.error
    async def servers_error(self, ctx: commands.Context, error):
        if not isinstance(error, commands.NotOwner):
            await ctx.send(embed=make_embed(f"Servers Error: {error}", discord.Color.red()), allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    await bot.add_cog(ServersCommand(bot))