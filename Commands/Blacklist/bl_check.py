import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Blacklist._storage import load_blacklist
from Commands.Blacklist._group import blacklist_group

class BlacklistCheckLayout(LayoutView):
    def __init__(self, target_id: int, target_mention: str, entry: dict | None):
        super().__init__()
        if entry:
            reason = entry.get("reason", "No reason provided")
            added_by = entry.get("added_by", "Unknown")
            self.container = Container(
                TextDisplay(content=f"### Blacklist status: Blacklisted\n**User:** {target_mention} (`{target_id}`)"),
                Separator(spacing=discord.SeparatorSpacing.small),
                TextDisplay(content=f"**Reason:** {reason}\n**Added by:** <@{added_by}> (`{added_by}`)")
            )
        else:
            self.container = Container(
                TextDisplay(content=f"### Blacklist status: Not Blacklisted\n**User:** {target_mention} (`{target_id}`) is free to use commands.")
            )
        self.add_item(self.container)

async def _do_bl_check(ctx: commands.Context, user_input: str):
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)

    try:
        target_id = int(user_input.strip("<@!>"))
        mention = f"<@{target_id}>"
    except ValueError:
        return await ctx.send("Please provide a valid numeric User ID or mention.", ephemeral=True)

    data = load_blacklist(ctx.guild.id)
    entry = data.get(str(target_id))

    view = BlacklistCheckLayout(target_id, mention, entry)
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

@blacklist_group.command(name="check", description="Checks if a specific user is currently on the server blacklist.")
@commands.has_permissions(administrator=True)
async def bl_check_cmd(ctx: commands.Context, user_input: str):
    await _do_bl_check(ctx, user_input)

class BlacklistCheckFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="bl_check", hidden=True)
    @commands.has_permissions(administrator=True)
    async def bl_check_prefix(self, ctx: commands.Context, user_input: str):
        await _do_bl_check(ctx, user_input)

async def setup(bot: commands.Bot):
    if "blacklist" not in bot.all_commands:
        bot.add_command(blacklist_group)
    await bot.add_cog(BlacklistCheckFallback(bot))
