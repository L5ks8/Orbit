import discord
from discord import app_commands
from discord.ext import commands
from Components.Commands.Giveaway._storage import get_giveaway
from Components.Commands.Giveaway.giveaway import end_giveaway_logic
from Components.Commands._utils import make_embed, make_v2_card, InteractionContext
from Components.emojis import Emojis

class GiveawayEndCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(name="gend", description="Ends an active giveaway early and immediately picks the winner(s).")
    @app_commands.default_permissions(manage_guild=True)
    @app_commands.checks.has_permissions(manage_guild=True)
    @app_commands.describe(giveaway_id="The unique ID of the giveaway (e.g. G-849201 or 849201)")
    async def gend(self, interaction: discord.Interaction, giveaway_id: str):
        ctx = InteractionContext(interaction)
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
            card = make_v2_card(f"# Giveaway Ended\n\nSuccessfully ended Giveaway `{entry['giveaway_id']}` (`{entry['prize']}`). Winner(s) have been announced!", color=ORBIT_COLOR)
            if card:
                await ctx.send(view=card)
            else:
                await ctx.send(embed=make_embed(f"Successfully ended Giveaway `{entry['giveaway_id']}` (`{entry['prize']}`). Winner(s) have been announced!", ORBIT_COLOR))
        else:
            await ctx.send(embed=make_embed(f"Failed to end or pick winners for Giveaway `{entry['giveaway_id']}`.", discord.Color.red()), ephemeral=True)

    @gend.error
    async def gend_error(self, interaction: discord.Interaction, error):
        ctx = InteractionContext(interaction)
        if isinstance(error, (app_commands.MissingPermissions, commands.MissingPermissions)):
            await ctx.send(embed=make_embed("You need Manage Server permission to end giveaways.", discord.Color.red()), ephemeral=True)
        elif isinstance(error, (app_commands.AppCommandError, commands.MissingRequiredArgument)):
            await ctx.send(embed=make_embed("Usage: `/gend <giveaway_id>`", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(GiveawayEndCommand(bot))
