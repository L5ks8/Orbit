import math
import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button

@commands.hybrid_group(name="all", description="View all server items.")
async def all_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        await ctx.send("Please use `/all roles`.", ephemeral=True)

class AllRolesLayout(LayoutView):
    def __init__(self, guild: discord.Guild, roles: list[discord.Role], author_id: int):
        super().__init__()
        self.guild = guild
        self.roles = roles
        self.author_id = author_id
        self.page = 1
        self.per_page = 20
        self.total_pages = max(1, math.ceil(len(self.roles) / self.per_page))
        self.refresh_page()

    def refresh_page(self):
        self.clear_items()
        start_idx = (self.page - 1) * self.per_page
        end_idx = start_idx + self.per_page
        current_roles = self.roles[start_idx:end_idx]

        lines = []
        for index, r in enumerate(current_roles, start=start_idx + 1):
            lines.append(f"`{index}.` {r.mention} - ID: `{r.id}` | Members: `{len(r.members)}`")

        roles_text = "\n".join(lines) if lines else "No roles found on this page."
        header_content = f"### Server Roles List (Page {self.page} of {self.total_pages})\n**Total Roles:** `{len(self.roles)}` on **{self.guild.name}**"

        items = [
            TextDisplay(content=header_content),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=roles_text)
        ]

        btn_close = Button(label="Close", style=discord.ButtonStyle.danger)

        async def close_callback(interaction: discord.Interaction):
            if interaction.user.id != self.author_id:
                return await interaction.response.send_message("You cannot control this panel.", ephemeral=True)
            try:
                await interaction.message.delete()
            except Exception:
                self.clear_items()
                self.add_item(Container(TextDisplay(content="### Roles list closed\nSession ended by moderator.")))
                await interaction.response.edit_message(view=self)
                self.stop()

        btn_close.callback = close_callback

        if self.total_pages > 1:
            btn_prev = Button(label="Previous", style=discord.ButtonStyle.secondary, disabled=(self.page <= 1))
            btn_next = Button(label="Next", style=discord.ButtonStyle.secondary, disabled=(self.page >= self.total_pages))

            async def prev_callback(interaction: discord.Interaction):
                if interaction.user.id != self.author_id:
                    return await interaction.response.send_message("You cannot control these pagination buttons.", ephemeral=True)
                if self.page > 1:
                    self.page -= 1
                    self.refresh_page()
                    await interaction.response.edit_message(view=self)

            async def next_callback(interaction: discord.Interaction):
                if interaction.user.id != self.author_id:
                    return await interaction.response.send_message("You cannot control these pagination buttons.", ephemeral=True)
                if self.page < self.total_pages:
                    self.page += 1
                    self.refresh_page()
                    await interaction.response.edit_message(view=self)

            btn_prev.callback = prev_callback
            btn_next.callback = next_callback
            items.extend([Separator(spacing=discord.SeparatorSpacing.small), ActionRow(btn_prev, btn_next, btn_close)])
        else:
            items.extend([Separator(spacing=discord.SeparatorSpacing.small), ActionRow(btn_close)])

        self.container = Container(*items)
        self.add_item(self.container)

async def _do_allroles(ctx: commands.Context):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)

    roles = [r for r in reversed(ctx.guild.roles) if not r.is_default()]
    if not roles:
        return await ctx.send("There are no custom roles on this server.", ephemeral=True)

    view = AllRolesLayout(ctx.guild, roles, ctx.author.id)
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

@all_group.command(name="roles", aliases=["allroles"], description="Display all roles on the server.")
async def all_roles_cmd(ctx: commands.Context):
    await _do_allroles(ctx)

class AllRolesFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="allroles", aliases=["all roles"], hidden=True)
    async def allroles_prefix(self, ctx: commands.Context):
        await _do_allroles(ctx)

async def setup(bot: commands.Bot):
    if "all" not in bot.all_commands:
        bot.add_command(all_group)
    await bot.add_cog(AllRolesFallback(bot))

