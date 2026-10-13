import discord
from Components.Commands._utils import ORBIT_COLOR, make_embed, make_v2_card, InteractionContext
from Components.emojis import Emojis
from discord.ext import commands
from Components.Commands.Voice.voice import voice_group

async def _do_vc_limit(ctx: InteractionContext, limit: int, channel: discord.VoiceChannel | None):
    await ctx.defer()
    target_channel = channel or (ctx.author.voice.channel if ctx.author.voice else None)
    if not target_channel:
        return await ctx.send(embed=make_embed("Please specify a voice channel or join one first.", discord.Color.red()), ephemeral=True)

    if limit < 0 or limit > 99:
        return await ctx.send(embed=make_embed("Please specify a limit between 0 (unlimited) and 99.", discord.Color.red()), ephemeral=True)

    try:
        await target_channel.edit(user_limit=limit, reason=f"Voice limit updated by {ctx.author}")
        v2_body = (
            f"# User Limit Set\n\n"
            f"**Destination Channel:** {target_channel.mention}\n"
            f"**New Limit:** `{limit if limit > 0 else 'None'}`\n"
            f"**Moderator:** {ctx.author.mention}"
        )
        card = make_v2_card(v2_body, color=ORBIT_COLOR)
        if card:
            return await ctx.send(view=card, allowed_mentions=discord.AllowedMentions.none())

        embed = discord.Embed(title="User Limit Set", color=ORBIT_COLOR)
        embed.add_field(name="Destination Channel", value=target_channel.mention, inline=False)
        if limit > 0:
            embed.add_field(name="New Limit", value=f"`{limit}`", inline=False)
        else:
            embed.add_field(name="New Limit", value="`None`", inline=False)
        embed.add_field(name="Moderator", value=ctx.author.mention, inline=False)
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())
    except discord.Forbidden:
        await ctx.send(embed=make_embed("I do not have sufficient permissions to modify this voice channel.", discord.Color.red()), ephemeral=True)
    except Exception as e:
        await ctx.send(embed=make_embed(f"Error setting voice limit: {e}", discord.Color.red()), ephemeral=True)

@voice_group.command(name="limit", description="Set the user limit for a voice channel.")
async def vc_limit_cmd(interaction: discord.Interaction, limit: int, channel: discord.VoiceChannel = None):
    ctx = InteractionContext(interaction)
    await _do_vc_limit(ctx, limit, channel)



class VcLimitCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

async def setup(bot: commands.Bot):
    pass
