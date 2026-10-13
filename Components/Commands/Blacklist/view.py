import discord
from discord import app_commands
from discord.ext import commands
from Components.Commands.Blacklist._views import BlacklistListLayout
from Components.Commands._utils import make_embed, InteractionContext
from Components.emojis import Emojis

async def _do_bl_list(ctx: commands.Context):
    if not ctx.guild:
        return await ctx.send(embed=make_embed("This command must be run inside a server.", discord.Color.red()), ephemeral=True)
    view = BlacklistListLayout(ctx.guild, ctx.bot, ctx.author.id)
    await ctx.send(**view.get_kwargs(), allowed_mentions=discord.AllowedMentions.none())

class BlacklistListCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(name="checkblacklist", description="Lists all blacklisted users with options to add/remove IDs.")
    @app_commands.default_permissions(administrator=True)
    @app_commands.checks.has_permissions(administrator=True)
    async def checkblacklist(self, interaction: discord.Interaction):
        ctx = InteractionContext(interaction)
        await _do_bl_list(ctx)

async def setup(bot: commands.Bot):
    bot.remove_command("checkblacklist")
    await bot.add_cog(BlacklistListCog(bot))
