import discord
from Components.Commands._utils import ORBIT_COLOR, make_embed, make_v2_card, InteractionContext
from Components.emojis import Emojis
from discord.ext import commands
from Components.Commands.Voice.voice import voice_group

async def _do_vc_unlock(ctx: InteractionContext, channel: discord.VoiceChannel | None, reason: str):
    await ctx.defer()
    target_channel = channel or (ctx.author.voice.channel if ctx.author.voice else None)
    if not target_channel:
        return await ctx.send(embed=make_embed("Please specify a voice channel or join one first.", discord.Color.red()), ephemeral=True)

    overwrite = target_channel.overwrites_for(ctx.guild.default_role)
    if overwrite.connect is True or (overwrite.connect is None and target_channel.permissions_for(ctx.guild.default_role).connect):
        return await ctx.send(embed=make_embed("This voice channel is not currently locked.", discord.Color.red()), ephemeral=True)

    try:
        overwrite.connect = None
        await target_channel.set_permissions(ctx.guild.default_role, overwrite=overwrite, reason=f"Voice channel unlocked by {ctx.author} | Reason: {reason}")
        v2_body = (
            f"# Channel Unlocked\n\n"
            f"**Destination Channel:** {target_channel.mention}\n"
            f"**Moderator:** {ctx.author.mention}"
        )
        if reason and reason != "No reason provided":
            v2_body += f"\n**Reason:** {reason}"
        card = make_v2_card(v2_body, color=ORBIT_COLOR)
        if card:
            return await ctx.send(view=card, allowed_mentions=discord.AllowedMentions.none())

        embed = discord.Embed(title="Channel Unlocked", color=ORBIT_COLOR)
        embed.add_field(name="Destination Channel", value=target_channel.mention, inline=False)
        if reason and reason != "No reason provided":
            embed.add_field(name="Reason", value=reason, inline=False)
        embed.add_field(name="Moderator", value=ctx.author.mention, inline=False)
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())
    except discord.Forbidden:
        await ctx.send(embed=make_embed("I do not have sufficient permissions to unlock this voice channel.", discord.Color.red()), ephemeral=True)
    except Exception as e:
        await ctx.send(embed=make_embed(f"Error unlocking voice channel: {e}", discord.Color.red()), ephemeral=True)

@voice_group.command(name="unlock", description="Unlock a voice channel so regular members can connect.")
async def vc_unlock_cmd(interaction: discord.Interaction, channel: discord.VoiceChannel = None, *, reason: str = "No reason provided"):
    ctx = InteractionContext(interaction)
    await _do_vc_unlock(ctx, channel, reason)



class VcUnlockCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

async def setup(bot: commands.Bot):
    pass
