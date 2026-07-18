import re
import discord
from discord.ext import commands
from Commands.Whitelist._storage import add_to_whitelist
from Commands.Log._storage import log_event

async def _do_wl_add(ctx: commands.Context, target_id_str: str = None, reason: str = "No reason provided"):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command can only be used inside a server.", ephemeral=True)
    if not target_id_str:
        return await ctx.send("Please provide a user ID to whitelist (e.g. `/whitelist 123456789` or `-whitelist 123456789`).", ephemeral=True)

    clean_id_str = re.sub(r"\D", "", str(target_id_str))
    if not clean_id_str:
        return await ctx.send("Please provide a valid numeric ID to whitelist.", ephemeral=True)
    user_id = int(clean_id_str)

    success = add_to_whitelist(ctx.guild.id, user_id, reason, ctx.author.id)
    if not success:
        return await ctx.send(f"ID `{user_id}` is already on the server moderation whitelist.", ephemeral=True)

    await log_event(
        ctx.guild,
        "moderation_action",
        "User Whitelisted (`-whitelist add`)",
        f"**Target ID:** `{user_id}`\n**Moderator:** {ctx.author.mention} (`{ctx.author.id}`)\n**Reason:** {reason}"
    )
    await ctx.send(f"Added ID `{user_id}` to the server moderation whitelist.", ephemeral=True)

@commands.hybrid_command(
    name="whitelist",
    description="Add an ID to the server moderation whitelist."
)
@commands.has_permissions(administrator=True)
async def whitelist_cmd(ctx: commands.Context, target_id: str = None, *, reason: str = "No reason provided"):
    await _do_wl_add(ctx, target_id, reason)

class WhitelistCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="wl_add", hidden=True)
    @commands.has_permissions(administrator=True)
    async def wl_add_prefix(self, ctx: commands.Context, target_id: str = None, *, reason: str = "No reason provided"):
        await _do_wl_add(ctx, target_id, reason)

async def setup(bot: commands.Bot):
    if "whitelist" not in bot.all_commands:
        bot.add_command(whitelist_cmd)
    await bot.add_cog(WhitelistCog(bot))

