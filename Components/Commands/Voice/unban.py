import discord
from Components.Commands._utils import ORBIT_COLOR, make_embed, make_v2_card, InteractionContext
from Components.emojis import Emojis
from discord.ext import commands
from Components.Commands.Voice._storage import remove_from_vcban
from Components.Commands.Voice.voice import voice_group


async def _do_vc_unban(ctx: InteractionContext, user: discord.User, reason: str):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send(embed=make_embed("This command must be run inside a server.", discord.Color.red()), ephemeral=True)

    success = remove_from_vcban(ctx.guild.id, user.id)
    if not success:
        return await ctx.send(embed=make_embed("This user is not currently voice banned on this server.", discord.Color.red()), ephemeral=True)

    v2_body = (
        f"# Voice Unbanned\n\n"
        f"**Target:** {user.mention} (`{user.id}`)\n"
        f"**Moderator:** {ctx.author.mention}\n"
        f"**Status:** `Cleared`"
    )
    if reason and reason != "No reason provided":
        v2_body += f"\n**Reason:** {reason}"
    card = make_v2_card(v2_body, color=ORBIT_COLOR)
    if card:
        return await ctx.send(view=card, allowed_mentions=discord.AllowedMentions.none())

    embed = discord.Embed(title="Voice Unbanned", color=ORBIT_COLOR)
    embed.add_field(name="Target", value=f"{user.mention} (`{user.id}`)", inline=False)
    if reason and reason != "No reason provided":
        embed.add_field(name="Reason", value=reason, inline=False)
    embed.add_field(name="Moderator", value=ctx.author.mention, inline=False)
    embed.add_field(name="Status", value="`Cleared`", inline=False)
    await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

@voice_group.command(name="unban", description="Remove a voice ban from a user.")
async def vc_unban_cmd(interaction: discord.Interaction, user: discord.User, *, reason: str = "No reason provided"):
    ctx = InteractionContext(interaction)
    await _do_vc_unban(ctx, user, reason)



class VcUnbanCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

async def setup(bot: commands.Bot):
    pass
