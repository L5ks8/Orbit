import discord
from discord.ext import commands
from discord import app_commands
from Commands.Whitelist._storage import is_whitelisted
from Commands.Log._storage import log_event
from Commands.Log._modlog_storage import add_modlog
from Commands._utils import MemberOrIDConverter, format_usage
import typing

class SoftbanCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="softban", description="Softbans a member (bans and immediately unbans) to delete their recent messages.")
    @commands.has_permissions(ban_members=True)
    @commands.bot_has_permissions(ban_members=True)
    @app_commands.describe(
        target="The member to softban",
        reason="Reason for the softban"
    )
    async def softban(self, ctx: commands.Context, target: typing.Union[discord.Member, discord.User], *, reason: str = "No reason provided"):
        await ctx.defer()
        if target.id == ctx.author.id:
            return await ctx.send("You cannot softban yourself.", ephemeral=True)
        if is_whitelisted(ctx.guild.id, target.id):
            return await ctx.send("This user is on the global moderation whitelist (`Immune to Softban`).", ephemeral=True)
        if isinstance(target, discord.Member) and target.top_role >= ctx.author.top_role and ctx.author != ctx.guild.owner:
            return await ctx.send("You cannot softban a user with an equal or higher role.", ephemeral=True)

        try:
            # Delete messages from the last 7 days (7 * 24 * 60 * 60 = 604800 seconds)
            await ctx.guild.ban(target, reason=f"Softbanned by {ctx.author} | Reason: {reason}", delete_message_seconds=604800)
            await ctx.guild.unban(target, reason="Softban (automatic unban)")
            
            from Commands.Ban._storage import add_ban_history
            add_ban_history(ctx.guild.id, target.id, f"[SOFTBAN] {reason}", ctx.author.id)
            add_modlog(ctx.guild.id, target.id, ctx.author.id, "Softban", reason)
            
            await log_event(
                ctx.guild,
                "moderation_action",
                "User Softbanned (`-softban`)",
                f"**Target:** {target.mention} (`{target.id}`)\n**Moderator:** {ctx.author.mention} (`{ctx.author.id}`)\n**Reason:** {reason}"
            )
            
            embed = discord.Embed(
                title="🔨 User Softbanned",
                description=f"✅ **{target.mention}** has been softbanned.\n*Their messages from the last 7 days have been wiped, and they can rejoin the server.*",
                color=discord.Color.orange()
            )
            embed.add_field(name="Reason", value=reason, inline=False)
            await ctx.send(embed=embed)

        except discord.Forbidden:
            await ctx.send("I do not have sufficient permissions to softban this user.", ephemeral=True)
        except Exception as e:
            await ctx.send(f"Error softbanning user: {e}", ephemeral=True)

    @softban.error
    async def softban_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You do not have permission to ban members.", ephemeral=True)
        elif isinstance(error, commands.BotMissingPermissions):
            await ctx.send("I am missing the Ban Members permission.", ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send(format_usage("-softban", "<@member>", "[reason]"), ephemeral=True)
        elif isinstance(error, commands.BadArgument):
            await ctx.send(format_usage("-softban", "<@member>", "[reason]"), ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(SoftbanCommand(bot))
