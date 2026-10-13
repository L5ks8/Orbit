import discord
from Components.Commands._utils import make_embed, make_v2_card, ORBIT_COLOR, InteractionContext
from Components.emojis import Emojis
from discord.ext import commands
from discord.ui import Container, TextDisplay, Separator
from Components.Commands.Slowmode.slowmode import slowmode_group


async def _do_slowmode_set(interaction: discord.Interaction, seconds: int, channel: discord.TextChannel | None):
    await ctx.defer()
    target_channel = channel or ctx.channel
    if not isinstance(target_channel, discord.TextChannel):
        return await ctx.send(embed=make_embed("Please specify a valid text channel.", discord.Color.red()), ephemeral=True)

    if seconds < 0 or seconds > 21600:
        return await ctx.send(embed=make_embed("Slowmode delay must be between 0 and 21600 seconds (6 hours).", discord.Color.red()), ephemeral=True)

    try:
        await target_channel.edit(slowmode_delay=seconds, reason=f"Slowmode set by {ctx.author}")
        body = (
            f"# Slowmode Enabled\n\n"
            f"**Channel:** {target_channel.mention}\n"
            f"**Delay:** `{seconds} seconds` between messages\n"
            f"**Moderator:** {ctx.author.mention}"
        )
        card = make_v2_card(body, color=ORBIT_COLOR)
        if card:
            return await ctx.send(view=card, allowed_mentions=discord.AllowedMentions.none())
        embed = discord.Embed(title="Slowmode Enabled", color=ORBIT_COLOR)
        embed.add_field(name="Channel", value=target_channel.mention, inline=False)
        embed.add_field(name="Delay", value=f"`{seconds} seconds` between messages", inline=False)
        embed.add_field(name="Moderator", value=ctx.author.mention, inline=False)
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())
    except discord.Forbidden:
        await ctx.send(embed=make_embed("I do not have sufficient permissions to edit slowmode in this channel.", discord.Color.red()), ephemeral=True)
    except Exception as e:
        await ctx.send(embed=make_embed(f"Error setting slowmode: {e}", discord.Color.red()), ephemeral=True)

@slowmode_group.command(name="set", description="Set channel slowmode delay.")
async def slowmode_set_cmd(interaction: discord.Interaction, seconds: int, channel: discord.TextChannel = None):
    ctx = InteractionContext(interaction)
    await _do_slowmode_set(ctx, seconds, channel)

class SlowmodeSetCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @slowmode_set_cmd.error
    async def slowmodeset_error(self, interaction: discord.Interaction, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send(embed=make_embed("You need Manage Channels permission to configure slowmode.", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    pass
