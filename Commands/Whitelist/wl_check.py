import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Whitelist._storage import is_whitelisted, load_whitelist
from Commands.Whitelist._group import whitelist_group

class WhitelistCheckLayout(LayoutView):
    def __init__(self, user: discord.Member, whitelisted: bool, reason: str = ""):
        super().__init__()
        status_text = "PROTECTED (Whitelisted)" if whitelisted else "NOT WHITELISTED"
        content = f"**Target:** {user.mention} (`{user.id}`)\n**Status:** `{status_text}`"
        if whitelisted and reason:
            content += f"\n**Reason:** {reason}"

        self.container = Container(
            TextDisplay(content=f"### Whitelist Check Status"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=content)
        )
        self.add_item(self.container)

async def _do_wl_check(ctx: commands.Context, member: discord.Member):
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)
    if ctx.author.id != ctx.guild.owner_id:
        return await ctx.send("Only the Server Owner can check the whitelist status.", ephemeral=True)
    whitelisted = is_whitelisted(ctx.guild.id, member.id)
    reason = ""
    if whitelisted:
        data = load_whitelist(ctx.guild.id)
        reason = data.get(str(member.id), {}).get("reason", "Global Immunity")
    view = WhitelistCheckLayout(member, whitelisted, reason)
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

@whitelist_group.command(name="check", aliases=["status"], description="Checks if a specific user is on the global whitelist.")
async def wl_check_cmd(ctx: commands.Context, member: discord.Member):
    await _do_wl_check(ctx, member)

class WhitelistCheckFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="wl_check", hidden=True)
    async def wl_check_prefix(self, ctx: commands.Context, member: discord.Member):
        await _do_wl_check(ctx, member)

async def setup(bot: commands.Bot):
    if "whitelist" not in bot.all_commands:
        bot.add_command(whitelist_group)
    await bot.add_cog(WhitelistCheckFallback(bot))
