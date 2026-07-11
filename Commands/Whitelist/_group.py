import discord
from discord.ext import commands

@commands.hybrid_group(name="whitelist", description="Global Moderation Whitelist & Protection system (`panel`, `add`, `remove`, `view`, `check`).")
async def whitelist_group(ctx: commands.Context):
    if not ctx.guild:
        return await ctx.send("This command can only be used inside a server.", ephemeral=True)
    if ctx.author.id != ctx.guild.owner_id:
        return await ctx.send("Only the Server Owner can use the whitelist system.", ephemeral=True)
    if ctx.invoked_subcommand is None:
        from Commands.Whitelist._views import WhitelistDashboardLayout
        view = WhitelistDashboardLayout(ctx.guild.id, ctx.author.id)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    if "whitelist" not in bot.all_commands:
        bot.add_command(whitelist_group)
