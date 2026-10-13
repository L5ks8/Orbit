import discord
from discord.ext import commands
from Components.Commands._utils import make_embed, make_v2_card, ORBIT_COLOR
from Components.emojis import Emojis
from discord.ui import ActionRow, Button, View


class AvatarCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="avatar", description="Displays a user's high-resolution global and server avatars.")
    async def avatar(self, ctx: commands.Context, user: discord.Member = None):
        await ctx.defer()
        target = user or ctx.author
        if not isinstance(target, discord.Member):
            return await ctx.send(embed=make_embed("Please specify a valid member.", discord.Color.red()), ephemeral=True)

        global_url = target.avatar.with_size(4096).url if target.avatar else target.display_avatar.with_size(4096).url
        guild_url = target.guild_avatar.with_size(4096).url if target.guild_avatar else None

        links_str = f"**Global Avatar:** [Download High-Res (`4096px`)]({global_url})"
        if guild_url:
            links_str += f"\n**Server Avatar:** [Download Server Profile Avatar (`4096px`)]({guild_url})"

        buttons = [Button(label="Global Avatar", url=global_url, style=discord.ButtonStyle.link)]
        if guild_url:
            buttons.append(Button(label="Server Avatar", url=guild_url, style=discord.ButtonStyle.link))

        card = make_v2_card(
            f"# Profile Avatar: {target.display_name}\n\n**User ID:** `{target.id}`\n\n{links_str}",
            ActionRow(*buttons),
            color=ORBIT_COLOR
        )
        if card:
            return await ctx.send(view=card, allowed_mentions=discord.AllowedMentions.none())

        embed = discord.Embed(title=f"Profile Avatar: {target.display_name}", description=f"**User ID:** `{target.id}`", color=ORBIT_COLOR)
        embed.set_image(url=global_url)
        embed.add_field(name="Links", value=links_str, inline=False)
        view = View()
        for b in buttons:
            view.add_item(b)
        await ctx.send(embed=embed, view=view, allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    await bot.add_cog(AvatarCommand(bot))
