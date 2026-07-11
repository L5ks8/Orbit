import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Slowmode._group import slowmode_group

class SlowmodeSetLayout(LayoutView):
    def __init__(self, channel: discord.TextChannel, seconds: int, author: discord.Member):
        super().__init__()
        self.container = Container(
            TextDisplay(content=f"### Slowmode Enabled\n**Channel:** {channel.mention} (`{channel.id}`)"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Delay:** `{seconds} seconds` between messages\n**Moderator:** {author.mention}")
        )
        self.add_item(self.container)

async def _do_slowmode_set(ctx: commands.Context, seconds: int, channel: discord.TextChannel | None):
    await ctx.defer()
    target_channel = channel or ctx.channel
    if not isinstance(target_channel, discord.TextChannel):
        return await ctx.send("Please specify a valid text channel.", ephemeral=True)

    if seconds < 0 or seconds > 21600:
        return await ctx.send("Slowmode delay must be between 0 and 21600 seconds (6 hours).", ephemeral=True)

    try:
        await target_channel.edit(slowmode_delay=seconds, reason=f"Slowmode set by {ctx.author}")
        view = SlowmodeSetLayout(target_channel, seconds, ctx.author)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())
    except discord.Forbidden:
        await ctx.send("I do not have sufficient permissions to edit slowmode in this channel.", ephemeral=True)
    except Exception as e:
        await ctx.send(f"Error setting slowmode: {e}", ephemeral=True)

@slowmode_group.command(name="set", description="Sets the slowmode delay (in seconds) for a text channel (`/slowmode set`).")
@commands.has_permissions(manage_channels=True)
@commands.bot_has_permissions(manage_channels=True)
async def slowmode_set_cmd(ctx: commands.Context, seconds: int, channel: discord.TextChannel = None):
    await _do_slowmode_set(ctx, seconds, channel)

class SlowmodeSetCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @slowmode_set_cmd.error
    async def slowmodeset_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Manage Channels permission to configure slowmode.", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

class SlowmodeSetPrefixFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="slowmode set", aliases=["slowmodeset"], hidden=True)
    @commands.has_permissions(manage_channels=True)
    async def slowmode_set_prefix(self, ctx: commands.Context, seconds: int, channel: discord.TextChannel = None):
        await _do_slowmode_set(ctx, seconds, channel)

async def setup(bot: commands.Bot):
    await bot.add_cog(SlowmodeSetCommand(bot))
    await bot.add_cog(SlowmodeSetPrefixFallback(bot))
