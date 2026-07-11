from discord.ext import commands

@commands.hybrid_group(name="channel", description="Channel management commands (`create`, `delete`).")
@commands.has_permissions(manage_channels=True)
async def channel_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        await ctx.send(
            "**Channel Management**\n"
            "> `-createchannel <name> [text/voice] [#category]` — Create a new channel\n"
            "> `-deletechannel [#channel]` — Delete a channel",
            ephemeral=True
        )

async def setup(bot: commands.Bot):
    if "channel" not in bot.all_commands:
        bot.add_command(channel_group)
