import datetime
import discord
from discord import app_commands
from discord.ext import commands
from discord.ui import Container, TextDisplay, Separator
from Components.Commands.Whitelist._storage import is_whitelisted
from Components.Systems.Automoderation.log_storage import log_event
from Components.Commands.ModLog._modlog_storage import add_modlog
from Components.Commands.Cases._storage import create_case
from Components.Commands._utils import make_embed, make_v2_card, ORBIT_COLOR, InteractionContext, parse_duration, format_duration
from Components.emojis import Emojis


class TimeoutCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(name="timeout", description="Times out a user, preventing text and voice access.")
    @app_commands.describe(
        target="The member to time out",
        duration="Duration format (e.g. 10m, 1h, 1d, 7d). Max 28 days. Default: 10m",
        reason="Reason for the timeout"
    )
    @app_commands.default_permissions(moderate_members=True)
    @app_commands.checks.has_permissions(moderate_members=True)
    @app_commands.checks.bot_has_permissions(moderate_members=True)
    async def timeout(self, interaction: discord.Interaction, target: discord.Member, duration: str = "10m", *, reason: str = "No reason provided"):
        ctx = InteractionContext(interaction)
        await ctx.defer()
        if target.id == ctx.author.id:
            return await ctx.send(embed=make_embed("You cannot time out yourself.", discord.Color.red()), ephemeral=True)
        from Components.Commands._utils import is_immune
        if is_immune(ctx.guild.id, target) or is_whitelisted(ctx.guild.id, target.id):
            return await ctx.send(embed=make_embed("This user is on the global moderation whitelist (`Immune to Timeout`).", discord.Color.red()), ephemeral=True)
        if target.top_role >= ctx.author.top_role and ctx.author != ctx.guild.owner:
            return await ctx.send(embed=make_embed("You cannot time out a user with equal or higher role.", discord.Color.red()), ephemeral=True)
        
        seconds = parse_duration(duration, default_unit="m")
        if seconds is None or seconds < 10 or seconds > 2419200:
            return await ctx.send(embed=make_embed("Duration must be between 10 seconds and 28 days (e.g. `10m`, `1h`, `1d`, `7d`).", discord.Color.red()), ephemeral=True)

        readable_duration = format_duration(seconds)

        try:
            from Components.Commands._utils import send_moderation_dm
            await send_moderation_dm(target, ctx.guild.name, "timed out", reason, readable_duration, guild_id=ctx.guild.id)

            delta = datetime.timedelta(seconds=seconds)
            await target.timeout(delta, reason=f"Timeout by {ctx.author} | Reason: {reason}")
            case_id = create_case(ctx.guild.id, target.id, ctx.author.id, "timeout", f"{readable_duration} - {reason}")
            add_modlog(ctx.guild.id, target.id, ctx.author.id, "Timeout", f"{readable_duration} - {reason}")
            await log_event(
                ctx.guild,
                "moderation_action",
                "User Timed Out (`/timeout`)",
                f"**Target:** {target.mention} (`{target.id}`)\n**Moderator:** {ctx.author.mention} (`{ctx.author.id}`)\n**Duration:** `{readable_duration}`\n**Reason:** {reason}"
            )
            v2_body = (
                f"# User Timed Out\n\n"
                f"**Target:** {target.mention} (`{target.id}`)\n"
                f"**Duration:** `{readable_duration}`\n"
                f"**Moderator:** {ctx.author.mention}\n"
                f"**Status:** `Active (Cannot send messages or join VC)`"
            )
            if reason and reason != "No reason provided":
                v2_body += f"\n**Reason:** {reason}"
            card = make_v2_card(v2_body, color=ORBIT_COLOR)
            if card:
                return await ctx.send(view=card, allowed_mentions=discord.AllowedMentions.none())

            embed = discord.Embed(title="User Timed Out", color=ORBIT_COLOR)
            embed.add_field(name="Target", value=f"{target.mention} (`{target.id}`)", inline=False)
            embed.add_field(name="Duration", value=f"`{readable_duration}`", inline=False)
            if reason and reason != "No reason provided":
                embed.add_field(name="Reason", value=reason, inline=False)
            embed.add_field(name="Moderator", value=ctx.author.mention, inline=False)
            embed.add_field(name="Status", value="`Active (Cannot send messages or join VC)`", inline=False)
            await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())
        except discord.Forbidden:
            await ctx.send(embed=make_embed("I do not have sufficient permissions to time out this user.", discord.Color.red()), ephemeral=True)
        except Exception as e:
            await ctx.send(embed=make_embed(f"Error timing out user: {e}", discord.Color.red()), ephemeral=True)

    @timeout.error
    async def timeout_error(self, interaction: discord.Interaction, error):
        ctx = InteractionContext(interaction)
        if isinstance(error, (app_commands.MissingPermissions, commands.MissingPermissions)):
            await ctx.send(embed=make_embed("You need Moderate Members permission to use timeout.", discord.Color.red()), ephemeral=True)
        elif isinstance(error, (commands.MissingRequiredArgument, commands.BadArgument, app_commands.CommandSignatureMismatch)):
            await ctx.send(embed=make_embed("Usage: `/timeout <target> [duration] [reason]` (e.g. `10m`, `1h`, `1d`)", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(TimeoutCommand(bot))

