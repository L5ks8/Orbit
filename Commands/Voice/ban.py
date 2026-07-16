import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Database.storagehandler import add_to_vcban, is_vcbanned
from Database.storagehandler import is_whitelisted
from Commands.Voice.voice import voice_group

class VcBanSuccessLayout(LayoutView):
    def __init__(self, target: discord.Member | discord.User, reason: str, author: discord.Member):
        super().__init__()
        self.container = Container(
            TextDisplay(content=f"### User Voice Banned\n**Target:** {target.mention} (`{target.id}`)"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Reason:** {reason}\n**Moderator:** {author.mention}\n**Status:** `Active (Banned from Voice Channels)`")
        )
        self.add_item(self.container)

async def _do_vc_ban(ctx: commands.Context, user: discord.Member, reason: str):
    await ctx.defer()
    if user.id == ctx.author.id:
        return await ctx.send("You cannot voice ban yourself.", ephemeral=True)
    if is_whitelisted(ctx.guild.id, user.id):
        return await ctx.send("This user is on the global moderation whitelist (`Immune to Voice Ban`).", ephemeral=True)
    if user.top_role >= ctx.author.top_role and ctx.author != ctx.guild.owner:
        return await ctx.send("You cannot voice ban a user with equal or higher role.", ephemeral=True)

    success = await add_to_vcban(ctx.guild.id, user.id, reason, ctx.author.id)
    if not success:
        return await ctx.send("This user is already voice banned on this server.", ephemeral=True)

    if user.voice and user.voice.channel:
        try:
            await user.edit(voice_channel=None, reason=f"Voice banned by {ctx.author} | Reason: {reason}")
        except Exception:
            pass

    view = VcBanSuccessLayout(user, reason, ctx.author)
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

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

        if await is_vcbanned(member.guild.id, member.id):
            try:
                await member.edit(voice_channel=None, reason="User is Voice Banned on this server")
            except Exception:
                pass

    @vc_ban_cmd.error
    async def vc_ban_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Move Members permission to voice ban users.", ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Use: `-voice ban <member> [reason]`", ephemeral=True)
        else:
            await ctx.send(f"Voice ban failed: {error}", ephemeral=True)

class VcBanPrefixFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="vc_ban", aliases=["vcban"], hidden=True)
    @commands.has_permissions(move_members=True)
    async def vc_ban_prefix(self, ctx: commands.Context, user: discord.Member, *, reason: str = "No reason provided"):
        await _do_vc_ban(ctx, user, reason)

async def setup(bot: commands.Bot):
    from Commands.Voice.voice import voice_group
    if "voice" not in bot.all_commands:
        bot.add_command(voice_group)
    await bot.add_cog(VcBanCommand(bot))
    await bot.add_cog(VcBanPrefixFallback(bot))
