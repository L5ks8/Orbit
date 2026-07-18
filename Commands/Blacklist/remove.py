import re
import discord
from discord.ext import commands
from Commands.Blacklist._storage import remove_from_blacklist
from Commands.Log._storage import log_event

async def _do_bl_remove(ctx: commands.Context, target_id_str: str = None):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command can only be used inside a server.", ephemeral=True)
    if not target_id_str:
        return await ctx.send("Please provide a user ID to remove (`/blacklist remove <id>` or `-blacklist remove <id>`).", ephemeral=True)

    clean_id_str = re.sub(r"\D", "", str(target_id_str))
    if not clean_id_str:
        return await ctx.send("Please provide a valid numeric ID to remove.", ephemeral=True)
    user_id = int(clean_id_str)

    success = remove_from_blacklist(ctx.guild.id, user_id)
    if not success:
        return await ctx.send(f"ID `{user_id}` is not currently on the server command blacklist.", ephemeral=True)

    await log_event(
        ctx.guild,
        "moderation_action",
        "User Removed from Blacklist (`-unblacklist`)",
        f"**Target ID:** `{user_id}`\n**Moderator:** {ctx.author.mention} (`{ctx.author.id}`)"
    )
    await ctx.send(f"Removed ID `{user_id}` from the command blacklist.", ephemeral=True)

@commands.hybrid_command(name="unblacklist", description="Remove a user ID from the server command blacklist.")
@commands.has_permissions(administrator=True)
async def unblacklist_cmd(ctx: commands.Context, target_id: str):
    await _do_bl_remove(ctx, target_id)

class BlacklistRemoveCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="bl_remove", hidden=True)
    @commands.has_permissions(administrator=True)
    async def bl_remove_prefix(self, ctx: commands.Context, target_id: str = None):
        await _do_bl_remove(ctx, target_id)

async def setup(bot: commands.Bot):
    if "unblacklist" not in bot.all_commands:
        bot.add_command(unblacklist_cmd)
    await bot.add_cog(BlacklistRemoveCog(bot))

