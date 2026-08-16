import discord
from discord.ext import commands
from Commands.Channel.channel import channel_group



async def _do_create(ctx: commands.Context, name: str, channel_type: str, category: discord.CategoryChannel | None):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send(embed=make_embed("This command must be run inside a server.", discord.Color.red()), ephemeral=True)

    name_clean = name.replace(" ", "-")
    ch_type_lower = channel_type.lower() if channel_type else "text"

    try:
        if ch_type_lower in ("voice", "vc", "v"):
            new_channel = await ctx.guild.create_voice_channel(name=name_clean, category=category)
        else:
            new_channel = await ctx.guild.create_text_channel(name=name_clean, category=category)
    except discord.Forbidden:
        return await ctx.send(embed=make_embed("I don't have permission to create channels."), ephemeral=True)
    except discord.HTTPException as e:
        return await ctx.send(embed=make_embed(f"Failed to create channel: `{e}`", discord.Color.red()), ephemeral=True)

    try:
        await ctx.message.delete()
    except Exception:
        pass

    ch_type_display = "Voice" if isinstance(new_channel, discord.VoiceChannel) else "Text"
    cat_display = new_channel.category.name if new_channel.category else "No Category"
    
    embed = discord.Embed(title="Channel Created", color=discord.Color.green())
    embed.add_field(name="Channel", value=new_channel.mention, inline=False)
    embed.add_field(name="Type", value=f"`{ch_type_display}`", inline=True)
    embed.add_field(name="Category", value=f"`{cat_display}`", inline=True)
    embed.add_field(name="Created by", value=ctx.author.mention, inline=False)
    
    await ctx.send(embed=embed, delete_after=8, allowed_mentions=discord.AllowedMentions.none())

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
            await ctx.send(embed=make_embed("You need `Manage Channels` permission to create channels.", discord.Color.red()), ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send(embed=make_embed("Usage: `-channel create <name> [text/voice] [#category]`", discord.Color.red()), ephemeral=True)
        elif isinstance(error, commands.BadArgument):
            await ctx.send(embed=make_embed("Could not find that category.", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    from Commands.Channel.channel import channel_group
    from Commands._utils import make_embed
    if "channel" not in bot.all_commands:
        bot.add_command(channel_group)
    await bot.add_cog(ChannelCreateCog(bot))
