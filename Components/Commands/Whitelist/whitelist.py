import re
import discord
from discord.ext import commands
from discord import app_commands
from Components.Commands.Whitelist._storage import add_to_whitelist
from Components.Systems.Automoderation.log_storage import log_event
from Components.Commands._utils import make_embed, make_v2_card, ORBIT_COLOR, InteractionContext
from Components.emojis import Emojis

async def _do_wl_add(ctx: commands.Context, target_id_str: str = None, reason: str = "No reason provided"):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send(embed=make_embed("This command can only be used inside a server.", discord.Color.red()), ephemeral=True)
    if not target_id_str:
        return await ctx.send(embed=make_embed("Please provide a user ID to whitelist (e.g. `/whitelist 123456789`).", discord.Color.red()), ephemeral=True)

    clean_id_str = re.sub(r"\D", "", str(target_id_str))
    if not clean_id_str:
        return await ctx.send(embed=make_embed("Please provide a valid numeric ID to whitelist.", discord.Color.red()), ephemeral=True)
    user_id = int(clean_id_str)

    success = add_to_whitelist(ctx.guild.id, user_id, reason, ctx.author.id)
    if not success:
        return await ctx.send(embed=make_embed(f"ID `{user_id}` is already on the server moderation whitelist.", discord.Color.red()), ephemeral=True)

    await log_event(
        ctx.guild,
        "moderation_action",
        "User Whitelisted (`/whitelist`)",
        f"**Target ID:** `{user_id}`\n**Moderator:** {ctx.author.mention} (`{ctx.author.id}`)\n**Reason:** {reason}"
    )

    v2_body = (
        f"# User Whitelisted\n\n"
        f"**Target ID:** `{user_id}`\n"
        f"**Moderator:** {ctx.author.mention}\n"
        f"**Reason:** {reason}"
    )
    card = make_v2_card(v2_body, color=ORBIT_COLOR)
    if card:
        return await ctx.send(view=card, allowed_mentions=discord.AllowedMentions.none())

    embed = discord.Embed(
        title="User Whitelisted",
        description=f"Added ID `{user_id}` to the server moderation whitelist.\n\n**Reason:** {reason}",
        color=ORBIT_COLOR
    )
    await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

class WhitelistCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(name="whitelist", description="Add an ID to the server moderation whitelist.")
    @app_commands.describe(target_id="The user ID to whitelist", reason="Reason for whitelisting")
    @app_commands.default_permissions(administrator=True)
    async def whitelist_cmd(self, interaction: discord.Interaction, target_id: str = None, reason: str = "No reason provided"):
        ctx = InteractionContext(interaction)
        await _do_wl_add(ctx, target_id, reason)

async def setup(bot: commands.Bot):
    await bot.add_cog(WhitelistCommand(bot))
