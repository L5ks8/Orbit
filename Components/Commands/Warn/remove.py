import discord
from discord.ext import commands
from discord.ui import Container, TextDisplay, Separator
from Components.Commands.Warn._storage import delete_warning, get_user_warnings
from Components.Systems.Automoderation.log_storage import log_event
from Components.Commands._utils import MemberOrIDConverter, format_usage, make_embed, make_v2_card, ORBIT_COLOR, InteractionContext
from Components.emojis import Emojis


async def _do_delwarn(ctx: commands.Context, user: discord.Member, warn_id: str):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send(embed=make_embed("This command must be run inside a server.", discord.Color.red()), ephemeral=True)
    success = delete_warning(ctx.guild.id, user.id, warn_id)
    if not success:
        return await ctx.send(embed=make_embed(f"Could not find warning ID `{warn_id}` for **{user.display_name}**.", discord.Color.red()), ephemeral=True)
    warns = get_user_warnings(ctx.guild.id, user.id)
    remaining = len(warns)
    try:
        await ctx.message.delete()
    except Exception:
        pass
    await log_event(
        ctx.guild,
        "moderation_action",
        "Warning Deleted (`/delwarn`)",
        f"**Target:** {user.mention} (`{user.id}`)\n**Moderator:** {ctx.author.mention} (`{ctx.author.id}`)\n**Removed Warn ID:** `{warn_id}`\n**Remaining Warnings:** `{remaining}`"
    )

    v2_body = (
        f"# Warning Deleted\n\n"
        f"**Target Member:** {user.mention} (`{user.id}`)\n"
        f"**Removed ID:** `{warn_id}`\n"
        f"**Remaining Warnings:** `{remaining}`"
    )
    card = make_v2_card(v2_body, color=ORBIT_COLOR)
    if card:
        return await ctx.send(view=card, delete_after=5, allowed_mentions=discord.AllowedMentions.none())

    embed = discord.Embed(
        title="Warning Deleted",
        description=f"**Target Member:** {user.mention} (`{user.id}`)",
        color=ORBIT_COLOR
    )
    embed.add_field(name="Removed ID", value=f"`{warn_id}`", inline=True)
    embed.add_field(name="Remaining Warnings", value=f"`{remaining}`", inline=True)
    await ctx.send(embed=embed, delete_after=5, allowed_mentions=discord.AllowedMentions.none())

class DelWarnCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(name="delwarn", description="Remove a specific warning from a member by ID.")
    @app_commands.default_permissions(moderate_members=True)
    @app_commands.checks.has_permissions(moderate_members=True)
    async def delwarn_cmd(self, interaction: discord.Interaction, user: discord.Member, warn_id: str):
        ctx = InteractionContext(interaction)
        await _do_delwarn(ctx, user, warn_id)

    @delwarn_cmd.error
    async def delwarn_error(self, interaction: discord.Interaction, error):
        ctx = InteractionContext(interaction)
        if isinstance(error, (app_commands.MissingPermissions, commands.MissingPermissions)):
            await ctx.send(embed=make_embed("You need Moderate Members permission to manage warnings.", discord.Color.red()), ephemeral=True)
        elif isinstance(error, (commands.MissingRequiredArgument, commands.BadArgument)):
            await ctx.send(embed=make_embed(format_usage("/delwarn", "<@member>", "<warn_id>"), discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(DelWarnCog(bot))

