import discord
from discord.ext import commands
from Components.Commands.Voice._storage import add_to_vcban, is_vcbanned
from Components.Commands.Whitelist._storage import is_whitelisted
from Components.Commands.Voice.voice import voice_group
from Components.Commands._utils import make_embed

async def _do_vc_ban(ctx: commands.Context, user: discord.Member, reason: str):
    await ctx.defer()
    if user.id == ctx.author.id:
        return await ctx.send(embed=make_embed("You cannot voice ban yourself.", discord.Color.red()), ephemeral=True)
    if is_whitelisted(ctx.guild.id, user.id):
        return await ctx.send(embed=make_embed("This user is on the global moderation whitelist (`Immune to Voice Ban`).", discord.Color.red()), ephemeral=True)
    if user.top_role >= ctx.author.top_role and ctx.author != ctx.guild.owner:
        return await ctx.send(embed=make_embed("You cannot voice ban a user with equal or higher role.", discord.Color.red()), ephemeral=True)

    success = add_to_vcban(ctx.guild.id, user.id, reason, ctx.author.id)
    if not success:
        return await ctx.send(embed=make_embed("This user is already voice banned on this server.", discord.Color.red()), ephemeral=True)

    vc = None
    if user.voice and user.voice.channel:
        vc = user.voice.channel
        try:
            from Components.Commands._utils import send_moderation_dm, make_embed
            await send_moderation_dm(user, ctx.guild.name, "voice banned", reason, guild_id=ctx.guild.id)
            
            await user.edit(voice_channel=None, reason=f"Voice banned by {ctx.author} | Reason: {reason}")
        except Exception:
            pass

    embed = discord.Embed(title="User Voice Banned", color=discord.Color.red())
    embed.add_field(name="Target", value=f"{user.mention} (`{user.id}`)", inline=False)
    embed.add_field(name="Destination Channel", value=vc.mention if vc else "N/A", inline=False)
    if reason and reason != "No reason provided":
        embed.add_field(name="Reason", value=reason, inline=False)
    embed.add_field(name="Moderator", value=ctx.author.mention, inline=False)
    embed.add_field(name="Status", value="`Active (Banned from Voice Channels)`", inline=False)
    await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

@voice_group.command(name="ban", description="Ban a member from voice channels")
@commands.has_permissions(move_members=True)
@commands.bot_has_permissions(move_members=True)
async def vc_ban_cmd(ctx: commands.Context, user: discord.Member, *, reason: str = "No reason provided"):
    await _do_vc_ban(ctx, user, reason)

class VcBanCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_voice_state_update(self, member: discord.Member, before: discord.VoiceState, after: discord.VoiceState):
        if member.bot or not after.channel:
            return

        if is_vcbanned(member.guild.id, member.id):
            try:
                await member.edit(voice_channel=None, reason="User is Voice Banned on this server")
            except Exception:
                pass
@vc_ban_cmd.error
async def vc_ban_error(ctx: commands.Context, error):
    if isinstance(error, commands.MissingPermissions):
        await ctx.send(embed=make_embed("You need Move Members permission to voice ban users.", discord.Color.red()), ephemeral=True)
    elif isinstance(error, commands.MissingRequiredArgument):
        await ctx.send(embed=make_embed("Use: `-voice ban <member> [reason]`", discord.Color.red()), ephemeral=True)
    else:
        await ctx.send(embed=make_embed(f"Voice ban failed: {error}", discord.Color.red()), ephemeral=True)

class VcBanPrefixFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="vc_ban", aliases=["vcban"], hidden=True)
    @commands.has_permissions(move_members=True)
    async def vc_ban_prefix(self, ctx: commands.Context, user: discord.Member, *, reason: str = "No reason provided"):
        await _do_vc_ban(ctx, user, reason)

async def setup(bot: commands.Bot):
    from Components.Commands.Voice.voice import voice_group
    if "voice" not in bot.all_commands:
        bot.add_command(voice_group)
    await bot.add_cog(VcBanCommand(bot))
    await bot.add_cog(VcBanPrefixFallback(bot))
