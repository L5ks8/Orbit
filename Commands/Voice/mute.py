import discord
from discord.ext import commands
from discord.ui import Container, TextDisplay, Separator
from Commands.Whitelist._storage import is_whitelisted
from Commands.Voice.voice import voice_group
from Commands._utils import make_embed



async def _do_vc_mute(ctx: commands.Context, target: discord.Member, reason: str):
    await ctx.defer()
    if is_whitelisted(ctx.guild.id, target.id):
        return await ctx.send(embed=make_embed("This user is on the global moderation whitelist (`Immune to Voice Mute`).", discord.Color.red()), ephemeral=True)
    if not target.voice:
        return await ctx.send(embed=make_embed("This user is not currently in a voice channel.", discord.Color.red()), ephemeral=True)
    if target.voice.mute:
        return await ctx.send(embed=make_embed("This user is already voice muted.", discord.Color.red()), ephemeral=True)

    try:
        from Commands._utils import send_moderation_dm, make_embed
        await send_moderation_dm(target, ctx.guild.name, "voice muted", reason, guild_id=ctx.guild.id)
        await target.edit(mute=True, reason=f"Voice muted by {ctx.author} | Reason: {reason}")
        embed = discord.Embed(title="Voice Muted", color=discord.Color.red())
        embed.add_field(name="Target", value=f"{target.mention} (`{target.id}`)", inline=False)
        embed.add_field(name="Destination Channel", value=target.voice.channel.mention if target.voice.channel else "N/A", inline=False)
        if reason and reason != "No reason provided":
            embed.add_field(name="Reason", value=reason, inline=False)
        embed.add_field(name="Moderator", value=ctx.author.mention, inline=False)
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())
    except discord.Forbidden:
        await ctx.send(embed=make_embed("I do not have sufficient permissions to voice mute this user.", discord.Color.red()), ephemeral=True)
    except Exception as e:
        await ctx.send(embed=make_embed(f"Error voice muting user: {e}", discord.Color.red()), ephemeral=True)

@voice_group.command(name="mute", description="Voice mute a member in a voice channel.")
@commands.has_permissions(mute_members=True)
@commands.bot_has_permissions(mute_members=True)
async def vc_mute_cmd(ctx: commands.Context, target: discord.Member, *, reason: str = "No reason provided"):
    await _do_vc_mute(ctx, target, reason)

@vc_mute_cmd.error
async def vcmute_error(ctx: commands.Context, error):
    if isinstance(error, commands.MissingPermissions):
        await ctx.send(embed=make_embed("You need Mute Members permission to voice mute users.", discord.Color.red()), ephemeral=True)
    elif isinstance(error, commands.MissingRequiredArgument):
        await ctx.send(embed=make_embed("Usage: `-voice mute <@member> [reason]`", discord.Color.red()), ephemeral=True)
    else:
        await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

class VcMuteCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

class VcMutePrefixFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="vc_mute", aliases=["vcmute"], hidden=True)
    @commands.has_permissions(mute_members=True)
    async def vc_mute_prefix(self, ctx: commands.Context, target: discord.Member, *, reason: str = "No reason provided"):
        await _do_vc_mute(ctx, target, reason)

async def setup(bot: commands.Bot):
    from Commands.Voice.voice import voice_group
    if "voice" not in bot.all_commands:
        bot.add_command(voice_group)
    await bot.add_cog(VcMuteCommand(bot))
    await bot.add_cog(VcMutePrefixFallback(bot))
