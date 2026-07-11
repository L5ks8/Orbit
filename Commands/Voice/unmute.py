import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Voice._group import voice_group

class VcUnmuteSuccessLayout(LayoutView):
    def __init__(self, target: discord.Member, reason: str, author: discord.Member):
        super().__init__()
        self.container = Container(
            TextDisplay(content=f"### Voice Unmuted\n**Target:** {target.mention} (`{target.id}`)"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Reason:** {reason}\n**Moderator:** {author.mention}")
        )
        self.add_item(self.container)

async def _do_vc_unmute(ctx: commands.Context, target: discord.Member, reason: str):
    await ctx.defer()
    if not target.voice:
        return await ctx.send("This user is not currently in a voice channel.", ephemeral=True)
    if not target.voice.mute:
        return await ctx.send("This user is not voice muted.", ephemeral=True)

    try:
        await target.edit(mute=False, reason=f"Voice unmuted by {ctx.author} | Reason: {reason}")
        view = VcUnmuteSuccessLayout(target, reason, ctx.author)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())
    except discord.Forbidden:
        await ctx.send("I do not have sufficient permissions to voice unmute this user.", ephemeral=True)
    except Exception as e:
        await ctx.send(f"Error voice unmuting user: {e}", ephemeral=True)

@voice_group.command(name="unmute", description="Removes a voice mute from a user (`/voice unmute`).")
@commands.has_permissions(mute_members=True)
@commands.bot_has_permissions(mute_members=True)
async def vc_unmute_cmd(ctx: commands.Context, target: discord.Member, *, reason: str = "No reason provided"):
    await _do_vc_unmute(ctx, target, reason)

class VcUnmuteCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @vc_unmute_cmd.error
    async def vcunmute_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Mute Members permission to voice unmute users.", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

class VcUnmutePrefixFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="voice unmute", aliases=["vcunmute"], hidden=True)
    @commands.has_permissions(mute_members=True)
    async def vc_unmute_prefix(self, ctx: commands.Context, target: discord.Member, *, reason: str = "No reason provided"):
        await _do_vc_unmute(ctx, target, reason)

async def setup(bot: commands.Bot):
    await bot.add_cog(VcUnmuteCommand(bot))
    await bot.add_cog(VcUnmutePrefixFallback(bot))
