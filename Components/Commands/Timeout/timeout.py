import datetime
import discord
from discord.ext import commands
from discord.ui import Container, TextDisplay, Separator
from Components.Commands.Whitelist._storage import is_whitelisted
from Components.Commands.Log._storage import log_event
from Components.Commands.Log._modlog_storage import add_modlog
from Components.Commands.Cases._storage import create_case
from Components.Commands._utils import make_embed



class TimeoutCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="timeout", description="Times out a user, preventing text and voice access.")
    @commands.has_permissions(moderate_members=True)
    @commands.bot_has_permissions(moderate_members=True)
    async def timeout(self, ctx: commands.Context, target: discord.Member, minutes: int, *, reason: str = "No reason provided"):
        await ctx.defer()
        if target.id == ctx.author.id:
            return await ctx.send(embed=make_embed("You cannot time out yourself.", discord.Color.red()), ephemeral=True)
        if is_whitelisted(ctx.guild.id, target.id):
            return await ctx.send(embed=make_embed("This user is on the global moderation whitelist (`Immune to Timeout`).", discord.Color.red()), ephemeral=True)
        if target.top_role >= ctx.author.top_role and ctx.author != ctx.guild.owner:
            return await ctx.send(embed=make_embed("You cannot time out a user with equal or higher role.", discord.Color.red()), ephemeral=True)
        if minutes <= 0 or minutes > 40320:
            return await ctx.send(embed=make_embed("Duration must be between 1 minute and 28 days (40320 minutes).", discord.Color.red()), ephemeral=True)

        try:
            from Components.Commands._utils import send_moderation_dm, make_embed
            await send_moderation_dm(target, ctx.guild.name, "timed out", reason, f"{minutes} minutes", guild_id=ctx.guild.id)

            duration = datetime.timedelta(minutes=minutes)
            await target.timeout(duration, reason=f"Timeout by {ctx.author} | Reason: {reason}")
            case_id = create_case(ctx.guild.id, target.id, ctx.author.id, "timeout", f"{minutes}m - {reason}")
            add_modlog(ctx.guild.id, target.id, ctx.author.id, "Timeout", f"{minutes}m - {reason}")
            await log_event(
                ctx.guild,
        "moderation_action",
                "User Timed Out (`-timeout`)",
                f"**Target:** {target.mention} (`{target.id}`)\n**Moderator:** {ctx.author.mention} (`{ctx.author.id}`)\n**Duration:** `{minutes} minutes`\n**Reason:** {reason}"
            )
            embed = discord.Embed(title="User Timed Out", color=discord.Color.orange())
            embed.add_field(name="Target", value=f"{target.mention} (`{target.id}`)", inline=False)
            embed.add_field(name="Duration", value=f"`{minutes} minutes`", inline=False)
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
    async def timeout_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send(embed=make_embed("You need Moderate Members permission to use timeout.", discord.Color.red()), ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send(embed=make_embed("Usage: -timeout <@user/ID> <minutes> [reason]", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(TimeoutCommand(bot))
