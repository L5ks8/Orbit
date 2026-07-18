import discord
from discord import app_commands
from discord.ext import commands
from Commands.Giveaway._storage import get_giveaway
from Commands.Giveaway.giveaway import end_giveaway_logic

class GiveawayEndCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="gend", description="Ends an active giveaway early and immediately picks the winner(s).")
    @commands.has_permissions(manage_guild=True)
    @app_commands.describe(giveaway_id="The unique ID of the giveaway (e.g. G-849201 or 849201)")
    async def gend(self, ctx: commands.Context, giveaway_id: str):
        await ctx.defer()
        if not ctx.guild:
            return await ctx.send("This command must be run inside a server.", ephemeral=True)

        entry = get_giveaway(ctx.guild.id, giveaway_id)
        if not entry:
            return await ctx.send(f"Could not find giveaway with ID `{giveaway_id}` on this server.", ephemeral=True)

        if entry.get("ended"):
            return await ctx.send(f"Giveaway `{entry['giveaway_id']}` (`{entry['prize']}`) has already ended.", ephemeral=True)

        success = await end_giveaway_logic(self.bot, ctx.guild.id, entry)
        if success:
            await ctx.send(f"Successfully ended Giveaway `{entry['giveaway_id']}` (`{entry['prize']}`). Winner(s) have been announced!")
        else:
            await ctx.send(f"Failed to end or pick winners for Giveaway `{entry['giveaway_id']}`.", ephemeral=True)

    @gend.error
    async def gend_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Manage Server permission to end giveaways.", ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage: -gend <G-849201>", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(GiveawayEndCommand(bot))

