import discord
from discord.ext import commands
from Components.Commands._utils import make_embed, make_v2_card, ORBIT_COLOR, InteractionContext
from Components.emojis import Emojis
from discord.ui import ActionRow, Button, View


class BannerCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(name="banner", description="Displays a user's profile banner.")
    async def banner(self, interaction: discord.Interaction, user: discord.Member = None):
        ctx = InteractionContext(interaction)
        await ctx.defer()
        target = user or ctx.author

        try:
            full_user = await self.bot.fetch_user(target.id)
        except Exception:
            full_user = target

        if not getattr(full_user, "banner", None):
            return await ctx.send(embed=make_embed(f"`{target.display_name}` does not have a custom profile banner set."), ephemeral=True)

        banner_url = full_user.banner.with_size(4096).url
        link_str = f"[Download High-Res (`4096px`)]({banner_url})"
        btn = Button(label="Download Banner", url=banner_url, style=discord.ButtonStyle.link)

        card = make_v2_card(
            f"# Profile Banner: {full_user.display_name}\n\n**User ID:** `{full_user.id}`\n\n**Banner Link:** {link_str}",
            ActionRow(btn),
            color=ORBIT_COLOR
        )
        if card:
            return await ctx.send(view=card, allowed_mentions=discord.AllowedMentions.none())

        embed = discord.Embed(title=f"Profile Banner: {full_user.display_name}", description=f"**User ID:** `{full_user.id}`", color=ORBIT_COLOR)
        embed.set_image(url=banner_url)
        embed.add_field(name="Banner Link", value=link_str, inline=False)
        view = View()
        view.add_item(btn)
        await ctx.send(embed=embed, view=view, allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    await bot.add_cog(BannerCommand(bot))
