import discord
from discord.ext import commands
from discord.ui import Container, TextDisplay, Separator
from Commands.Voice.voice import voice_group



async def _do_vc_unmute(ctx: commands.Context, target: discord.Member, reason: str):
    await ctx.defer()
    if not target.voice:
        return await ctx.send("This user is not currently in a voice channel.", ephemeral=True)
    if not target.voice.mute:
        return await ctx.send("This user is not voice muted.", ephemeral=True)

    try:
        await target.edit(mute=False, reason=f"Voice unmuted by {ctx.author} | Reason: {reason}")
        from Embeds import get_command_embed
        kwargs = get_command_embed(ctx.guild.id, "voice", msg_type="unmute", member_mention=target.mention, member_id=target.id, channel_mention=target.voice.channel.mention if target.voice.channel else "N/A", reason=reason, author_mention=ctx.author.mention)
        await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())
    except discord.Forbidden:
        await ctx.send("I do not have sufficient permissions to voice unmute this user.", ephemeral=True)
    except Exception as e:
        await ctx.send(f"Error voice unmuting user: {e}", ephemeral=True)

@voice_group.command(name="unmute", description="Remove a voice mute from a member.")
@commands.has_permissions(mute_members=True)
@commands.bot_has_permissions(mute_members=True)
async def vc_unmute_cmd(ctx: commands.Context, target: discord.Member, *, reason: str = "No reason provided"):
    await _do_vc_unmute(ctx, target, reason)

@vc_unmute_cmd.error
async def vcunmute_error(ctx: commands.Context, error):
    if isinstance(error, commands.MissingPermissions):
        await ctx.send("You need Mute Members permission to voice unmute users.", ephemeral=True)
    elif isinstance(error, commands.MissingRequiredArgument):
        await ctx.send("Usage: `-voice unmute <@member> [reason]`", ephemeral=True)
    else:
        await ctx.send(f"An error occurred: {error}", ephemeral=True)

class VcUnmuteCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

class VcUnmutePrefixFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="vc_unmute", aliases=["vcunmute"], hidden=True)
    @commands.has_permissions(mute_members=True)
    async def vc_unmute_prefix(self, ctx: commands.Context, target: discord.Member, *, reason: str = "No reason provided"):
        await _do_vc_unmute(ctx, target, reason)

async def setup(bot: commands.Bot):
    from Commands.Voice.voice import voice_group
    if "voice" not in bot.all_commands:
        bot.add_command(voice_group)
    await bot.add_cog(VcUnmuteCommand(bot))
    await bot.add_cog(VcUnmutePrefixFallback(bot))

