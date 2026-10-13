import discord
from discord.ext import commands
from discord import app_commands
from Components.Commands.Whitelist._views import WhitelistListLayout
from Components.Commands._utils import make_embed, InteractionContext
from Components.emojis import Emojis

async def _do_wl_list(ctx: commands.Context):
    if not ctx.guild:
        return await ctx.send(embed=make_embed("This command must be run inside a server.", discord.Color.red()), ephemeral=True)
    view = WhitelistListLayout(ctx.guild, ctx.bot, ctx.author.id)
    kwargs = view.get_kwargs(ctx.guild.id)
    await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())

class CheckWhitelistCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(name="checkwhitelist", description="Lists all whitelisted users with options to add/remove IDs.")
    @app_commands.default_permissions(administrator=True)
    async def checkwhitelist_cmd(self, interaction: discord.Interaction):
        ctx = InteractionContext(interaction)
        await _do_wl_list(ctx)

async def setup(bot: commands.Bot):
    await bot.add_cog(CheckWhitelistCommand(bot))
