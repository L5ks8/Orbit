import random
import discord
from discord import app_commands
from discord.ext import commands
from Commands.Giveaway._storage import get_giveaway

class GiveawayRerollCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="greroll", description="Rerolls a new winner for an ended giveaway.")
    @commands.has_permissions(manage_guild=True)
    @app_commands.describe(giveaway_id="The unique ID of the ended giveaway (e.g. G-849201 or 849201)")
    async def greroll(self, ctx: commands.Context, giveaway_id: str):
        await ctx.defer()
        if not ctx.guild:
            return await ctx.send("This command must be run inside a server.", ephemeral=True)

        entry = get_giveaway(ctx.guild.id, giveaway_id)
        if not entry:
            return await ctx.send(f"Could not find giveaway with ID `{giveaway_id}` on this server.", ephemeral=True)

        if not entry.get("ended"):
            return await ctx.send(f"Giveaway `{entry['giveaway_id']}` is currently active. Use `-gend {giveaway_id}` to end it first.", ephemeral=True)

        valid_entrants = []
        for uid in entry.get("entries", []):
            member = ctx.guild.get_member(uid)
            if not member:
                try:
                    member = await ctx.guild.fetch_member(uid)
                except Exception:
                    member = None
            if member and not member.bot:
                req_role_id = entry.get("required_role_id")
                if req_role_id:
                    role = ctx.guild.get_role(req_role_id)
                    if role and role not in member.roles:
                        continue
                valid_entrants.append(uid)

        if not valid_entrants:
            return await ctx.send("No valid entrants available to reroll a new winner from.", ephemeral=True)

        new_winner_id = random.choice(valid_entrants)
        channel = ctx.guild.get_channel(entry["channel_id"])
        if not channel:
            try:
                channel = await ctx.guild.fetch_channel(entry["channel_id"])
            except Exception:
                pass

        if channel:
            await channel.send(content=f"ðŸŽ‰ **GIVEAWAY REROLL!** ðŸŽ‰\nCongratulations <@{new_winner_id}>! You are the new winner of **{entry['prize']}**! ðŸŽŠ (`Giveaway ID: #`{entry['giveaway_id']})")
            await ctx.send(f"Rerolled new winner (<@{new_winner_id}>) for Giveaway `{entry['giveaway_id']}` (`{entry['prize']}`).")
        else:
            await ctx.send("Could not access the original giveaway channel to announce the reroll.", ephemeral=True)

    @greroll.error
    async def greroll_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Manage Server permission to reroll giveaways.", ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage: -greroll <G-849201>", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(GiveawayRerollCommand(bot))

