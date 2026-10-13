import re
import discord
from discord.ext import commands
from Components.Commands.Whitelist._storage import remove_from_whitelist
from Components.Systems.Automoderation.log_storage import log_event
from Components.Commands._utils import make_embed, make_v2_card, ORBIT_COLOR
from Components.emojis import Emojis

async def _do_wl_remove(ctx: commands.Context, target_id_str: str = None):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send(embed=make_embed("This command can only be used inside a server.", discord.Color.red()), ephemeral=True)
    if not target_id_str:
        return await ctx.send(embed=make_embed("Please provide a user ID to remove (`/whitelist remove <id>`).", discord.Color.red()), ephemeral=True)

    clean_id_str = re.sub(r"\D", "", str(target_id_str))
    if not clean_id_str:
        return await ctx.send(embed=make_embed("Please provide a valid numeric ID to remove.", discord.Color.red()), ephemeral=True)
    user_id = int(clean_id_str)

    success = remove_from_whitelist(ctx.guild.id, user_id)
    if not success:
        return await ctx.send(embed=make_embed(f"ID `{user_id}` is not currently on the server moderation whitelist.", discord.Color.red()), ephemeral=True)

    await log_event(
        ctx.guild,
        "moderation_action",
        "User Removed from Whitelist (`/unwhitelist`)",
        f"**Target ID:** `{user_id}`\n**Moderator:** {ctx.author.mention} (`{ctx.author.id}`)"
    )

    v2_body = (
        f"# User Removed from Whitelist\n\n"
        f"**Target ID:** `{user_id}`\n"
        f"**Moderator:** {ctx.author.mention}\n\n"
        f"Removed ID `{user_id}` from the server moderation whitelist."
    )
    card = make_v2_card(v2_body, color=ORBIT_COLOR)
    if card:
        return await ctx.send(view=card, allowed_mentions=discord.AllowedMentions.none())

    embed = discord.Embed(
        title="User Removed from Whitelist",
        description=f"Removed ID `{user_id}` from the server moderation whitelist.",
        color=ORBIT_COLOR
    )
    await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

@commands.hybrid_command(name="unwhitelist", description="Remove a user ID from the server moderation whitelist.")
@commands.has_permissions(administrator=True)
async def unwhitelist_cmd(ctx: commands.Context, target_id: str):
    await _do_wl_remove(ctx, target_id)

async def setup(bot: commands.Bot):
    if "unwhitelist" not in bot.all_commands:
        bot.add_command(unwhitelist_cmd)

