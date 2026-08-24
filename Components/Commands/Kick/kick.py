import discord
from discord.ext import commands
from discord.ui import Container, TextDisplay, Separator
from Components.Commands.Whitelist._storage import is_whitelisted
from Components.Dashboard.Automoderation.log_storage import log_event
from Components.Commands.ModLog._modlog_storage import add_modlog
from Components.Commands.Cases._storage import create_case
from Components.Commands._utils import MemberOrIDConverter, format_usage, make_embed



class KickCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="kick", description="Kicks a user immediately without confirmation using Components V2.")
    @commands.has_permissions(kick_members=True)
    @commands.bot_has_permissions(kick_members=True)
    async def kick(self, ctx: commands.Context, target: discord.Member, *, reason: str = "No reason provided"):
        await ctx.defer()
        if target.id == ctx.author.id:
            return await ctx.send(embed=make_embed("You cannot kick yourself.", discord.Color.red()), ephemeral=True)
            
        from Components.Commands._utils import is_immune, make_embed
        if is_immune(ctx.guild.id, target):
            return await ctx.send(embed=make_embed("This user is immune to moderation actions.", discord.Color.red()), ephemeral=True)
            
        if is_whitelisted(ctx.guild.id, target.id):
            return await ctx.send(embed=make_embed("This user is on the global moderation whitelist (`Immune to Kick`).", discord.Color.red()), ephemeral=True)
        if target.top_role >= ctx.author.top_role and ctx.author != ctx.guild.owner:
            return await ctx.send(embed=make_embed("You cannot kick a user with an equal or higher role.", discord.Color.red()), ephemeral=True)

        try:
            from Components.Commands._utils import send_moderation_dm, make_embed
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
            await ctx.send(embed=make_embed("I do not have sufficient permissions to kick this user.", discord.Color.red()), ephemeral=True)
        except Exception as e:
            await ctx.send(embed=make_embed(f"Error kicking user: {e}", discord.Color.red()), ephemeral=True)

    @kick.error
    async def kick_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send(embed=make_embed("You do not have permission to kick members.", discord.Color.red()), ephemeral=True)
        elif isinstance(error, commands.BotMissingPermissions):
            await ctx.send(embed=make_embed("I am missing the Kick Members permission.", discord.Color.red()), ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send(embed=make_embed(format_usage("-kick", "<@member>", "[reason]"), discord.Color.red()), ephemeral=True)
        elif isinstance(error, commands.BadArgument):
            await ctx.send(embed=make_embed(f"{format_usage('-kick','<@member>','[reason]')}"), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(KickCommand(bot))



