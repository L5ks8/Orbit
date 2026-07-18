import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Whitelist._storage import is_whitelisted
from Commands.Voice.voice import voice_group

class VcMuteSuccessLayout(LayoutView):
    def __init__(self, target: discord.Member, reason: str, author: discord.Member):
        super().__init__()
        self.container = Container(
            TextDisplay(content=f"### Voice Muted\n**Target:** {target.mention} (`{target.id}`)"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Reason:** {reason}\n**Moderator:** {author.mention}")
        )
        self.add_item(self.container)

async def _do_vc_mute(ctx: commands.Context, target: discord.Member, reason: str):
    await ctx.defer()
    if is_whitelisted(ctx.guild.id, target.id):
        return await ctx.send("This user is on the global moderation whitelist (`Immune to Voice Mute`).", ephemeral=True)
    if not target.voice:
        return await ctx.send("This user is not currently in a voice channel.", ephemeral=True)
    if target.voice.mute:
        return await ctx.send("This user is already voice muted.", ephemeral=True)

    try:
        await target.edit(mute=True, reason=f"Voice muted by {ctx.author} | Reason: {reason}")
        view = VcMuteSuccessLayout(target, reason, ctx.author)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())
    except discord.Forbidden:
        await ctx.send("I do not have sufficient permissions to voice mute this user.", ephemeral=True)
    except Exception as e:
        await ctx.send(f"Error voice muting user: {e}", ephemeral=True)

@voice_group.command(name="mute", description="Voice mute a member in a voice channel.")
@commands.has_permissions(mute_members=True)
@commands.bot_has_permissions(mute_members=True)
async def vc_mute_cmd(ctx: commands.Context, target: discord.Member, *, reason: str = "No reason provided"):
    await _do_vc_mute(ctx, target, reason)

class VcMuteCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @vc_mute_cmd.error
    async def vcmute_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Mute Members permission to voice mute users.", ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage: `-voice mute <@member> [reason]`", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

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

