import discord
from discord.ext import commands
from discord.ui import Container, TextDisplay, Separator
from Commands.Whitelist._storage import is_whitelisted
from Commands.Log._storage import log_event
from Commands.Log._modlog_storage import add_modlog
from Commands.Cases._storage import create_case
from Commands._utils import MemberOrIDConverter, format_usage


import typing

class BanCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="ban", description="Bans a member permanently from the server.")
    @commands.has_permissions(ban_members=True)
    @commands.bot_has_permissions(ban_members=True)
    async def ban(self, ctx: commands.Context, target: typing.Union[discord.Member, discord.User], *, reason: str = "No reason provided"):
        await ctx.defer()
        if target.id == ctx.author.id:
            return await ctx.send("You cannot ban yourself.", ephemeral=True)
            
        from Commands._utils import is_immune
        if is_immune(ctx.guild.id, target):
            return await ctx.send("This user is immune to moderation actions.", ephemeral=True)
            
        if is_whitelisted(ctx.guild.id, target.id):
            return await ctx.send("This user is on the global moderation whitelist (`Immune to Ban`).", ephemeral=True)
        if isinstance(target, discord.Member) and target.top_role >= ctx.author.top_role and ctx.author != ctx.guild.owner:
            return await ctx.send("You cannot ban a user with an equal or higher role.", ephemeral=True)

        try:
            ban_entry = await ctx.guild.fetch_ban(target)
            if ban_entry:
                return await ctx.send("This user is already banned.", ephemeral=True)
        except discord.NotFound:
            pass

        try:
            from Commands._utils import send_moderation_dm
            await send_moderation_dm(target, ctx.guild.name, "banned", reason)
            
            await ctx.guild.ban(target, reason=f"Banned by {ctx.author} | Reason: {reason}")
            from Commands.Ban._storage import add_ban_history
            add_ban_history(ctx.guild.id, target.id, reason, ctx.author.id)
            case_id = create_case(ctx.guild.id, target.id, ctx.author.id, "ban", reason)
            add_modlog(ctx.guild.id, target.id, ctx.author.id, "Ban", reason)
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

