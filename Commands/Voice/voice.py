import discord
from discord.ext import commands

@commands.hybrid_group(name="voice", aliases=["vc"], description="Voice channel management commands.")
async def voice_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        await ctx.send("Please specify a subcommand: `ban`, `unban`, `mute`, `unmute`, `move`, `lock`, `unlock`, or `limit`.", ephemeral=True)

async def setup(bot: commands.Bot):
    if "voice" not in bot.all_commands:
        bot.add_command(voice_group)
