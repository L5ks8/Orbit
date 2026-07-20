import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Info.info import info_group

async def _do_user_info(ctx: commands.Context, user: discord.Member | None):
    await ctx.defer()
    target = user or ctx.author
    if not isinstance(target, discord.Member):
        return await ctx.send("Please specify a valid member of this server.", ephemeral=True)

    from Embeds import get_command_embed
    kwargs = get_command_embed(ctx.guild.id, "user", msg_type="info", member=target)
    await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())

@info_group.command(name="user", description="Display member statistics and roles.")
async def info_user_cmd(ctx: commands.Context, user: discord.Member = None):
    await _do_user_info(ctx, user)

class UserInfoCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

class UserInfoPrefixFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="inf_user", aliases=["infouser", "userinfo", "info user"], hidden=True)
    async def info_user_prefix(self, ctx: commands.Context, user: discord.Member = None):
        await _do_user_info(ctx, user)

async def setup(bot: commands.Bot):
    from Commands.Info.info import info_group
    if "info" not in bot.all_commands:
        bot.add_command(info_group)
    await bot.add_cog(UserInfoCommand(bot))
    await bot.add_cog(UserInfoPrefixFallback(bot))

