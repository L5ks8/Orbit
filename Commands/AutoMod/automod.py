import discord
from discord.ext import commands

@commands.hybrid_group(name="automod", description="Automated server protection system.")
@commands.has_permissions(administrator=True)
async def automod_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        if not ctx.guild:
            return await ctx.send("This command can only be used inside a server.", ephemeral=True)
        from Commands.AutoMod._views import AutoModDashboardLayout
        view = AutoModDashboardLayout(ctx.guild.id)
        await ctx.send(**view.get_kwargs(), allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    if "automod" not in bot.all_commands:
        bot.add_command(automod_group)

