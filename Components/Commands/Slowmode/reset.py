import discord
from Components.Commands._utils import make_embed, make_v2_card, ORBIT_COLOR
from Components.emojis import Emojis
from discord.ext import commands
from discord.ui import Container, TextDisplay, Separator
from Components.Commands.Slowmode.slowmode import slowmode_group


async def _do_slowmode_remove(ctx: commands.Context, channel: discord.TextChannel | None):
    await ctx.defer()
    target_channel = channel or ctx.channel
    if not isinstance(target_channel, discord.TextChannel):
        return await ctx.send(embed=make_embed("Please specify a valid text channel.", discord.Color.red()), ephemeral=True)

    if target_channel.slowmode_delay == 0:
        return await ctx.send(embed=make_embed("This channel does not currently have slowmode enabled.", discord.Color.red()), ephemeral=True)

    try:
        await target_channel.edit(slowmode_delay=0, reason=f"Slowmode removed by {ctx.author}")
        body = (
            f"# Slowmode Disabled\n\n"
            f"**Channel:** {target_channel.mention}\n"
            f"**Moderator:** {ctx.author.mention}"
        )
        card = make_v2_card(body, color=ORBIT_COLOR)
        if card:
            return await ctx.send(view=card, allowed_mentions=discord.AllowedMentions.none())
        embed = discord.Embed(title="Slowmode Disabled", color=ORBIT_COLOR)
        embed.add_field(name="Channel", value=target_channel.mention, inline=False)
        embed.add_field(name="Moderator", value=ctx.author.mention, inline=False)
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())
    except discord.Forbidden:
        await ctx.send(embed=make_embed("I do not have sufficient permissions to edit slowmode in this channel.", discord.Color.red()), ephemeral=True)
    except Exception as e:
        await ctx.send(embed=make_embed(f"Error removing slowmode: {e}", discord.Color.red()), ephemeral=True)

@slowmode_group.command(name="reset", description="Reset channel slowmode delay.")
@commands.has_permissions(manage_channels=True)
@commands.bot_has_permissions(manage_channels=True)
async def slowmode_remove_cmd(ctx: commands.Context, channel: discord.TextChannel = None):
    await _do_slowmode_remove(ctx, channel)

class SlowmodeRemoveCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @slowmode_remove_cmd.error
    async def slowmoderemove_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send(embed=make_embed("You need Manage Channels permission to reset slowmode.", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    from Components.Commands.Slowmode.slowmode import slowmode_group
    if "slowmode" not in bot.all_commands:
        bot.add_command(slowmode_group)
    await bot.add_cog(SlowmodeRemoveCommand(bot))
