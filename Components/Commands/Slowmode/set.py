import discord
from Components.Commands._utils import make_embed, make_v2_card, ORBIT_COLOR, InteractionContext, parse_duration, format_duration
from Components.emojis import Emojis
from discord.ext import commands
from discord import app_commands
from discord.ui import Container, TextDisplay, Separator
from Components.Commands.Slowmode.slowmode import slowmode_group


async def _do_slowmode_set(ctx: InteractionContext, delay: str, channel: discord.TextChannel | None):
    await ctx.defer()
    target_channel = channel or ctx.channel
    if not isinstance(target_channel, discord.TextChannel):
        return await ctx.send(embed=make_embed("Please specify a valid text channel.", discord.Color.red()), ephemeral=True)

    seconds = parse_duration(delay, default_unit="s")
    if seconds is None or seconds < 0 or seconds > 21600:
        return await ctx.send(embed=make_embed("Slowmode delay must be between 0s and 6h (21600 seconds). Examples: `5s`, `10s`, `1m`, `2h`, `0s`.", discord.Color.red()), ephemeral=True)

    try:
        await target_channel.edit(slowmode_delay=seconds, reason=f"Slowmode set by {ctx.author}")
        status_text = f"`{format_duration(seconds)}` between messages" if seconds > 0 else "`Disabled (0s)`"
        title_text = "Slowmode Configured" if seconds > 0 else "Slowmode Disabled"
        body = (
            f"# {title_text}\n\n"
            f"**Channel:** {target_channel.mention}\n"
            f"**Delay:** {status_text}\n"
            f"**Moderator:** {ctx.author.mention}"
        )
        card = make_v2_card(body, color=ORBIT_COLOR)
        if card:
            return await ctx.send(view=card, allowed_mentions=discord.AllowedMentions.none())

        embed = discord.Embed(title=title_text, color=ORBIT_COLOR)
        embed.add_field(name="Channel", value=target_channel.mention, inline=False)
        embed.add_field(name="Delay", value=status_text, inline=False)
        embed.add_field(name="Moderator", value=ctx.author.mention, inline=False)
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())
    except discord.Forbidden:
        await ctx.send(embed=make_embed("I do not have sufficient permissions to edit slowmode in this channel.", discord.Color.red()), ephemeral=True)
    except Exception as e:
        await ctx.send(embed=make_embed(f"Error setting slowmode: {e}", discord.Color.red()), ephemeral=True)

@slowmode_group.command(name="set", description="Set channel slowmode delay.")
@app_commands.describe(
    delay="Slowmode delay (e.g. 5s, 10s, 1m, 1h, 0s to disable)",
    channel="Channel to configure (defaults to current channel)"
)
async def slowmode_set_cmd(interaction: discord.Interaction, delay: str, channel: discord.TextChannel = None):
    ctx = InteractionContext(interaction)
    await _do_slowmode_set(ctx, delay, channel)

class SlowmodeSetCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @slowmode_set_cmd.error
    async def slowmodeset_error(self, interaction: discord.Interaction, error):
        ctx = InteractionContext(interaction)
        if isinstance(error, (app_commands.MissingPermissions, commands.MissingPermissions)):
            await ctx.send(embed=make_embed("You need Manage Channels permission to configure slowmode.", discord.Color.red()), ephemeral=True)
        elif isinstance(error, (commands.MissingRequiredArgument, app_commands.CommandSignatureMismatch)):
            await ctx.send(embed=make_embed("Usage: `/slowmode set <delay> [#channel]` (e.g. `5s`, `1m`, `1h`)", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    pass
