import math
import discord
from discord.ext import commands
from Commands.Ban._storage import get_ban_history
from Commands._utils import MemberOrIDConverter, format_usage

class BanHistoryLayout(discord.ui.View):
    def __init__(self, guild_id: int, target_id: int, target_name: str, bans: list[dict], author_id: int, page: int = 1):
        super().__init__(timeout=300)
        self.guild_id = guild_id
        self.target_id = target_id
        self.target_name = target_name
        self.bans = bans
        self.author_id = author_id
        self.page = page
        self.per_page = 5
        self.total_pages = max(1, math.ceil(len(self.bans) / self.per_page))

    def get_kwargs(self):
        start = (self.page - 1) * self.per_page
        end = start + self.per_page
        slice_bans = self.bans[start:end]

        btn_close = discord.ui.Button(label="Close", style=discord.ButtonStyle.danger)

        async def close_cb(interaction: discord.Interaction):
            if interaction.user.id != self.author_id:
                return await interaction.response.send_message("You cannot control this panel.", ephemeral=True)
            try:
                await interaction.message.delete()
            except Exception:
                pass

        btn_close.callback = close_cb
        buttons = []

        if self.total_pages > 1:
            btn_prev = discord.ui.Button(label="Previous", style=discord.ButtonStyle.secondary, disabled=(self.page <= 1))
            btn_next = discord.ui.Button(label="Next", style=discord.ButtonStyle.secondary, disabled=(self.page >= self.total_pages))

            async def prev_cb(interaction: discord.Interaction):
                if interaction.user.id != self.author_id:
                    return await interaction.response.send_message("You cannot control this panel.", ephemeral=True)
                self.page -= 1
                await interaction.response.edit_message(**self.get_kwargs())

            async def next_cb(interaction: discord.Interaction):
                if interaction.user.id != self.author_id:
                    return await interaction.response.send_message("You cannot control this panel.", ephemeral=True)
                self.page += 1
                await interaction.response.edit_message(**self.get_kwargs())

            btn_prev.callback = prev_cb
            btn_next.callback = next_cb
            buttons.extend([btn_prev, btn_next])

        buttons.append(btn_close)

        from Embeds import get_command_embed
        return get_command_embed(
            self.guild_id, "banhistory", msg_type="list",
            target_id=self.target_id, target_name=self.target_name,
            total_bans=len(self.bans), page=self.page, total_pages=self.total_pages,
            slice_bans=slice_bans, components=buttons
        )

async def _do_banhistory(ctx: commands.Context, target: discord.User | discord.Member):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)
    bans = get_ban_history(ctx.guild.id, target.id)
    if not bans:
        return await ctx.send(f"`{target.display_name}` has no permanent ban history on this server.", ephemeral=True)
    view = BanHistoryLayout(ctx.guild.id, target.id, target.display_name, bans, ctx.author.id)
    await ctx.send(**view.get_kwargs(), allowed_mentions=discord.AllowedMentions.none())

class BanHistoryCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="banhistory", aliases=["bhistory", "pastbans"], description="Check the complete, permanent ban history of a user.")
    @commands.has_permissions(ban_members=True)
    async def banhistory_cmd(self, ctx: commands.Context, user: discord.Member | discord.User):
        await _do_banhistory(ctx, user)

    @banhistory_cmd.error
    async def banhistory_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Ban Members permission to view ban history.", ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send(format_usage("-banhistory", "<@user>"), ephemeral=True)
        elif isinstance(error, commands.BadArgument):
            await ctx.send(f"{format_usage('-banhistory', '<@user>')}", ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(BanHistoryCog(bot))
