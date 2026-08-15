import discord
from discord.ext import commands
from discord.ui import Container, TextDisplay, Separator
from Commands.Voice.voice import voice_group



async def _do_vc_unmute(ctx: commands.Context, target: discord.Member, reason: str):
    await ctx.defer()
    if not target.voice:
        return await ctx.send(embed=make_embed("This user is not currently in a voice channel.", discord.Color.red()), ephemeral=True)
    if not target.voice.mute:
        return await ctx.send(embed=make_embed("This user is not voice muted.", discord.Color.red()), ephemeral=True)

    try:
        await target.edit(mute=False, reason=f"Voice unmuted by {ctx.author} | Reason: {reason}")
        embed = discord.Embed(title="Voice Unmuted", color=discord.Color.green())
        embed.add_field(name="Target", value=f"{target.mention} (`{target.id}`)", inline=False)
        embed.add_field(name="Destination Channel", value=target.voice.channel.mention if target.voice.channel else "N/A", inline=False)
        if reason and reason != "No reason provided":
            embed.add_field(name="Reason", value=reason, inline=False)
        embed.add_field(name="Moderator", value=ctx.author.mention, inline=False)
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())
    except discord.Forbidden:
        await ctx.send(embed=make_embed("I do not have sufficient permissions to voice unmute this user.", discord.Color.red()), ephemeral=True)
    except Exception as e:
        await ctx.send(embed=make_embed(f"Error voice unmuting user: {e}", discord.Color.red()), ephemeral=True)

@voice_group.command(name="unmute", description="Remove a voice mute from a member.")
@commands.has_permissions(mute_members=True)
@commands.bot_has_permissions(mute_members=True)
async def vc_unmute_cmd(ctx: commands.Context, target: discord.Member, *, reason: str = "No reason provided"):
    await _do_vc_unmute(ctx, target, reason)

@vc_unmute_cmd.error
async def vcunmute_error(ctx: commands.Context, error):
    if isinstance(error, commands.MissingPermissions):
        await ctx.send(embed=make_embed("You need Mute Members permission to voice unmute users.", discord.Color.red()), ephemeral=True)
    elif isinstance(error, commands.MissingRequiredArgument):
        await ctx.send(embed=make_embed("Usage: `-voice unmute <@member> [reason]`", discord.Color.red()), ephemeral=True)
    else:
        await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

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
from Commands._utils import make_embed
    if "voice" not in bot.all_commands:
        bot.add_command(voice_group)
    await bot.add_cog(VcUnmuteCommand(bot))
    await bot.add_cog(VcUnmutePrefixFallback(bot))
