import discord
from discord.ext import commands

@commands.hybrid_group(name="blacklist", description="Blacklist management (`panel`, `add`, `remove`, `view`, `check`).")
@commands.has_permissions(administrator=True)
async def blacklist_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        if not ctx.guild:
            return await ctx.send("This command can only be used inside a server.", ephemeral=True)
        from Commands.Blacklist.blacklist import BlacklistDashboardLayout
        view = BlacklistDashboardLayout(ctx.guild.id, ctx.author.id)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    if "blacklist" not in bot.all_commands:
        bot.add_command(blacklist_group)
