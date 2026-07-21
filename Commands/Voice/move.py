import discord
from discord.ext import commands
from typing import Union, Optional

async def _resolve_channel(ctx: commands.Context, channel_raw: Union[str, discord.VoiceChannel, discord.StageChannel]) -> Optional[Union[discord.VoiceChannel, discord.StageChannel]]:
    if isinstance(channel_raw, (discord.VoiceChannel, discord.StageChannel)):
        return channel_raw

    if isinstance(channel_raw, str):
        clean_str = channel_raw.strip("<#> ")
        if clean_str.isdigit():
            ch_id = int(clean_str)
            ch = ctx.guild.get_channel(ch_id)
            if isinstance(ch, (discord.VoiceChannel, discord.StageChannel)):
                return ch
            try:
                ch = await ctx.guild.fetch_channel(ch_id)
                if isinstance(ch, (discord.VoiceChannel, discord.StageChannel)):
                    return ch
            except Exception:
                pass

        # Case-insensitive name lookup
        target_name_lower = channel_raw.lower()
        for ch in ctx.guild.voice_channels + ctx.guild.stage_channels:
            if ch.name.lower() == target_name_lower:
                return ch

    return None

async def _do_vc_move(
    ctx: commands.Context,
    target_raw: Union[str, discord.Member],
    channel_raw: Union[str, discord.VoiceChannel, discord.StageChannel],
    reason: str = "No reason provided"
):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be used in a server.", ephemeral=True)

    dest_channel = await _resolve_channel(ctx, channel_raw)
    if not dest_channel:
        return await ctx.send("❌ Could not find a valid voice channel with that ID or name.", ephemeral=True)

    # Check if target is 'all'
    target_str = str(target_raw).strip().lower() if not isinstance(target_raw, discord.Member) else ""
    is_all = target_str in ["all", "@everyone", "*", "everyone", "allmembers"]

    if is_all:
        if ctx.author.voice and ctx.author.voice.channel:
            source_members = [m for m in ctx.author.voice.channel.members if m.voice and m.voice.channel.id != dest_channel.id]
        else:
            source_members = []
            for vc in ctx.guild.voice_channels + ctx.guild.stage_channels:
                if vc.id != dest_channel.id:
                    source_members.extend(vc.members)

        if not source_members:
            return await ctx.send("❌ No voice members found to move.", ephemeral=True)

        moved_count = 0
        for m in source_members:
            try:
                await m.edit(voice_channel=dest_channel, reason=f"Moved all by {ctx.author} | Reason: {reason}")
                moved_count += 1
            except Exception:
                pass

        if moved_count == 0:
            return await ctx.send("❌ Failed to move members. Please check my permissions.", ephemeral=True)

        from Embeds import get_command_embed
        kwargs = get_command_embed(
            ctx.guild.id,
            "voice",
            msg_type="moveall",
            count=moved_count,
            channel_mention=dest_channel.mention,
            reason=reason,
            author_mention=ctx.author.mention
        )
        return await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())

    else:
        # Resolve target member
        target_member: Optional[discord.Member] = None
        if isinstance(target_raw, discord.Member):
            target_member = target_raw
        else:
            clean_id_str = str(target_raw).strip("<@!> ")
            if clean_id_str.isdigit():
                target_member = ctx.guild.get_member(int(clean_id_str))
                if not target_member:
                    try:
                        target_member = await ctx.guild.fetch_member(int(clean_id_str))
                    except Exception:
                        pass
            if not target_member:
                target_member = ctx.guild.get_member_named(str(target_raw))

        if not target_member:
            return await ctx.send(f"❌ Could not find member `{target_raw}`.", ephemeral=True)

        if not target_member.voice or not target_member.voice.channel:
            return await ctx.send(f"❌ {target_member.mention} is not in any voice channel.", ephemeral=True)

        if target_member.voice.channel.id == dest_channel.id:
            return await ctx.send(f"{target_member.mention} is already in {dest_channel.mention}.", ephemeral=True)

        try:
            await target_member.edit(voice_channel=dest_channel, reason=f"Moved by {ctx.author} | Reason: {reason}")
            from Embeds import get_command_embed
            kwargs = get_command_embed(
                ctx.guild.id,
                "voice",
                msg_type="move",
                member_mention=target_member.mention,
                member_id=target_member.id,
                channel_mention=dest_channel.mention,
                reason=reason,
                author_mention=ctx.author.mention
            )
            await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())
        except discord.Forbidden:
            await ctx.send("❌ I do not have permission to move that member into that channel.", ephemeral=True)
        except Exception as e:
            await ctx.send(f"❌ Error moving user: {e}", ephemeral=True)

from Commands.Voice.voice import voice_group

@voice_group.command(name="move", description="Move a member or 'all' into a voice channel.")
@commands.has_permissions(move_members=True)
@commands.bot_has_permissions(move_members=True)
async def vc_move_cmd(ctx: commands.Context, target: str, channel: str, *, reason: str = "No reason provided"):
    await _do_vc_move(ctx, target, channel, reason)

@voice_group.command(name="moveall", description="Move all members from voice into a destination channel.")
@commands.has_permissions(move_members=True)
@commands.bot_has_permissions(move_members=True)
async def vc_moveall_cmd(ctx: commands.Context, channel: str, *, reason: str = "No reason provided"):
    await _do_vc_move(ctx, "all", channel, reason)

@vc_move_cmd.error
@vc_moveall_cmd.error
async def move_error(ctx: commands.Context, error):
    if isinstance(error, commands.MissingPermissions):
        await ctx.send("You need `Move Members` permission to move voice users.", ephemeral=True)
    elif isinstance(error, commands.MissingRequiredArgument):
        await ctx.send("Usage: `-voice move <@member|all> <#channel|channel_id> [reason]`", ephemeral=True)
    else:
        await ctx.send(f"An error occurred: {error}", ephemeral=True)

class MoveCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

class MovePrefixFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="vc_move", aliases=["vcmove", "voicemove"], hidden=True)
    @commands.has_permissions(move_members=True)
    async def vc_move_prefix(self, ctx: commands.Context, target: str, channel: str, *, reason: str = "No reason provided"):
        await _do_vc_move(ctx, target, channel, reason)

    @commands.command(name="moveall", aliases=["vc_moveall", "vcmoveall"], hidden=True)
    @commands.has_permissions(move_members=True)
    async def vc_moveall_prefix(self, ctx: commands.Context, channel: str, *, reason: str = "No reason provided"):
        await _do_vc_move(ctx, "all", channel, reason)

async def setup(bot: commands.Bot):
    from Commands.Voice.voice import voice_group
    if "voice" not in bot.all_commands:
        bot.add_command(voice_group)
    await bot.add_cog(MoveCommand(bot))
    await bot.add_cog(MovePrefixFallback(bot))
