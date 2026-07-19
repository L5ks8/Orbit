import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Voice.voice import voice_group

class VcUnlockSuccessLayout(LayoutView):
    def __init__(self, channel: discord.VoiceChannel, reason: str, author: discord.Member):
        super().__init__()
        self.container = Container(
            TextDisplay(content=f"### Voice Channel Unlocked\n**Channel:** {channel.mention} (`{channel.id}`)"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Reason:** {reason}\n**Moderator:** {author.mention}\n**Status:** `@everyone` connect enabled")
        )
        self.add_item(self.container)

async def _do_vc_unlock(ctx: commands.Context, channel: discord.VoiceChannel | None, reason: str):
    await ctx.defer()
    target_channel = channel or (ctx.author.voice.channel if ctx.author.voice else None)
    if not target_channel:
        return await ctx.send("Please specify a voice channel or join one first.", ephemeral=True)

    overwrite = target_channel.overwrites_for(ctx.guild.default_role)
    if overwrite.connect is True or (overwrite.connect is None and target_channel.permissions_for(ctx.guild.default_role).connect):
        return await ctx.send("This voice channel is not currently locked.", ephemeral=True)

    try:
        overwrite.connect = None
        await target_channel.set_permissions(ctx.guild.default_role, overwrite=overwrite, reason=f"Voice channel unlocked by {ctx.author} | Reason: {reason}")
        view = VcUnlockSuccessLayout(target_channel, reason, ctx.author)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())
    except discord.Forbidden:
        await ctx.send("I do not have sufficient permissions to unlock this voice channel.", ephemeral=True)
    except Exception as e:
        await ctx.send(f"Error unlocking voice channel: {e}", ephemeral=True)

@voice_group.command(name="unlock", description="Unlock a voice channel so regular members can connect.")
@commands.has_permissions(manage_channels=True)
@commands.bot_has_permissions(manage_channels=True)
async def vc_unlock_cmd(ctx: commands.Context, channel: discord.VoiceChannel = None, *, reason: str = "No reason provided"):
    await _do_vc_unlock(ctx, channel, reason)

@vc_unlock_cmd.error
async def vcunlock_error(ctx: commands.Context, error):
    if isinstance(error, commands.MissingPermissions):
        await ctx.send("You need Manage Channels permission to unlock voice channels.", ephemeral=True)
    else:
        await ctx.send(f"An error occurred: {error}", ephemeral=True)

class VcUnlockCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

class VcUnlockPrefixFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="vc_unlock", aliases=["vcunlock"], hidden=True)
    @commands.has_permissions(manage_channels=True)
    async def vc_unlock_prefix(self, ctx: commands.Context, channel: discord.VoiceChannel = None, *, reason: str = "No reason provided"):
        await _do_vc_unlock(ctx, channel, reason)

async def setup(bot: commands.Bot):
    from Commands.Voice.voice import voice_group
    if "voice" not in bot.all_commands:
        bot.add_command(voice_group)
    await bot.add_cog(VcUnlockCommand(bot))
    await bot.add_cog(VcUnlockPrefixFallback(bot))

