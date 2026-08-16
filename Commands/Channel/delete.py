import discord
from discord.ext import commands
from Commands.Channel.channel import channel_group



async def _do_delete(ctx: commands.Context, channel: discord.abc.GuildChannel | None):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send(embed=make_embed("This command must be run inside a server.", discord.Color.red()), ephemeral=True)

    target = channel or ctx.channel

    if isinstance(target, (discord.TextChannel, discord.VoiceChannel, discord.StageChannel, discord.ForumChannel)):
        ch_type = "Voice" if isinstance(target, discord.VoiceChannel) else "Text"
        name = target.name
        try:
            await target.delete(reason=f"Deleted by {ctx.author} via Orbit -deletechannel")
        except discord.Forbidden:
            return await ctx.send(embed=make_embed("I don't have permission to delete that channel."), ephemeral=True)
        except discord.HTTPException as e:
            return await ctx.send(embed=make_embed(f"Failed to delete channel: `{e}`", discord.Color.red()), ephemeral=True)

        if target != ctx.channel:
            try:
                await ctx.message.delete()
            except Exception:
                pass
            embed = discord.Embed(title="Channel Deleted", color=discord.Color.red())
            embed.add_field(name="Channel", value=f"`#{name}`", inline=False)
            embed.add_field(name="Type", value=f"`{ch_type}`", inline=True)
            embed.add_field(name="Deleted by", value=ctx.author.mention, inline=False)
            await ctx.send(embed=embed, delete_after=8, allowed_mentions=discord.AllowedMentions.none())
    else:
        await ctx.send(embed=make_embed("That channel type cannot be deleted with this command.", discord.Color.red()), ephemeral=True)

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
            await ctx.send(embed=make_embed("You need `Manage Channels` permission to delete channels.", discord.Color.red()), ephemeral=True)
        elif isinstance(error, commands.BadArgument):
            await ctx.send(embed=make_embed("Could not find that channel.", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    from Commands.Channel.channel import channel_group
    from Commands._utils import make_embed
    if "channel" not in bot.all_commands:
        bot.add_command(channel_group)
    await bot.add_cog(ChannelDeleteCog(bot))
