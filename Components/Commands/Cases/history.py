import discord
from discord import app_commands
from discord.ext import commands
from Components.Commands.Cases._storage import get_user_cases
from Components.Commands._utils import format_usage, make_embed

class HistoryPagination(discord.ui.View):
    def __init__(self, target_name: str, cases: list, per_page: int = 5):
        super().__init__(timeout=180)
        self.target_name = target_name
        self.cases = cases
        self.per_page = per_page
        self.current_page = 0
        self.total_pages = max(1, (len(cases) + per_page - 1) // per_page)
        
        self.btn_prev = discord.ui.Button(label="Previous", style=discord.ButtonStyle.secondary, disabled=True)
        self.btn_prev.callback = self.on_prev
        self.add_item(self.btn_prev)
        
        self.btn_page = discord.ui.Button(label=f"Page 1/{self.total_pages}", style=discord.ButtonStyle.secondary, disabled=True)
        self.add_item(self.btn_page)
        
        self.btn_next = discord.ui.Button(label="Next", style=discord.ButtonStyle.primary, disabled=self.total_pages <= 1)
        self.btn_next.callback = self.on_next
        self.add_item(self.btn_next)

    def _generate_embed(self) -> discord.Embed:
        embed = discord.Embed(
            title=f"Moderation History: {self.target_name}",
            color=discord.Color.blurple()
        )
        
        start_idx = self.current_page * self.per_page
        end_idx = start_idx + self.per_page
        page_cases = self.cases[start_idx:end_idx]
        
        lines = []
        for case in page_cases:
            case_id = case.get("case_id", "?")
            action = str(case.get("action", "Unknown")).upper()
            mod_id = case.get("moderator_id", "Unknown")
            reason = case.get("reason", "No reason provided")
            timestamp = case.get("timestamp", 0)
            
            lines.append(
                f"**Case #{case_id}** | {action}\n"
                f"**Moderator:** <@{mod_id}>\n"
                f"**Reason:** {reason}\n"
                f"**Date:** <t:{timestamp}:f>"
            )
            
        embed.description = "\n\n".join(lines) if lines else "No cases found on this page."
        return embed

    async def _update_view(self, interaction: discord.Interaction):
        self.btn_prev.disabled = (self.current_page == 0)
        self.btn_next.disabled = (self.current_page == self.total_pages - 1)
        self.btn_page.label = f"Page {self.current_page + 1}/{self.total_pages}"
        await interaction.response.edit_message(embed=self._generate_embed(), view=self)

    async def on_prev(self, interaction: discord.Interaction):
        self.current_page -= 1
        await self._update_view(interaction)

    async def on_next(self, interaction: discord.Interaction):
        self.current_page += 1
        await self._update_view(interaction)


class HistoryCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="history", description="Check the moderation history of a user.")
    @app_commands.describe(user="The user to check", page="The page number to view")
    @commands.has_permissions(moderate_members=True)
    async def history_cmd(self, ctx: commands.Context, user: discord.Member | discord.User, page: int = 1):
        cases = get_user_cases(ctx.guild.id, user.id)
        if not cases:
            embed = discord.Embed(description="This user has no history.", color=discord.Color.red())
            return await ctx.send(embed=embed, ephemeral=True)
            
        view = HistoryPagination(user.display_name, cases)
        
        if page > 1 and page <= view.total_pages:
            view.current_page = page - 1
            
        view.btn_prev.disabled = (view.current_page == 0)
        view.btn_next.disabled = (view.current_page == view.total_pages - 1)
        view.btn_page.label = f"Page {view.current_page + 1}/{view.total_pages}"
        
        await ctx.send(embed=view._generate_embed(), view=view)

    @history_cmd.error
    async def history_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send(embed=make_embed("You need Moderate Members permission to view history.", discord.Color.red()), ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send(embed=make_embed(format_usage("-history", "<@user>"), discord.Color.red()), ephemeral=True)
        elif isinstance(error, commands.BadArgument):
            await ctx.send(embed=make_embed(f"{format_usage('-history','<@user>')}"), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)


async def setup(bot: commands.Bot):
    await bot.add_cog(HistoryCog(bot))