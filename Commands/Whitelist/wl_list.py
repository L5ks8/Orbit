import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Whitelist._storage import load_whitelist
from Commands.Whitelist._group import whitelist_group

class WhitelistListLayout(LayoutView):
    def __init__(self, guild: discord.Guild, bot: commands.Bot, data: dict):
        super().__init__()
        count = len(data)
        if count == 0:
            content_text = "The global whitelist is currently empty for this server."
        else:
            lines = []
            for uid_str, info in list(data.items())[:15]:
                reason = info.get("reason", "Immunity")
                user = guild.get_member(int(uid_str)) or bot.get_user(int(uid_str))
                mention_display = f"<@{uid_str}>" + (f" (`@{user.name}`)" if user and hasattr(user, "name") else "")
                lines.append(f"• {mention_display} (`ID: {uid_str}`) - **Reason:** {reason}")
            content_text = "\n".join(lines)
            if count > 15:
                content_text += f"\n\n*And {count - 15} more whitelisted users...*"

        self.container = Container(
            TextDisplay(content=f"### Global Whitelist Overview ({count} Protected Users)"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=content_text)
        )
        self.add_item(self.container)

async def _do_wl_list(ctx: commands.Context):
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)
    if ctx.author.id != ctx.guild.owner_id:
        return await ctx.send("Only the Server Owner can view the whitelist.", ephemeral=True)
    data = load_whitelist(ctx.guild.id)
    view = WhitelistListLayout(ctx.guild, ctx.bot, data)
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

@whitelist_group.command(name="view", aliases=["list"], description="Lists all whitelisted users on this server.")
async def wl_view_cmd(ctx: commands.Context):
    await _do_wl_list(ctx)

class WhitelistListFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="wl_view", hidden=True)
    async def wl_view_prefix(self, ctx: commands.Context):
        await _do_wl_list(ctx)

async def setup(bot: commands.Bot):
    if "whitelist" not in bot.all_commands:
        bot.add_command(whitelist_group)
    await bot.add_cog(WhitelistListFallback(bot))
