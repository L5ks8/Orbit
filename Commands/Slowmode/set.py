import discord
from discord.ext import commands
from discord.ui import Container, TextDisplay, Separator
from Commands.Slowmode.slowmode import slowmode_group



async def _do_slowmode_set(ctx: commands.Context, seconds: int, channel: discord.TextChannel | None):
    await ctx.defer()
    target_channel = channel or ctx.channel
    if not isinstance(target_channel, discord.TextChannel):
        return await ctx.send("Please specify a valid text channel.", ephemeral=True)

    if seconds < 0 or seconds > 21600:
        return await ctx.send("Slowmode delay must be between 0 and 21600 seconds (6 hours).", ephemeral=True)

    try:
        await target_channel.edit(slowmode_delay=seconds, reason=f"Slowmode set by {ctx.author}")
        from Embeds import get_command_embed
        kwargs = get_command_embed(ctx.guild.id, "slowmode", msg_type="set", channel_mention=target_channel.mention, seconds=seconds, author_mention=ctx.author.mention)
        await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())
    except discord.Forbidden:
        await ctx.send("I do not have sufficient permissions to edit slowmode in this channel.", ephemeral=True)
    except Exception as e:
        await ctx.send(f"Error setting slowmode: {e}", ephemeral=True)

@slowmode_group.command(name="set", description="Set channel slowmode delay.")
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

    @commands.command(name="sm_set", aliases=["slowmodeset"], hidden=True)
    @commands.has_permissions(manage_channels=True)
    async def slowmode_set_prefix(self, ctx: commands.Context, seconds: int, channel: discord.TextChannel = None):
        await _do_slowmode_set(ctx, seconds, channel)

async def setup(bot: commands.Bot):
    from Commands.Slowmode.slowmode import slowmode_group
    if "slowmode" not in bot.all_commands:
        bot.add_command(slowmode_group)
    await bot.add_cog(SlowmodeSetCommand(bot))
    await bot.add_cog(SlowmodeSetPrefixFallback(bot))

