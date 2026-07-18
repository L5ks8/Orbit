import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Channel.channel import channel_group

class ChannelCreatedLayout(LayoutView):
    def __init__(self, channel: discord.abc.GuildChannel, author: discord.Member):
        super().__init__()
        ch_type = "Voice" if isinstance(channel, discord.VoiceChannel) else "Text"
        cat = channel.category.name if channel.category else "No Category"
        content_str = (
            f"**Channel:** {channel.mention}\n"
            f"**Type:** `{ch_type}`\n"
            f"**Category:** `{cat}`\n"
            f"**Created by:** {author.mention}"
        )
        self.container = Container(
            TextDisplay(content="### Channel Created"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=content_str)
        )
        self.add_item(self.container)

async def _do_create(ctx: commands.Context, name: str, channel_type: str, category: discord.CategoryChannel | None):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)

    name_clean = name.replace(" ", "-")
    ch_type_lower = channel_type.lower() if channel_type else "text"

    try:
        if ch_type_lower in ("voice", "vc", "v"):
            new_channel = await ctx.guild.create_voice_channel(name=name_clean, category=category)
        else:
            new_channel = await ctx.guild.create_text_channel(name=name_clean, category=category)
    except discord.Forbidden:
        return await ctx.send("I don't have permission to create channels.", ephemeral=True)
    except discord.HTTPException as e:
        return await ctx.send(f"Failed to create channel: `{e}`", ephemeral=True)

    try:
        await ctx.message.delete()
    except Exception:
        pass

    view = ChannelCreatedLayout(new_channel, ctx.author)
    await ctx.send(view=view, delete_after=8, allowed_mentions=discord.AllowedMentions.none())

@channel_group.command(name="create", description="Create a new channel.")
@commands.has_permissions(manage_channels=True)
async def channel_create_cmd(
    ctx: commands.Context,
    name: str,
    channel_type: str = "text",
    category: discord.CategoryChannel = None
):
    await _do_create(ctx, name, channel_type, category)

class ChannelCreateCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="ch_create", aliases=["createchannel", "channelcreate", "mkchannel"], hidden=True)
    @commands.has_permissions(manage_channels=True)
    async def createchannel_prefix(
        self,
        ctx: commands.Context,
        name: str,
        channel_type: str = "text",
        category: discord.CategoryChannel = None
    ):
        await _do_create(ctx, name, channel_type, category)

    @channel_create_cmd.error
    @createchannel_prefix.error
    async def create_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need `Manage Channels` permission to create channels.", ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage: `-channel create <name> [text/voice] [#category]`", ephemeral=True)
        elif isinstance(error, commands.BadArgument):
            await ctx.send("Could not find that category.", ephemeral=True)

async def setup(bot: commands.Bot):
    from Commands.Channel.channel import channel_group
    if "channel" not in bot.all_commands:
        bot.add_command(channel_group)
    await bot.add_cog(ChannelCreateCog(bot))

