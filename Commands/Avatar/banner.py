import discord
from discord.ext import commands
from discord.ui import Container, TextDisplay, Separator



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
        from Embeds import get_command_embed
        kwargs = get_command_embed(ctx.guild.id if ctx.guild else 0, "banner", msg_type="default", target=full_user, banner_url=banner_url)
        await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    await bot.add_cog(BannerCommand(bot))

