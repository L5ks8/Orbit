import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Voice._group import voice_group

class VcLimitSuccessLayout(LayoutView):
    def __init__(self, channel: discord.VoiceChannel, limit: int, author: discord.Member):
        super().__init__()
        limit_text = f"`{limit} users`" if limit > 0 else "`Unlimited (No limit)`"
        self.container = Container(
            TextDisplay(content=f"### Voice Channel Limit Updated\n**Channel:** {channel.mention} (`{channel.id}`)"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**User Limit:** {limit_text}\n**Moderator:** {author.mention}")
        )
        self.add_item(self.container)

async def _do_vc_limit(ctx: commands.Context, limit: int, channel: discord.VoiceChannel | None):
    await ctx.defer()
    target_channel = channel or (ctx.author.voice.channel if ctx.author.voice else None)
    if not target_channel:
        return await ctx.send("Please specify a voice channel or join one first.", ephemeral=True)

    if limit < 0 or limit > 99:
        return await ctx.send("Please specify a limit between 0 (unlimited) and 99.", ephemeral=True)

    try:
        await target_channel.edit(user_limit=limit, reason=f"Voice limit updated by {ctx.author}")
        view = VcLimitSuccessLayout(target_channel, limit, ctx.author)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())
    except discord.Forbidden:
        await ctx.send("I do not have sufficient permissions to modify this voice channel.", ephemeral=True)
    except Exception as e:
        await ctx.send(f"Error setting voice limit: {e}", ephemeral=True)

@voice_group.command(name="limit", description="Sets the user limit for a voice channel (`/voice limit`).")
@commands.has_permissions(manage_channels=True)
@commands.bot_has_permissions(manage_channels=True)
async def vc_limit_cmd(ctx: commands.Context, limit: int, channel: discord.VoiceChannel = None):
    await _do_vc_limit(ctx, limit, channel)

class VcLimitCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @vc_limit_cmd.error
    async def vclimit_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Manage Channels permission to set voice limits.", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

class VcLimitPrefixFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="voice limit", aliases=["vclimit"], hidden=True)
    @commands.has_permissions(manage_channels=True)
    async def vc_limit_prefix(self, ctx: commands.Context, limit: int, channel: discord.VoiceChannel = None):
        await _do_vc_limit(ctx, limit, channel)

async def setup(bot: commands.Bot):
    await bot.add_cog(VcLimitCommand(bot))
    await bot.add_cog(VcLimitPrefixFallback(bot))
