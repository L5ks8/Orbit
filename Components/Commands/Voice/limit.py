import discord
from discord.ext import commands
from Components.Commands.Voice.voice import voice_group

async def _do_vc_limit(ctx: commands.Context, limit: int, channel: discord.VoiceChannel | None):
    await ctx.defer()
    target_channel = channel or (ctx.author.voice.channel if ctx.author.voice else None)
    if not target_channel:
        return await ctx.send(embed=make_embed("Please specify a voice channel or join one first.", discord.Color.red()), ephemeral=True)

    if limit < 0 or limit > 99:
        return await ctx.send(embed=make_embed("Please specify a limit between 0 (unlimited) and 99.", discord.Color.red()), ephemeral=True)

    try:
        await target_channel.edit(user_limit=limit, reason=f"Voice limit updated by {ctx.author}")
        embed = discord.Embed(title="User Limit Set", color=discord.Color.orange())
        embed.add_field(name="Destination Channel", value=target_channel.mention, inline=False)
        if limit > 0:
            embed.add_field(name="New Limit", value=f"`{limit}`", inline=False)
        else:
            embed.add_field(name="New Limit", value="`None`", inline=False)
        embed.add_field(name="Moderator", value=ctx.author.mention, inline=False)
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())
    except discord.Forbidden:
        await ctx.send(embed=make_embed("I do not have sufficient permissions to modify this voice channel.", discord.Color.red()), ephemeral=True)
    except Exception as e:
        await ctx.send(embed=make_embed(f"Error setting voice limit: {e}", discord.Color.red()), ephemeral=True)

@voice_group.command(name="limit", description="Set the user limit for a voice channel.")
@commands.has_permissions(manage_channels=True)
@commands.bot_has_permissions(manage_channels=True)
async def vc_limit_cmd(ctx: commands.Context, limit: int, channel: discord.VoiceChannel = None):
    await _do_vc_limit(ctx, limit, channel)

@vc_limit_cmd.error
async def vclimit_error(ctx: commands.Context, error):
    if isinstance(error, commands.MissingPermissions):
        await ctx.send(embed=make_embed("You need Manage Channels permission to set voice limits.", discord.Color.red()), ephemeral=True)
    else:
        await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

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
    from Components.Commands.Voice.voice import voice_group
    from Components.Commands._utils import make_embed
    if "voice" not in bot.all_commands:
        bot.add_command(voice_group)
    await bot.add_cog(VcLimitCommand(bot))
    await bot.add_cog(VcLimitPrefixFallback(bot))
