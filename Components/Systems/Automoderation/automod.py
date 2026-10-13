import discord
from discord.ext import commands
from discord import app_commands
from Components.Commands._utils import make_embed, InteractionContext

class AutoModCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(name="automod", description="Automated server protection system.")
    @app_commands.default_permissions(administrator=True)
    async def automod_cmd(self, interaction: discord.Interaction):
        ctx = InteractionContext(interaction)
        if not ctx.guild:
            return await ctx.send(embed=make_embed("This command can only be used inside a server.", discord.Color.red()), ephemeral=True)
        from Components.Systems.Automoderation._views import AutoModDashboardLayout
        view = AutoModDashboardLayout(ctx.guild.id)
        await ctx.send(**view.get_kwargs(), allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    await bot.add_cog(AutoModCog(bot))
