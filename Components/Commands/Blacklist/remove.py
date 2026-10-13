import re
import discord
from discord.ext import commands
from discord import app_commands
from Components.Commands.Blacklist._storage import remove_from_blacklist
from Components.Systems.Automoderation.log_storage import log_event
from Components.Commands._utils import make_embed, make_v2_card, ORBIT_COLOR, InteractionContext
from Components.emojis import Emojis

async def _do_bl_remove(ctx: commands.Context, target_id_str: str = None):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send(embed=make_embed("This command can only be used inside a server.", discord.Color.red()), ephemeral=True)
    if not target_id_str:
        return await ctx.send(embed=make_embed("Please provide a user ID to remove (`/unblacklist <id>`).", discord.Color.red()), ephemeral=True)

    clean_id_str = re.sub(r"\D", "", str(target_id_str))
    if not clean_id_str:
        return await ctx.send(embed=make_embed("Please provide a valid numeric ID to remove.", discord.Color.red()), ephemeral=True)
    user_id = int(clean_id_str)

    success = remove_from_blacklist(ctx.guild.id, user_id)
    if not success:
        return await ctx.send(embed=make_embed(f"ID `{user_id}` is not currently on the server command blacklist.", discord.Color.red()), ephemeral=True)

    await log_event(
        ctx.guild,
        "moderation_action",
        "User Removed from Blacklist (`/unblacklist`)",
        f"**Target ID:** `{user_id}`\n**Moderator:** {ctx.author.mention} (`{ctx.author.id}`)"
    )
    card = make_v2_card(f"# User Removed from Blacklist\n\nRemoved ID `{user_id}` from the command blacklist.", color=ORBIT_COLOR)
    if card:
        await ctx.send(view=card, ephemeral=True)
    else:
        await ctx.send(embed=make_embed(f"Removed ID `{user_id}` from the command blacklist.", ORBIT_COLOR), ephemeral=True)

class UnblacklistCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(name="unblacklist", description="Remove a user ID from the server command blacklist.")
    @app_commands.describe(target_id="The user ID to remove from blacklist")
    @app_commands.default_permissions(administrator=True)
    async def unblacklist_cmd(self, interaction: discord.Interaction, target_id: str):
        ctx = InteractionContext(interaction)
        await _do_bl_remove(ctx, target_id)

async def setup(bot: commands.Bot):
    await bot.add_cog(UnblacklistCommand(bot))
