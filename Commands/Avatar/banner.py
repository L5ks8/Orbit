utf-8import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator

class BannerLayout(LayoutView):
    def __init__(self, user: discord.User, banner_url: str):
        super().__init__()
        header_str = f"### Profile Banner: **{user.display_name}**\n**User ID:** `{user.id}`"
        links_str = f"**Banner Link:** [Download High-Res (`4096px`)]({banner_url})"

        self.container = Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=links_str)
        )
        self.add_item(self.container)

class BannerCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="banner", description="Displays a user's profile banner.")
    async def banner(self, ctx: commands.Context, user: discord.Member = None):
        await ctx.defer()
        target = user or ctx.author

        try:
            full_user = await self.bot.fetch_user(target.id)
        except Exception:
            full_user = target

        if not getattr(full_user, "banner", None):
            return await ctx.send(f"`{target.display_name}` does not have a custom profile banner set.", ephemeral=True)

        banner_url = full_user.banner.with_size(4096).url
        view = BannerLayout(full_user, banner_url)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    await bot.add_cog(BannerCommand(bot))
