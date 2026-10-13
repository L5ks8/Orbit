import random
import discord
from discord import app_commands
from discord.ext import commands
from Components.Commands.Giveaway._storage import get_giveaway
from Components.Commands._utils import make_embed, make_v2_card, ORBIT_COLOR, InteractionContext
from Components.emojis import Emojis

class GiveawayRerollCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(name="greroll", description="Rerolls a new winner for an ended giveaway.")
    @app_commands.default_permissions(manage_guild=True)
    @app_commands.checks.has_permissions(manage_guild=True)
    @app_commands.describe(giveaway_id="The unique ID of the ended giveaway (e.g. G-849201 or 849201)")
    async def greroll(self, interaction: discord.Interaction, giveaway_id: str):
        ctx = InteractionContext(interaction)
        await ctx.defer()
        if not ctx.guild:
            return await ctx.send(embed=make_embed("This command must be run inside a server.", discord.Color.red()), ephemeral=True)

        entry = get_giveaway(ctx.guild.id, giveaway_id)
        if not entry:
            return await ctx.send(embed=make_embed(f"Could not find giveaway with ID `{giveaway_id}` on this server.", discord.Color.red()), ephemeral=True)

        if not entry.get("ended"):
            return await ctx.send(embed=make_embed(f"Giveaway `{entry['giveaway_id']}` is currently active. Use `/gend {giveaway_id}` to end it first."), ephemeral=True)

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
            return await ctx.send(embed=make_embed("No valid entrants available to reroll a new winner from."), ephemeral=True)

        new_winner_id = random.choice(valid_entrants)
        picked_winners = [new_winner_id]
        entry["picked_winners"] = picked_winners
        from Components.Commands.Giveaway._storage import update_giveaway_entry
        update_giveaway_entry(ctx.guild.id, entry)

        channel = ctx.guild.get_channel(entry["channel_id"])
        if not channel:
            try:
                channel = await ctx.guild.fetch_channel(entry["channel_id"])
            except Exception:
                pass

        winners_display = f"<@{new_winner_id}>"
        if channel:
            try:
                msg = await channel.fetch_message(entry["message_id"])
                if msg:
                    from Components.Commands.Giveaway.giveaway import update_giveaway_message
                    await update_giveaway_message(msg, ctx.guild.id, entry, ended=True, winners_display=winners_display)
            except Exception:
                pass

            from Components.Commands.Giveaway.giveaway import resolve_color
            color = resolve_color(entry.get("color", 0x5865F2))
            jump_url = msg.jump_url if msg else None
            desc = f"Congratulations <@{new_winner_id}>! You are the new winner of **{entry['prize']}**!"
            if jump_url:
                desc += f"\n\n[Jump to Giveaway]({jump_url})"
            reroll_embed = discord.Embed(
                title="Giveaway Rerolled!",
                description=desc,
                color=color
            )
            reroll_embed.add_field(name="Prize", value=str(entry['prize']), inline=True)
            reroll_embed.add_field(name="New Winner", value=f"<@{new_winner_id}>", inline=True)
            reroll_embed.set_footer(text=f"Giveaway ID: #{entry['giveaway_id']}")
            card = make_v2_card(
                f"# Giveaway Rerolled!\n\n"
                f"{desc}\n\n"
                f"**Prize:** {entry['prize']}\n"
                f"**New Winner:** <@{new_winner_id}>",
                color=color,
                footer=f"Giveaway ID: #{entry['giveaway_id']}"
            )
            if card:
                await channel.send(view=card, allowed_mentions=discord.AllowedMentions(users=True))
            else:
                await channel.send(embed=reroll_embed, allowed_mentions=discord.AllowedMentions(users=True))

            success_card = make_v2_card(f"# Reroll Complete\n\nRerolled new winner (<@{new_winner_id}>) for Giveaway `{entry['giveaway_id']}` (`{entry['prize']}`).", color=ORBIT_COLOR)
            if success_card:
                await ctx.send(view=success_card)
            else:
                await ctx.send(embed=make_embed(f"Rerolled new winner (<@{new_winner_id}>) for Giveaway `{entry['giveaway_id']}` (`{entry['prize']}`).", ORBIT_COLOR))
        else:
            await ctx.send(embed=make_embed("Could not access the original giveaway channel to announce the reroll.", discord.Color.red()), ephemeral=True)

    @greroll.error
    async def greroll_error(self, interaction: discord.Interaction, error):
        ctx = InteractionContext(interaction)
        if isinstance(error, (app_commands.MissingPermissions, commands.MissingPermissions)):
            await ctx.send(embed=make_embed("You need Manage Server permission to reroll giveaways.", discord.Color.red()), ephemeral=True)
        elif isinstance(error, (app_commands.AppCommandError, commands.MissingRequiredArgument)):
            await ctx.send(embed=make_embed("Usage: `/greroll <giveaway_id>`", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(GiveawayRerollCommand(bot))
