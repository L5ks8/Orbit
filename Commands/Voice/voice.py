import discord
from discord.ext import commands
from Commands._utils import make_embed

@commands.hybrid_group(name="voice", aliases=["vc"], description="Voice channel controls")
async def voice_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        await ctx.send(embed=make_embed("Use: `ban`, `unban`, `mute`, `unmute`, `move`, `lock`, `unlock`, `limit`, or `say`.", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    if "voice" not in bot.all_commands:
        bot.add_command(voice_group)
