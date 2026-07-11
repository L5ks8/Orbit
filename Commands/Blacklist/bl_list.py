import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Blacklist._storage import load_blacklist
from Commands.Blacklist._group import blacklist_group

class BlacklistListLayout(LayoutView):
    def __init__(self, guild: discord.Guild, bot: commands.Bot, data: dict):
        super().__init__()
        count = len(data)
        if count == 0:
            content_text = "The blacklist is currently empty for this server."
        else:
            lines = []
            for uid_str, info in list(data.items())[:15]:
                reason = info.get("reason", "No reason")
                user = guild.get_member(int(uid_str)) or bot.get_user(int(uid_str))
                mention_display = f"<@{uid_str}>" + (f" (`@{user.name}`)" if user and hasattr(user, "name") else "")
                lines.append(f"• {mention_display} (`ID: {uid_str}`) - **Reason:** {reason}")
            content_text = "\n".join(lines)
            if count > 15:
                content_text += f"\n\n*And {count - 15} more users...*"

        self.container = Container(
            TextDisplay(content=f"### Blacklist Overview ({count} Users)"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=content_text)
        )
        self.add_item(self.container)

async def _do_bl_list(ctx: commands.Context):
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)
    data = load_blacklist(ctx.guild.id)
    view = BlacklistListLayout(ctx.guild, ctx.bot, data)
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

@blacklist_group.command(name="view", aliases=["list"], description="Lists all blacklisted users on this server.")
@commands.has_permissions(administrator=True)
async def bl_view_cmd(ctx: commands.Context):
    await _do_bl_list(ctx)

class BlacklistListFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="bl_list", hidden=True)
    @commands.has_permissions(administrator=True)
    async def bl_list_prefix(self, ctx: commands.Context):
        await _do_bl_list(ctx)

async def setup(bot: commands.Bot):
    if "blacklist" not in bot.all_commands:
        bot.add_command(blacklist_group)
    await bot.add_cog(BlacklistListFallback(bot))
