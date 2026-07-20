import discord
from discord.ext import commands
from Commands.Voice.voice import voice_group

async def _do_vc_limit(ctx: commands.Context, limit: int, channel: discord.VoiceChannel | None):
    await ctx.defer()
    target_channel = channel or (ctx.author.voice.channel if ctx.author.voice else None)
    if not target_channel:
        return await ctx.send("Please specify a voice channel or join one first.", ephemeral=True)

    if limit < 0 or limit > 99:
        return await ctx.send("Please specify a limit between 0 (unlimited) and 99.", ephemeral=True)

    try:
        await target_channel.edit(user_limit=limit, reason=f"Voice limit updated by {ctx.author}")
        from Embeds import get_command_embed
        kwargs = get_command_embed(ctx.guild.id, "voice", msg_type="limit", channel_mention=target_channel.mention, limit=limit, author_mention=ctx.author.mention)
        await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())
    except discord.Forbidden:
        await ctx.send("I do not have sufficient permissions to modify this voice channel.", ephemeral=True)
    except Exception as e:
        await ctx.send(f"Error setting voice limit: {e}", ephemeral=True)

@voice_group.command(name="limit", description="Set the user limit for a voice channel.")
@commands.has_permissions(manage_channels=True)
@commands.bot_has_permissions(manage_channels=True)
async def vc_limit_cmd(ctx: commands.Context, limit: int, channel: discord.VoiceChannel = None):
    await _do_vc_limit(ctx, limit, channel)

@vc_limit_cmd.error
async def vclimit_error(ctx: commands.Context, error):
    if isinstance(error, commands.MissingPermissions):
        await ctx.send("You need Manage Channels permission to set voice limits.", ephemeral=True)
    else:
        await ctx.send(f"An error occurred: {error}", ephemeral=True)

class VcLimitCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

class VcLimitPrefixFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="vc_limit", aliases=["vclimit"], hidden=True)
    @commands.has_permissions(manage_channels=True)
    async def vc_limit_prefix(self, ctx: commands.Context, limit: int, channel: discord.VoiceChannel = None):
        await _do_vc_limit(ctx, limit, channel)

async def setup(bot: commands.Bot):
    from Commands.Voice.voice import voice_group
    if "voice" not in bot.all_commands:
        bot.add_command(voice_group)
    await bot.add_cog(VcLimitCommand(bot))
    await bot.add_cog(VcLimitPrefixFallback(bot))

