import discord
from discord.ext import commands
from discord.ui import Container, TextDisplay, Separator
from Commands.Whitelist._storage import is_whitelisted
from Commands.Log._storage import log_event
from Commands.Log._modlog_storage import add_modlog
from Commands.Cases._storage import create_case
from Commands._utils import MemberOrIDConverter, format_usage



class KickCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="kick", description="Kicks a user immediately without confirmation using Components V2.")
    @commands.has_permissions(kick_members=True)
    @commands.bot_has_permissions(kick_members=True)
    async def kick(self, ctx: commands.Context, target: discord.Member, *, reason: str = "No reason provided"):
        await ctx.defer()
        if target.id == ctx.author.id:
            return await ctx.send("You cannot kick yourself.", ephemeral=True)
            
        from Commands._utils import is_immune
        if is_immune(ctx.guild.id, target):
            return await ctx.send("This user is immune to moderation actions.", ephemeral=True)
            
        if is_whitelisted(ctx.guild.id, target.id):
            return await ctx.send("This user is on the global moderation whitelist (`Immune to Kick`).", ephemeral=True)
        if target.top_role >= ctx.author.top_role and ctx.author != ctx.guild.owner:
            return await ctx.send("You cannot kick a user with an equal or higher role.", ephemeral=True)

        try:
            from Commands._utils import send_moderation_dm
            await send_moderation_dm(target, ctx.guild.name, "kicked", reason, guild_id=ctx.guild.id)
            
            await ctx.guild.kick(target, reason=f"Kicked by {ctx.author} | Reason: {reason}")
            case_id = create_case(ctx.guild.id, target.id, ctx.author.id, "kick", reason)
            add_modlog(ctx.guild.id, target.id, ctx.author.id, "Kick", reason)

            await log_event(
                ctx.guild,
                "moderation_action",
                "User Kicked (`-kick`)",
                f"**Target:** {target.mention} (`{target.id}`)\n**Moderator:** {ctx.author.mention} (`{ctx.author.id}`)\n**Reason:** {reason}"
            )
            embed = discord.Embed(title="User Kicked", color=discord.Color.red())
            embed.add_field(name="Target", value=f"{target.mention} (`{target.id}`)", inline=False)
            embed.add_field(name="Reason", value=reason, inline=False)
            embed.add_field(name="Moderator", value=ctx.author.mention, inline=False)
            await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())
        except discord.Forbidden:
            await ctx.send("I do not have sufficient permissions to kick this user.", ephemeral=True)
        except Exception as e:
            await ctx.send(f"Error kicking user: {e}", ephemeral=True)

    @kick.error
    async def kick_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You do not have permission to kick members.", ephemeral=True)
        elif isinstance(error, commands.BotMissingPermissions):
            await ctx.send("I am missing the Kick Members permission.", ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send(format_usage("-kick", "<@member>", "[reason]"), ephemeral=True)
        elif isinstance(error, commands.BadArgument):
            await ctx.send(f"{format_usage('-kick', '<@member>', '[reason]')}", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(KickCommand(bot))

