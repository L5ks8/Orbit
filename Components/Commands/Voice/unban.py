import discord
from discord.ext import commands
from Components.Commands.Voice._storage import remove_from_vcban
from Components.Commands.Voice.voice import voice_group



async def _do_vc_unban(ctx: commands.Context, user: discord.User, reason: str):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send(embed=make_embed("This command must be run inside a server.", discord.Color.red()), ephemeral=True)

    success = remove_from_vcban(ctx.guild.id, user.id)
    if not success:
        return await ctx.send(embed=make_embed("This user is not currently voice banned on this server.", discord.Color.red()), ephemeral=True)

    embed = discord.Embed(title="Voice Unbanned", color=discord.Color.green())
    embed.add_field(name="Target", value=f"{user.mention} (`{user.id}`)", inline=False)
    if reason and reason != "No reason provided":
        embed.add_field(name="Reason", value=reason, inline=False)
    embed.add_field(name="Moderator", value=ctx.author.mention, inline=False)
    embed.add_field(name="Status", value="`Cleared`", inline=False)
    await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

@voice_group.command(name="unban", description="Remove a voice ban from a user.")
@commands.has_permissions(move_members=True)
async def vc_unban_cmd(ctx: commands.Context, user: discord.User, *, reason: str = "No reason provided"):
    await _do_vc_unban(ctx, user, reason)

@vc_unban_cmd.error
async def vcunban_error(ctx: commands.Context, error):
    if isinstance(error, commands.MissingPermissions):
        await ctx.send(embed=make_embed("You need Move Members permission to voice unban users.", discord.Color.red()), ephemeral=True)
    elif isinstance(error, commands.MissingRequiredArgument):
        await ctx.send(embed=make_embed("Usage: `-voice unban <@user> [reason]`", discord.Color.red()), ephemeral=True)
    else:
        await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

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
    from Components.Commands.Voice.voice import voice_group
    from Components.Commands._utils import make_embed
    if "voice" not in bot.all_commands:
        bot.add_command(voice_group)
    await bot.add_cog(VcUnbanCommand(bot))
    await bot.add_cog(VcUnbanPrefixFallback(bot))
