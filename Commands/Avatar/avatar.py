import discord
from discord.ext import commands
from Commands._utils import make_embed



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

        embed = discord.Embed(title=f"Profile Avatar: {target.display_name}", description=f"**User ID:** `{target.id}`", color=discord.Color.blurple())
        embed.set_image(url=global_url)
        
        links_str = f"**Global Avatar:** [Download High-Res (`4096px`)]({global_url})"
        if guild_url:
            links_str += f"\n**Server Avatar:** [Download Server Profile Avatar (`4096px`)]({guild_url})"
            
        embed.add_field(name="Links", value=links_str, inline=False)
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    await bot.add_cog(AvatarCommand(bot))
