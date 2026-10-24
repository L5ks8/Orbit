import discord
from Components.Commands._utils import ORBIT_COLOR, make_embed, make_v2_card, InteractionContext
from Components.emojis import Emojis
from discord.ext import commands
from Components.Commands.Voice.voice import voice_group
from Components.Commands.Voice._permissions import can_manage_channel

async def _do_vc_lock(ctx: InteractionContext, channel: discord.VoiceChannel | None, reason: str):
    await ctx.defer()
    target_channel = channel or (ctx.author.voice.channel if ctx.author.voice else None)
    if not target_channel:
        return await ctx.send(embed=make_embed("Please specify a voice channel or join one first.", discord.Color.red()), ephemeral=True)

    allowed, err_msg = can_manage_channel(ctx.author, target_channel)
    if not allowed:
        return await ctx.send(embed=make_embed(err_msg, discord.Color.red()), ephemeral=True)

    overwrite = target_channel.overwrites_for(ctx.guild.default_role)
    if overwrite.connect is False:
        return await ctx.send(embed=make_embed("This voice channel is already locked.", discord.Color.red()), ephemeral=True)

    try:
        overwrite.connect = False
        await target_channel.set_permissions(ctx.guild.default_role, overwrite=overwrite, reason=f"Voice channel locked by {ctx.author} | Reason: {reason}")
        v2_body = (
            f"# Channel Locked\n\n"
            f"**Destination Channel:** {target_channel.mention}\n"
            f"**Moderator:** {ctx.author.mention}"
        )
        if reason and reason != "No reason provided":
            v2_body += f"\n**Reason:** {reason}"
        card = make_v2_card(v2_body, color=ORBIT_COLOR)
        if card:
            return await ctx.send(view=card, allowed_mentions=discord.AllowedMentions.none())

        embed = discord.Embed(title="Channel Locked", color=ORBIT_COLOR)
        embed.add_field(name="Destination Channel", value=target_channel.mention, inline=False)
        if reason and reason != "No reason provided":
            embed.add_field(name="Reason", value=reason, inline=False)
        embed.add_field(name="Moderator", value=ctx.author.mention, inline=False)
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())
    except discord.Forbidden:
        await ctx.send(embed=make_embed("I do not have sufficient permissions to lock this voice channel.", discord.Color.red()), ephemeral=True)
    except Exception as e:
        await ctx.send(embed=make_embed(f"Error locking voice channel: {e}", discord.Color.red()), ephemeral=True)

@voice_group.command(name="lock", description="Lock a voice channel so regular members cannot connect.")
async def vc_lock_cmd(interaction: discord.Interaction, channel: discord.VoiceChannel = None, *, reason: str = "No reason provided"):
    ctx = InteractionContext(interaction)
    await _do_vc_lock(ctx, channel, reason)



class VcLockCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

async def setup(bot: commands.Bot):
    pass
