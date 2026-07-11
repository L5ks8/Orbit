import math
import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, Button, ActionRow
from Commands.Warn._storage import get_user_warnings
from Commands.Warn._group import warn_group

class WarningsListLayout(LayoutView):
    def __init__(self, member: discord.Member, warnings: list[dict], author_id: int, page: int = 1):
        super().__init__()
        self.member = member
        self.warnings = warnings
        self.author_id = author_id
        self.page = page
        self.per_page = 5
        self.total_pages = max(1, math.ceil(len(self.warnings) / self.per_page))
        self._build_view()

    def _build_view(self):
        self.clear_items()
        start = (self.page - 1) * self.per_page
        end = start + self.per_page
        slice_warns = self.warnings[start:end]

        lines = []
        for w in slice_warns:
            lines.append(
                f"**ID:** `{w['warn_id']}` | **Mod:** <@{w['moderator_id']}>\n"
                f"**Reason:** {w['reason']} (<t:{w['timestamp']}:R>)"
            )

        warns_text = "\n\n".join(lines) if lines else "No warnings found on this page."
        header_content = f"### Warning History: {self.member.mention} (Page {self.page} of {self.total_pages})\n**Total Warnings:** `{len(self.warnings)}` on **{self.member.guild.name}**"

        items = [
            TextDisplay(content=header_content),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=warns_text)
        ]

        btn_close = Button(label="Close ✖", style=discord.ButtonStyle.danger)

        async def close_cb(interaction: discord.Interaction):
            if interaction.user.id != self.author_id:
                return await interaction.response.send_message("You cannot control this panel.", ephemeral=True)
            try:
                await interaction.message.delete()
            except Exception:
                self.clear_items()
                self.add_item(Container(TextDisplay(content="### Warning log closed.")))
                await interaction.response.edit_message(view=self)
                self.stop()

        btn_close.callback = close_cb

        if self.total_pages > 1:
            btn_prev = Button(label="◀ Previous", style=discord.ButtonStyle.secondary, disabled=(self.page <= 1))
            btn_next = Button(label="Next ▶", style=discord.ButtonStyle.secondary, disabled=(self.page >= self.total_pages))

            async def prev_cb(interaction: discord.Interaction):
                if interaction.user.id != self.author_id:
                    return await interaction.response.send_message("You cannot control this panel.", ephemeral=True)
                self.page -= 1
                self._build_view()
                await interaction.response.edit_message(view=self)

            async def next_cb(interaction: discord.Interaction):
                if interaction.user.id != self.author_id:
                    return await interaction.response.send_message("You cannot control this panel.", ephemeral=True)
                self.page += 1
                self._build_view()
                await interaction.response.edit_message(view=self)

            btn_prev.callback = prev_cb
            btn_next.callback = next_cb

            row = ActionRow(btn_prev, btn_next, btn_close)
            items.extend([Separator(spacing=discord.SeparatorSpacing.small), row])
        else:
            items.extend([Separator(spacing=discord.SeparatorSpacing.small), ActionRow(btn_close)])

        self.container = Container(*items)
        self.add_item(self.container)

async def _do_warn_list(ctx: commands.Context, user: discord.Member | None):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)

    target = user or ctx.author
    warns = get_user_warnings(ctx.guild.id, target.id)
    if not warns:
        return await ctx.send(f"`{target.display_name}` has 0 formal warnings on this server.", ephemeral=True)

    view = WarningsListLayout(target, warns, ctx.author.id)
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

@warn_group.command(name="list", description="Displays all formal warnings issued to a user (`/warn list`).")
async def warn_list_cmd(ctx: commands.Context, user: discord.Member = None):
    await _do_warn_list(ctx, user)

class WarningsCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @warn_list_cmd.error
    async def warnings_error(self, ctx: commands.Context, error):
        await ctx.send(f"An error occurred: {error}", ephemeral=True)

class WarningsPrefixFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="warn list", aliases=["warnlist", "warnings"], hidden=True)
    async def warn_list_prefix(self, ctx: commands.Context, user: discord.Member = None):
        await _do_warn_list(ctx, user)

async def setup(bot: commands.Bot):
    await bot.add_cog(WarningsCommand(bot))
    await bot.add_cog(WarningsPrefixFallback(bot))
