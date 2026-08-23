import discord
from discord.ext import commands
from Components.Commands.Voice.voice import voice_group

async def _do_vc_unlock(ctx: commands.Context, channel: discord.VoiceChannel | None, reason: str):
    await ctx.defer()
    target_channel = channel or (ctx.author.voice.channel if ctx.author.voice else None)
    if not target_channel:
        return await ctx.send(embed=make_embed("Please specify a voice channel or join one first.", discord.Color.red()), ephemeral=True)

    overwrite = target_channel.overwrites_for(ctx.guild.default_role)
    if overwrite.connect is True or (overwrite.connect is None and target_channel.permissions_for(ctx.guild.default_role).connect):
        return await ctx.send(embed=make_embed("This voice channel is not currently locked.", discord.Color.red()), ephemeral=True)

    try:
        overwrite.connect = None
        await target_channel.set_permissions(ctx.guild.default_role, overwrite=overwrite, reason=f"Voice channel unlocked by {ctx.author} | Reason: {reason}")
        embed = discord.Embed(title="Channel Unlocked", color=discord.Color.green())
        embed.add_field(name="Destination Channel", value=target_channel.mention, inline=False)
        if reason and reason != "No reason provided":
            embed.add_field(name="Reason", value=reason, inline=False)
        embed.add_field(name="Moderator", value=ctx.author.mention, inline=False)
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())
    except discord.Forbidden:
        await ctx.send(embed=make_embed("I do not have sufficient permissions to unlock this voice channel.", discord.Color.red()), ephemeral=True)
    except Exception as e:
        await ctx.send(embed=make_embed(f"Error unlocking voice channel: {e}", discord.Color.red()), ephemeral=True)

@voice_group.command(name="unlock", description="Unlock a voice channel so regular members can connect.")
@commands.has_permissions(manage_channels=True)
@commands.bot_has_permissions(manage_channels=True)
async def vc_unlock_cmd(ctx: commands.Context, channel: discord.VoiceChannel = None, *, reason: str = "No reason provided"):
    await _do_vc_unlock(ctx, channel, reason)

@vc_unlock_cmd.error
async def vcunlock_error(ctx: commands.Context, error):
    if isinstance(error, commands.MissingPermissions):
        await ctx.send(embed=make_embed("You need Manage Channels permission to unlock voice channels.", discord.Color.red()), ephemeral=True)
    else:
        await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

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
    from Components.Commands.Voice.voice import voice_group
    from Components.Commands._utils import make_embed
    if "voice" not in bot.all_commands:
        bot.add_command(voice_group)
    await bot.add_cog(VcUnlockCommand(bot))
    await bot.add_cog(VcUnlockPrefixFallback(bot))
