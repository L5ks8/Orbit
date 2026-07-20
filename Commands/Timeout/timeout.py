import datetime
import discord
from discord.ext import commands
from discord.ui import Container, TextDisplay, Separator
from Commands.Whitelist._storage import is_whitelisted
from Commands.Log._storage import log_event



class TimeoutCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="timeout", description="Times out a user, preventing text and voice access.")
    @commands.has_permissions(moderate_members=True)
    @commands.bot_has_permissions(moderate_members=True)
    async def timeout(self, ctx: commands.Context, target: discord.Member, minutes: int, *, reason: str = "No reason provided"):
        await ctx.defer()
        if target.id == ctx.author.id:
            return await ctx.send("You cannot time out yourself.", ephemeral=True)
        if is_whitelisted(ctx.guild.id, target.id):
            return await ctx.send("This user is on the global moderation whitelist (`Immune to Timeout`).", ephemeral=True)
        if target.top_role >= ctx.author.top_role and ctx.author != ctx.guild.owner:
            return await ctx.send("You cannot time out a user with equal or higher role.", ephemeral=True)
        if minutes <= 0 or minutes > 40320:
            return await ctx.send("Duration must be between 1 minute and 28 days (40320 minutes).", ephemeral=True)

        try:
            duration = datetime.timedelta(minutes=minutes)
            await target.timeout(duration, reason=f"Timeout by {ctx.author} | Reason: {reason}")
            await log_event(
                ctx.guild,
        "moderation_action",
                "User Timed Out (`-timeout`)",
                f"**Target:** {target.mention} (`{target.id}`)\n**Moderator:** {ctx.author.mention} (`{ctx.author.id}`)\n**Duration:** `{minutes} minutes`\n**Reason:** {reason}"
            )
            from Embeds import get_command_embed
            kwargs = get_command_embed(ctx.guild.id, "timeout", msg_type="timeout", member_mention=target.mention, member_id=target.id, minutes=minutes, reason=reason, author_mention=ctx.author.mention)
            await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())
        except discord.Forbidden:
            await ctx.send("I do not have sufficient permissions to time out this user.", ephemeral=True)
        except Exception as e:
            await ctx.send(f"Error timing out user: {e}", ephemeral=True)

    @timeout.error
    async def timeout_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Moderate Members permission to use timeout.", ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage: -timeout <@user/ID> <minutes> [reason]", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(TimeoutCommand(bot))

