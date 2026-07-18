import discord
from discord.ext import commands
from discord import app_commands
from Commands.Nick._utils import perform_nick_edit
from Commands._utils import format_usage

class NickCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="nick", aliases=["nickname", "nk"], description="Change or reset a member's nickname.")
    @app_commands.describe(
        target="The member to rename",
        nickname="The new nickname. Leave empty to reset."
    )
    @commands.has_permissions(manage_nicknames=True)
    @commands.bot_has_permissions(manage_nicknames=True)
    async def nick_cmd(self, ctx: commands.Context, target: discord.Member, *, nickname: str = None):
        if nickname and nickname.lower().strip() == "reset":
            nickname = None
        await perform_nick_edit(ctx, target, nickname)

    @nick_cmd.error
    async def nick_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need the `Manage Nicknames` permission to use this command.", ephemeral=True)
        elif isinstance(error, commands.BotMissingPermissions):
            await ctx.send("I need the `Manage Nicknames` permission to change nicknames.", ephemeral=True)
        elif isinstance(error, commands.BadArgument):
            await ctx.send(str(error), ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send(format_usage(ctx.invoked_with, "<@member>", "[nickname]"), ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(NickCommand(bot))

