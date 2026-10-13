import discord
from discord.ext import commands
from discord import app_commands
from Components.Commands.Nick._utils import perform_nick_edit
from Components.Commands._utils import format_usage, make_embed, InteractionContext
from Components.emojis import Emojis

class NickCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(name="nick", description="Change or reset a member's nickname.")
    @app_commands.describe(
        target="The member to rename",
        nickname="The new nickname. Leave empty to reset."
    )
    @app_commands.default_permissions(manage_nicknames=True)
    @app_commands.checks.has_permissions(manage_nicknames=True)
    @app_commands.checks.bot_has_permissions(manage_nicknames=True)
    async def nick_cmd(self, interaction: discord.Interaction, target: discord.Member, *, nickname: str = None):
        ctx = InteractionContext(interaction)
        if nickname and nickname.lower().strip() == "reset":
            nickname = None
        await perform_nick_edit(ctx, target, nickname)

    @nick_cmd.error
    async def nick_error(self, interaction: discord.Interaction, error):
        ctx = InteractionContext(interaction)
        if isinstance(error, (app_commands.MissingPermissions, commands.MissingPermissions)):
            await ctx.send(embed=make_embed("You need the `Manage Nicknames` permission to use this command.", discord.Color.red()), ephemeral=True)
        elif isinstance(error, (app_commands.BotMissingPermissions, commands.BotMissingPermissions)):
            await ctx.send(embed=make_embed("I need the `Manage Nicknames` permission to change nicknames."), ephemeral=True)
        elif isinstance(error, (app_commands.AppCommandError, commands.BadArgument)):
            await ctx.send(embed=make_embed(str(error), discord.Color.red()), ephemeral=True)
        elif isinstance(error, (app_commands.AppCommandError, commands.MissingRequiredArgument)):
            await ctx.send(embed=make_embed(format_usage(ctx.invoked_with, "<@member>", "[nickname]"), discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(NickCommand(bot))
