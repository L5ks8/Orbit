import discord
from discord.ext import commands
from Commands.Voice.voice import voice_group

async def _do_vc_lock(ctx: commands.Context, channel: discord.VoiceChannel | None, reason: str):
    await ctx.defer()
    target_channel = channel or (ctx.author.voice.channel if ctx.author.voice else None)
    if not target_channel:
        return await ctx.send("Please specify a voice channel or join one first.", ephemeral=True)

    overwrite = target_channel.overwrites_for(ctx.guild.default_role)
    if overwrite.connect is False:
        return await ctx.send("This voice channel is already locked.", ephemeral=True)

    try:
        overwrite.connect = False
        await target_channel.set_permissions(ctx.guild.default_role, overwrite=overwrite, reason=f"Voice channel locked by {ctx.author} | Reason: {reason}")
        from Embeds import get_command_embed
        kwargs = get_command_embed(ctx.guild.id, "voice", msg_type="lock", channel_mention=target_channel.mention, reason=reason, author_mention=ctx.author.mention)
        await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())
    except discord.Forbidden:
        await ctx.send("I do not have sufficient permissions to lock this voice channel.", ephemeral=True)
    except Exception as e:
        await ctx.send(f"Error locking voice channel: {e}", ephemeral=True)

@voice_group.command(name="lock", description="Lock a voice channel so regular members cannot connect.")
@commands.has_permissions(manage_channels=True)
@commands.bot_has_permissions(manage_channels=True)
async def vc_lock_cmd(ctx: commands.Context, channel: discord.VoiceChannel = None, *, reason: str = "No reason provided"):
    await _do_vc_lock(ctx, channel, reason)

@vc_lock_cmd.error
async def vclock_error(ctx: commands.Context, error):
    if isinstance(error, commands.MissingPermissions):
        await ctx.send("You need Manage Channels permission to lock voice channels.", ephemeral=True)
    else:
        await ctx.send(f"An error occurred: {error}", ephemeral=True)

class VcLockCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

class VcLockPrefixFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="vc_lock", aliases=["vclock"], hidden=True)
    @commands.has_permissions(manage_channels=True)
    async def vc_lock_prefix(self, ctx: commands.Context, channel: discord.VoiceChannel = None, *, reason: str = "No reason provided"):
        await _do_vc_lock(ctx, channel, reason)

async def setup(bot: commands.Bot):
    from Commands.Voice.voice import voice_group
    if "voice" not in bot.all_commands:
        bot.add_command(voice_group)
    await bot.add_cog(VcLockCommand(bot))
    await bot.add_cog(VcLockPrefixFallback(bot))

