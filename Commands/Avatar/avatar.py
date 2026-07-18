utf-8import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button

class AvatarLayout(LayoutView):
    def __init__(self, member: discord.Member, avatar_url: str, guild_avatar_url: str = None):
        super().__init__()
        header_str = f"### Profile Avatar: **{member.display_name}**\n**User ID:** `{member.id}`"
        
        links_str = f"**Global Avatar:** [Download High-Res (`4096px`)]({avatar_url})"
        if guild_avatar_url:
            links_str += f"\n**Server Avatar:** [Download Server Profile Avatar (`4096px`)]({guild_avatar_url})"

        self.container = Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=links_str)
        )
        self.add_item(self.container)

class AvatarCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="avatar", description="Displays a user's high-resolution global and server avatars.")
    async def avatar(self, ctx: commands.Context, user: discord.Member = None):
        await ctx.defer()
        target = user or ctx.author
        if not isinstance(target, discord.Member):
            return await ctx.send("Please specify a valid member.", ephemeral=True)

        global_url = target.avatar.with_size(4096).url if target.avatar else target.display_avatar.with_size(4096).url
        guild_url = target.guild_avatar.with_size(4096).url if target.guild_avatar else None

        view = AvatarLayout(target, global_url, guild_url)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    await bot.add_cog(AvatarCommand(bot))
