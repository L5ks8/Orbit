import discord
from discord.ext import commands
from Components.Commands.Channel.channel import channel_group
from Components.Commands._utils import make_embed, ORBIT_COLOR, InteractionContext
from Components.emojis import Emojis

async def _do_create(ctx: InteractionContext, name: str, channel_type: str, category: discord.CategoryChannel | None):
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
        return await ctx.send(embed=make_embed("I don't have permission to create channels.", discord.Color.red()), ephemeral=True)
    except discord.HTTPException as e:
        return await ctx.send(embed=make_embed(f"Failed to create channel: `{e}`", discord.Color.red()), ephemeral=True)

    try:
        if ctx.message:
            await ctx.message.delete()
    except Exception:
        pass

    ch_type_display = "Voice" if isinstance(new_channel, discord.VoiceChannel) else "Text"
    cat_display = new_channel.category.name if new_channel.category else "No Category"
    
    embed = discord.Embed(title="Channel Created", color=ORBIT_COLOR)
    embed.add_field(name="Channel", value=new_channel.mention, inline=False)
    embed.add_field(name="Type", value=f"`{ch_type_display}`", inline=True)
    embed.add_field(name="Category", value=f"`{cat_display}`", inline=True)
    embed.add_field(name="Created by", value=ctx.author.mention, inline=False)
    await ctx.send(embed=embed, delete_after=8, allowed_mentions=discord.AllowedMentions.none())

@channel_group.command(name="create", description="Create a new channel.")
async def channel_create_cmd(
    interaction: discord.Interaction,
    name: str,
    channel_type: str = "text",
    category: discord.CategoryChannel = None
):
    ctx = InteractionContext(interaction)
    await _do_create(ctx, name, channel_type, category)

async def setup(bot: commands.Bot):
    pass
