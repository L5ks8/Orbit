import discord
from discord.ext import commands
from discord.ui import Container, TextDisplay, Separator
from Components.Commands.Whitelist._storage import is_whitelisted
from Components.Commands.Voice.voice import voice_group
from Components.Commands._utils import make_embed, make_v2_card, ORBIT_COLOR, InteractionContext
from Components.emojis import Emojis


async def _do_vc_mute(interaction: discord.Interaction, target: discord.Member, reason: str):
    await ctx.defer()
    if is_whitelisted(ctx.guild.id, target.id):
        return await ctx.send(embed=make_embed("This user is on the global moderation whitelist (`Immune to Voice Mute`).", discord.Color.red()), ephemeral=True)
    if not target.voice:
        return await ctx.send(embed=make_embed("This user is not currently in a voice channel.", discord.Color.red()), ephemeral=True)
    if target.voice.mute:
        return await ctx.send(embed=make_embed("This user is already voice muted.", discord.Color.red()), ephemeral=True)

    try:
        from Components.Commands._utils import send_moderation_dm
        await send_moderation_dm(target, ctx.guild.name, "voice muted", reason, guild_id=ctx.guild.id)
        await target.edit(mute=True, reason=f"Voice muted by {ctx.author} | Reason: {reason}")
        
        v2_body = (
            f"# Voice Muted\n\n"
            f"**Target:** {target.mention} (`{target.id}`)\n"
            f"**Destination Channel:** {target.voice.channel.mention if target.voice.channel else 'N/A'}\n"
            f"**Moderator:** {ctx.author.mention}"
        )
        if reason and reason != "No reason provided":
            v2_body += f"\n**Reason:** {reason}"
        card = make_v2_card(v2_body, color=ORBIT_COLOR)
        if card:
            return await ctx.send(view=card, allowed_mentions=discord.AllowedMentions.none())

        embed = discord.Embed(title="Voice Muted", color=ORBIT_COLOR)
        embed.add_field(name="Target", value=f"{target.mention} (`{target.id}`)", inline=False)
        embed.add_field(name="Destination Channel", value=target.voice.channel.mention if target.voice.channel else "N/A", inline=False)
        if reason and reason != "No reason provided":
            embed.add_field(name="Reason", value=reason, inline=False)
        embed.add_field(name="Moderator", value=ctx.author.mention, inline=False)
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())
    except discord.Forbidden:
        await ctx.send(embed=make_embed("I do not have sufficient permissions to voice mute this user.", discord.Color.red()), ephemeral=True)
    except Exception as e:
        await ctx.send(embed=make_embed(f"Error voice muting user: {e}", discord.Color.red()), ephemeral=True)

@voice_group.command(name="mute", description="Voice mute a member in a voice channel.")
async def vc_mute_cmd(interaction: discord.Interaction, target: discord.Member, *, reason: str = "No reason provided"):
    ctx = InteractionContext(interaction)
    await _do_vc_mute(ctx, target, reason)



class VcMuteCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

async def setup(bot: commands.Bot):
    pass
