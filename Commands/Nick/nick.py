import discord
from discord.ext import commands
from Commands.Nick._utils import perform_nick_edit
from Commands.Nick._group import nick_group

@nick_group.command(name="set", description="Changes a server member's nickname (`/nick set`).")
@commands.has_permissions(manage_nicknames=True)
@commands.bot_has_permissions(manage_nicknames=True)
async def nick_set_cmd(ctx: commands.Context, target: discord.Member, *, nickname: str):
    await perform_nick_edit(ctx, target, nickname)

class NickCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @nick_set_cmd.error
    async def nick_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need the `Manage Nicknames` permission to use this command.", ephemeral=True)
        elif isinstance(error, commands.BotMissingPermissions):
            await ctx.send("I need the `Manage Nicknames` permission to change nicknames.", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

class NickPrefixFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="nick set", aliases=["nickset"], hidden=True)
    @commands.has_permissions(manage_nicknames=True)
    async def nick_set_prefix(self, ctx: commands.Context, target: discord.Member, *, nickname: str):
        await perform_nick_edit(ctx, target, nickname)

async def setup(bot: commands.Bot):
    await bot.add_cog(NickCommand(bot))
    await bot.add_cog(NickPrefixFallback(bot))
