import discord
from discord.ext import commands
from Commands._utils import make_embed



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
            return await ctx.send(embed=make_embed(f"`{target.display_name}` does not have a custom profile banner set."), ephemeral=True)

        banner_url = full_user.banner.with_size(4096).url
        embed = discord.Embed(title=f"Profile Banner: {full_user.display_name}", description=f"**User ID:** `{full_user.id}`", color=discord.Color.blurple())
        embed.set_image(url=banner_url)
        embed.add_field(name="Banner Link", value=f"[Download High-Res (`4096px`)]({banner_url})", inline=False)
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    await bot.add_cog(BannerCommand(bot))
