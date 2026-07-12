import discord
from discord.ext import commands
from Commands.Nick._utils import perform_nick_edit
from Commands.Nick.nick import nick_group

@nick_group.command(name="reset", description="Reset member nickname.")
@commands.has_permissions(manage_nicknames=True)
@commands.bot_has_permissions(manage_nicknames=True)
async def nick_reset_cmd(ctx: commands.Context, target: discord.Member):
    await perform_nick_edit(ctx, target, None)

class NickResetCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @nick_reset_cmd.error
    async def nickreset_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need the `Manage Nicknames` permission to use this command.", ephemeral=True)
        elif isinstance(error, commands.BotMissingPermissions):
            await ctx.send("I need the `Manage Nicknames` permission to reset nicknames.", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

class NickResetPrefixFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="nk_reset", aliases=["nickreset"], hidden=True)
    @commands.has_permissions(manage_nicknames=True)
    async def nick_reset_prefix(self, ctx: commands.Context, target: discord.Member):
        await perform_nick_edit(ctx, target, None)

async def setup(bot: commands.Bot):
    from Commands.Nick.nick import nick_group
    if "nick" not in bot.all_commands:
        bot.add_command(nick_group)
    await bot.add_cog(NickResetCommand(bot))
    await bot.add_cog(NickResetPrefixFallback(bot))
