import re
import discord
from discord.ext import commands
from Commands.Blacklist._storage import add_to_blacklist
from Commands.Whitelist._storage import is_whitelisted
from Commands.Log._storage import log_event

async def _do_bl_add(ctx: commands.Context, target_id_str: str = None, reason: str = "No reason provided"):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command can only be used inside a server.", ephemeral=True)
    if not target_id_str:
        return await ctx.send("Please provide a user ID to blacklist (e.g. `/blacklist 123456789` or `-blacklist 123456789`).", ephemeral=True)

    clean_id_str = re.sub(r"\D", "", str(target_id_str))
    if not clean_id_str:
        return await ctx.send("Please provide a valid numeric ID to blacklist.", ephemeral=True)
    user_id = int(clean_id_str)

    if is_whitelisted(ctx.guild.id, user_id):
        return await ctx.send("This user is on the global moderation whitelist (`Immune to Blacklist`).", ephemeral=True)

    success = add_to_blacklist(ctx.guild.id, user_id, reason, ctx.author.id)
    if not success:
        return await ctx.send(f"ID `{user_id}` is already on the command blacklist.", ephemeral=True)

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
        "moderation",
        "User Blacklisted (`-blacklist add`)",
        f"**Target ID:** `{user_id}`\n**Moderator:** {ctx.author.mention} (`{ctx.author.id}`)\n**Reason:** {reason}{ban_msg}"
    )
    await ctx.send(f"Added ID `{user_id}` to the command blacklist.{ban_msg}", ephemeral=True)

@commands.hybrid_group(
    name="blacklist",
    fallback="add",
    description="Add an ID to the command blacklist (`/blacklist <id>`), or manage (`remove`, `view`)."
)
@commands.has_permissions(administrator=True)
async def blacklist_group(ctx: commands.Context, target_id: str = None, *, reason: str = "No reason provided"):
    if ctx.invoked_subcommand is None:
        await _do_bl_add(ctx, target_id, reason)

class BlacklistCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="bl_add", hidden=True)
    @commands.has_permissions(administrator=True)
    async def bl_add_prefix(self, ctx: commands.Context, target_id: str = None, *, reason: str = "No reason provided"):
        await _do_bl_add(ctx, target_id, reason)

async def setup(bot: commands.Bot):
    if "blacklist" not in bot.all_commands:
        bot.add_command(blacklist_group)
    await bot.add_cog(BlacklistCog(bot))
