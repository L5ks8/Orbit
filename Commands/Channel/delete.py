import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Channel.channel import channel_group

class ChannelDeletedLayout(LayoutView):
    def __init__(self, channel_name: str, channel_type: str, author: discord.Member):
        super().__init__()
        content_str = (
            f"**Channel:** `#{channel_name}`\n"
            f"**Type:** `{channel_type}`\n"
            f"**Deleted by:** {author.mention}"
        )
        self.container = Container(
            TextDisplay(content="### Channel Deleted"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=content_str)
        )
        self.add_item(self.container)

async def _do_delete(ctx: commands.Context, channel: discord.abc.GuildChannel | None):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)

    target = channel or ctx.channel

    if isinstance(target, (discord.TextChannel, discord.VoiceChannel, discord.StageChannel, discord.ForumChannel)):
        ch_type = "Voice" if isinstance(target, discord.VoiceChannel) else "Text"
        name = target.name
        try:
            await target.delete(reason=f"Deleted by {ctx.author} via Orbit -deletechannel")
        except discord.Forbidden:
            return await ctx.send("I don't have permission to delete that channel.", ephemeral=True)
        except discord.HTTPException as e:
            return await ctx.send(f"Failed to delete channel: `{e}`", ephemeral=True)

        if target != ctx.channel:
            try:
                await ctx.message.delete()
            except Exception:
                pass
            view = ChannelDeletedLayout(name, ch_type, ctx.author)
            await ctx.send(view=view, delete_after=8, allowed_mentions=discord.AllowedMentions.none())
    else:
        await ctx.send("That channel type cannot be deleted with this command.", ephemeral=True)

@channel_group.command(name="delete", description="Delete a channel.")
@commands.has_permissions(manage_channels=True)
async def channel_delete_cmd(ctx: commands.Context, channel: discord.abc.GuildChannel = None):
    await _do_delete(ctx, channel)

class ChannelDeleteCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="ch_delete", aliases=["deletechannel", "channeldelete", "delchannel"], hidden=True)
    @commands.has_permissions(manage_channels=True)
    async def deletechannel_prefix(self, ctx: commands.Context, channel: discord.abc.GuildChannel = None):
        await _do_delete(ctx, channel)

    @channel_delete_cmd.error
    @deletechannel_prefix.error
    async def delete_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need `Manage Channels` permission to delete channels.", ephemeral=True)
        elif isinstance(error, commands.BadArgument):
            await ctx.send("Could not find that channel.", ephemeral=True)

async def setup(bot: commands.Bot):
    from Commands.Channel.channel import channel_group
    if "channel" not in bot.all_commands:
        bot.add_command(channel_group)
    await bot.add_cog(ChannelDeleteCog(bot))
