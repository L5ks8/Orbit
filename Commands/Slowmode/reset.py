import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Slowmode.slowmode import slowmode_group

class SlowmodeRemoveLayout(LayoutView):
    def __init__(self, channel: discord.TextChannel, author: discord.Member):
        super().__init__()
        self.container = Container(
            TextDisplay(content=f"### Slowmode Removed\n**Channel:** {channel.mention} (`{channel.id}`)"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Status:** Regular messaging delay cleared (`0 seconds`)\n**Moderator:** {author.mention}")
        )
        self.add_item(self.container)

async def _do_slowmode_remove(ctx: commands.Context, channel: discord.TextChannel | None):
    await ctx.defer()
    target_channel = channel or ctx.channel
    if not isinstance(target_channel, discord.TextChannel):
        return await ctx.send("Please specify a valid text channel.", ephemeral=True)

    if target_channel.slowmode_delay == 0:
        return await ctx.send("This channel does not currently have slowmode enabled.", ephemeral=True)

    try:
        await target_channel.edit(slowmode_delay=0, reason=f"Slowmode removed by {ctx.author}")
        view = SlowmodeRemoveLayout(target_channel, ctx.author)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())
    except discord.Forbidden:
        await ctx.send("I do not have sufficient permissions to edit slowmode in this channel.", ephemeral=True)
    except Exception as e:
        await ctx.send(f"Error removing slowmode: {e}", ephemeral=True)

@slowmode_group.command(name="reset", description="Reset channel slowmode delay.")
@commands.has_permissions(manage_channels=True)
@commands.bot_has_permissions(manage_channels=True)
async def slowmode_remove_cmd(ctx: commands.Context, channel: discord.TextChannel = None):
    await _do_slowmode_remove(ctx, channel)

class SlowmodeRemoveCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @slowmode_remove_cmd.error
    async def slowmoderemove_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Manage Channels permission to reset slowmode.", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

class SlowmodeRemovePrefixFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="sm_reset", aliases=["slowmodereset", "slowmodeoff"], hidden=True)
    @commands.has_permissions(manage_channels=True)
    async def slowmode_remove_prefix(self, ctx: commands.Context, channel: discord.TextChannel = None):
        await _do_slowmode_remove(ctx, channel)

async def setup(bot: commands.Bot):
    from Commands.Slowmode.slowmode import slowmode_group
    if "slowmode" not in bot.all_commands:
        bot.add_command(slowmode_group)
    await bot.add_cog(SlowmodeRemoveCommand(bot))
    await bot.add_cog(SlowmodeRemovePrefixFallback(bot))

