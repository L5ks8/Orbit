import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator

async def _do_user_info(ctx: commands.Context, user: discord.Member | None):
    await ctx.defer()
    target = user or ctx.author
    if not isinstance(target, discord.Member):
        return await ctx.send("Please specify a valid member of this server.", ephemeral=True)

    from Embeds import get_command_embed
    kwargs = get_command_embed(ctx.guild.id, "user", msg_type="info", member=target)
    await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())

class UserInfoCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="userinfo", aliases=["user"], description="Display member statistics and roles.")
    async def userinfo_cmd(self, ctx: commands.Context, user: discord.Member = None):
        await _do_user_info(ctx, user)

async def setup(bot: commands.Bot):
    await bot.add_cog(UserInfoCommand(bot))
