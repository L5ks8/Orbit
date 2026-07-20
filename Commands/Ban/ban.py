import discord
from discord.ext import commands
from discord.ui import Container, TextDisplay, Separator
from Commands.Whitelist._storage import is_whitelisted
from Commands.Log._storage import log_event
from Commands._utils import MemberOrIDConverter, format_usage



class BanCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="ban", description="Bans a member permanently from the server.")
    @commands.has_permissions(ban_members=True)
    @commands.bot_has_permissions(ban_members=True)
    async def ban(self, ctx: commands.Context, target: discord.Member, *, reason: str = "No reason provided"):
        await ctx.defer()
        if target.id == ctx.author.id:
            return await ctx.send("You cannot ban yourself.", ephemeral=True)
        if is_whitelisted(ctx.guild.id, target.id):
            return await ctx.send("This user is on the global moderation whitelist (`Immune to Ban`).", ephemeral=True)
        if target.top_role >= ctx.author.top_role and ctx.author != ctx.guild.owner:
            return await ctx.send("You cannot ban a user with an equal or higher role.", ephemeral=True)

        try:
            await ctx.guild.ban(target, reason=f"Banned by {ctx.author} | Reason: {reason}")
            from Commands.Ban._storage import add_ban_history
            add_ban_history(ctx.guild.id, target.id, reason, ctx.author.id)
            from Embeds import get_command_embed
            
            await log_event(
                ctx.guild,
                "moderation_action",
                "User Banned (`-ban`)",
                f"**Target:** {target.mention} (`{target.id}`)\n**Moderator:** {ctx.author.mention} (`{ctx.author.id}`)\n**Reason:** {reason}"
            )
            
            kwargs = get_command_embed(ctx.guild.id, "ban", msg_type="success", target=target, reason=reason, author=ctx.author)
            await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())
        except discord.Forbidden:
            await ctx.send("I do not have sufficient permissions to ban this user.", ephemeral=True)
        except Exception as e:
            await ctx.send(f"Error banning user: {e}", ephemeral=True)

    @ban.error
    async def ban_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You do not have permission to ban members.", ephemeral=True)
        elif isinstance(error, commands.BotMissingPermissions):
            await ctx.send("I am missing the Ban Members permission.", ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send(format_usage("-ban", "<@member>", "[reason]"), ephemeral=True)
        elif isinstance(error, commands.BadArgument):
            await ctx.send(f"{format_usage('-ban', '<@member>', '[reason]')}", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(BanCommand(bot))

