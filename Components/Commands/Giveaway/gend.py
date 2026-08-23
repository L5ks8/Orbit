import discord
from discord import app_commands
from discord.ext import commands
from Components.Commands.Giveaway._storage import get_giveaway
from Components.Commands.Giveaway.giveaway import end_giveaway_logic
from Components.Commands._utils import make_embed

class GiveawayEndCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="gend", description="Ends an active giveaway early and immediately picks the winner(s).")
    @commands.has_permissions(manage_guild=True)
    @app_commands.describe(giveaway_id="The unique ID of the giveaway (e.g. G-849201 or 849201)")
    async def gend(self, ctx: commands.Context, giveaway_id: str):
        await ctx.defer()
        if not ctx.guild:
            return await ctx.send(embed=make_embed("This command must be run inside a server.", discord.Color.red()), ephemeral=True)

        entry = get_giveaway(ctx.guild.id, giveaway_id)
        if not entry:
            return await ctx.send(embed=make_embed(f"Could not find giveaway with ID `{giveaway_id}` on this server.", discord.Color.red()), ephemeral=True)

        if entry.get("ended"):
            return await ctx.send(embed=make_embed(f"Giveaway `{entry['giveaway_id']}` (`{entry['prize']}`) has already ended.", discord.Color.red()), ephemeral=True)

        success = await end_giveaway_logic(self.bot, ctx.guild.id, entry)
        if success:
            await ctx.send(embed=make_embed(f"Successfully ended Giveaway `{entry['giveaway_id']}` (`{entry['prize']}`). Winner(s) have been announced!", discord.Color.green()))
        else:
            await ctx.send(embed=make_embed(f"Failed to end or pick winners for Giveaway `{entry['giveaway_id']}`.", discord.Color.red()), ephemeral=True)

    @gend.error
    async def gend_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send(embed=make_embed("You need Manage Server permission to end giveaways.", discord.Color.red()), ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send(embed=make_embed("Usage: -gend <G-849201>", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(GiveawayEndCommand(bot))
