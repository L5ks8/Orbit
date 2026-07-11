import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button
from Commands.Warn._storage import add_warning, get_user_warnings
from Commands.Whitelist._storage import is_whitelisted

class WarnIssuedLayout(LayoutView):
    def __init__(self, member: discord.Member, warn_entry: dict, total_warns: int):
        super().__init__()
        header_str = f"### Warning Issued: {member.mention}\n**Warn ID:** `{warn_entry['warn_id']}` | **Total Warnings:** `{total_warns}`"
        info_str = (
            f"**Moderator:** <@{warn_entry['moderator_id']}>\n"
            f"**Reason:** {warn_entry['reason']}\n"
            f"**Date:** <t:{warn_entry['timestamp']}:f> (<t:{warn_entry['timestamp']}:R>)"
        )

        self.container = Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=info_str)
        )
        self.add_item(self.container)

        btn_close = Button(label="Close Notice", style=discord.ButtonStyle.secondary)

        async def _close_cb(interaction: discord.Interaction):
            try:
                await interaction.message.delete()
            except Exception:
                pass

        btn_close.callback = _close_cb
        self.add_item(ActionRow(btn_close))


async def _do_warn_add(ctx: commands.Context, user: discord.Member, reason: str):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)
    if user.id == ctx.author.id:
        return await ctx.send("You cannot warn yourself.", ephemeral=True)
    if is_whitelisted(ctx.guild.id, user.id):
        return await ctx.send("This user is on the global moderation whitelist (`Immune to Warnings`).", ephemeral=True)
    if user.top_role >= ctx.author.top_role and ctx.author != ctx.guild.owner:
        return await ctx.send("You cannot warn a user with an equal or higher role.", ephemeral=True)

    warn_entry = add_warning(ctx.guild.id, user.id, reason, ctx.author.id)
    total_warns = len(get_user_warnings(ctx.guild.id, user.id))

    try:
        await user.send(f"You have received a formal warning in **{ctx.guild.name}**.\n**Warn ID:** `{warn_entry['warn_id']}` | **Reason:** {reason}")
    except Exception:
        pass

    view = WarnIssuedLayout(user, warn_entry, total_warns)
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())


@commands.hybrid_group(name="warn", fallback="add", description="Issues a formal warning or manages server warnings (`-warn @user [reason]`).")
@commands.has_permissions(moderate_members=True)
async def warn_group(ctx: commands.Context, user: discord.Member = None, *, reason: str = "No reason provided."):
    if ctx.invoked_subcommand is None:
        if user is None:
            return await ctx.send("Please specify a member to warn: `-warn @user [reason]` or `/warn <user> [reason]`", ephemeral=True)
        await _do_warn_add(ctx, user, reason)

warn_group.invoke_without_command = True

@warn_group.command(name="add", description="Issues a formal warning to a server member (`/warn add`).")
@commands.has_permissions(moderate_members=True)
async def warn_add_cmd(ctx: commands.Context, user: discord.Member, *, reason: str = "No reason provided."):
    await _do_warn_add(ctx, user, reason)

@warn_group.error
@warn_add_cmd.error
async def warn_group_error(ctx: commands.Context, error):
    if isinstance(error, commands.MissingPermissions):
        await ctx.send("You need Moderate Members permission to issue warnings.", ephemeral=True)
    elif isinstance(error, commands.BadArgument):
        await ctx.send("Could not find that member. Usage: `-warn @user [reason]`", ephemeral=True)
    else:
        pass

async def setup(bot: commands.Bot):
    if "warn" not in bot.all_commands:
        bot.add_command(warn_group)
