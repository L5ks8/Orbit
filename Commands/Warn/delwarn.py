import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button
from Commands.Warn._storage import delete_warning, get_user_warnings
from Commands.Warn._group import warn_group


class DelWarnLayout(LayoutView):
    def __init__(self, member: discord.Member, warn_id: str, remaining: int):
        super().__init__()
        header_str = f"### Warning Deleted\n**Target Member:** {member.mention} (`{member.id}`)"
        content_str = f"**Removed ID:** `{warn_id}`\n\n**Current Remaining Warnings:** `{remaining}`"
        self.container = Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=content_str)
        )
        self.add_item(self.container)
        btn_close = Button(label="Close", style=discord.ButtonStyle.secondary)
        async def _close_cb(interaction: discord.Interaction):
            try:
                await interaction.message.delete()
            except Exception:
                pass
        btn_close.callback = _close_cb
        self.add_item(ActionRow(btn_close))


async def _do_delwarn(ctx: commands.Context, user: discord.Member, warn_id: str):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)
    success = delete_warning(ctx.guild.id, user.id, warn_id)
    if not success:
        return await ctx.send(f"Could not find warning ID `{warn_id}` for **{user.display_name}**.", ephemeral=True)
    remaining = len(get_user_warnings(ctx.guild.id, user.id))
    view = DelWarnLayout(user, warn_id, remaining)
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())


@warn_group.command(name="remove", description="Removes a specific warning from a user by ID.")
@commands.has_permissions(moderate_members=True)
async def warn_remove_cmd(ctx: commands.Context, user: discord.Member, warn_id: str):
    await _do_delwarn(ctx, user, warn_id)


class DelWarnCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="delwarn", aliases=["warnremove", "removewarn"], hidden=True)
    @commands.has_permissions(moderate_members=True)
    async def delwarn_prefix(self, ctx: commands.Context, user: discord.Member, warn_id: str):
        await _do_delwarn(ctx, user, warn_id)

    @warn_remove_cmd.error
    @delwarn_prefix.error
    async def delwarn_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Moderate Members permission to manage warnings.", ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage: `-delwarn @user <warn_id>`", ephemeral=True)
        elif isinstance(error, commands.BadArgument):
            await ctx.send("Could not find that member. Usage: `-delwarn @user <warn_id>`", ephemeral=True)


async def setup(bot: commands.Bot):
    await bot.add_cog(DelWarnCog(bot))
