import discord
from discord.ext import commands
from Commands.Voice._storage import remove_from_vcban
from Commands.Voice.voice import voice_group



async def _do_vc_unban(ctx: commands.Context, user: discord.User, reason: str):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)

    success = remove_from_vcban(ctx.guild.id, user.id)
    if not success:
        return await ctx.send("This user is not currently voice banned on this server.", ephemeral=True)

    from Embeds import get_command_embed
    kwargs = get_command_embed(ctx.guild.id, "voice", msg_type="unban", member_mention=user.mention, member_id=user.id, reason=reason, author_mention=ctx.author.mention)
    await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())

@voice_group.command(name="unban", description="Remove a voice ban from a user.")
@commands.has_permissions(move_members=True)
async def vc_unban_cmd(ctx: commands.Context, user: discord.User, *, reason: str = "No reason provided"):
    await _do_vc_unban(ctx, user, reason)

@vc_unban_cmd.error
async def vcunban_error(ctx: commands.Context, error):
    if isinstance(error, commands.MissingPermissions):
        await ctx.send("You need Move Members permission to voice unban users.", ephemeral=True)
    elif isinstance(error, commands.MissingRequiredArgument):
        await ctx.send("Usage: `-voice unban <@user> [reason]`", ephemeral=True)
    else:
        await ctx.send(f"An error occurred: {error}", ephemeral=True)

class VcUnbanCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

class VcUnbanPrefixFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="vc_unban", aliases=["vcunban"], hidden=True)
    @commands.has_permissions(move_members=True)
    async def vc_unban_prefix(self, ctx: commands.Context, user: discord.User, *, reason: str = "No reason provided"):
        await _do_vc_unban(ctx, user, reason)

async def setup(bot: commands.Bot):
    from Commands.Voice.voice import voice_group
    if "voice" not in bot.all_commands:
        bot.add_command(voice_group)
    await bot.add_cog(VcUnbanCommand(bot))
    await bot.add_cog(VcUnbanPrefixFallback(bot))

