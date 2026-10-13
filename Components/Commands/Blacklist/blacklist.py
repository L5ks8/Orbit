import re
import discord
from discord.ext import commands
from discord import app_commands
from Components.Commands.Blacklist._storage import add_to_blacklist
from Components.Commands.Whitelist._storage import is_whitelisted
from Components.Systems.Automoderation.log_storage import log_event
from Components.Commands._utils import make_embed, make_v2_card, ORBIT_COLOR, InteractionContext
from Components.emojis import Emojis

async def _do_bl_add(ctx: commands.Context, target_id_str: str = None, reason: str = "No reason provided"):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send(embed=make_embed("This command can only be used inside a server.", discord.Color.red()), ephemeral=True)
    if not target_id_str:
        return await ctx.send(embed=make_embed("Please provide a user ID to blacklist (e.g. `/blacklist 123456789`).", discord.Color.red()), ephemeral=True)

    clean_id_str = re.sub(r"\D", "", str(target_id_str))
    if not clean_id_str:
        return await ctx.send(embed=make_embed("Please provide a valid numeric ID to blacklist.", discord.Color.red()), ephemeral=True)
    user_id = int(clean_id_str)

    if is_whitelisted(ctx.guild.id, user_id):
        return await ctx.send(embed=make_embed("This user is on the global moderation whitelist (`Immune to Blacklist`).", discord.Color.red()), ephemeral=True)

    success = add_to_blacklist(ctx.guild.id, user_id, reason, ctx.author.id)
    if not success:
        return await ctx.send(embed=make_embed(f"ID `{user_id}` is already on the blacklist.", discord.Color.red()), ephemeral=True)

    member = ctx.guild.get_member(user_id)
    ban_msg = ""
    if member and not member.bot:
        try:
            await member.ban(reason=f"Blacklisted by {ctx.author} | Reason: {reason}")
            ban_msg = "\n*User was present on the server and has been automatically banned.*"
        except Exception:
            pass

    await log_event(
        ctx.guild,
        "moderation_action",
        "User Blacklisted (`/blacklist`)",
        f"**Target ID:** `{user_id}`\n**Moderator:** {ctx.author.mention} (`{ctx.author.id}`)\n**Reason:** {reason}{ban_msg}"
    )
    card = make_v2_card(f"# User Blacklisted\n\nAdded ID `{user_id}` to the blacklist.{ban_msg}", color=ORBIT_COLOR)
    if card:
        await ctx.send(view=card, ephemeral=True)
    else:
        await ctx.send(embed=make_embed(f"Added ID `{user_id}` to the blacklist.{ban_msg}", ORBIT_COLOR), ephemeral=True)

class BlacklistCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(name="blacklist", description="Add an ID to the server command blacklist.")
    @app_commands.describe(target_id="The user ID to blacklist", reason="Reason for the blacklist")
    @app_commands.default_permissions(administrator=True)
    async def blacklist_cmd(self, interaction: discord.Interaction, target_id: str = None, reason: str = "No reason provided"):
        ctx = InteractionContext(interaction)
        await _do_bl_add(ctx, target_id, reason)

async def setup(bot: commands.Bot):
    await bot.add_cog(BlacklistCommand(bot))
