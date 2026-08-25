import discord
from discord.ext import commands
from Components.Commands.Whitelist._storage import is_whitelisted
from Components.Systems.Automoderation.log_storage import log_event
from Components.Commands.ModLog._modlog_storage import add_modlog
from Components.Commands.Cases._storage import create_case
from Components.Commands._utils import MemberOrIDConverter, format_usage, make_embed


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
            return await ctx.send(embed=make_embed("You cannot ban yourself.", discord.Color.red()), ephemeral=True)
            
        from Components.Commands._utils import is_immune, make_embed
        if is_immune(ctx.guild.id, target):
            return await ctx.send(embed=make_embed("This user is immune to moderation actions.", discord.Color.red()), ephemeral=True)
            
        if is_whitelisted(ctx.guild.id, target.id):
            return await ctx.send(embed=make_embed("This user is on the global moderation whitelist (`Immune to Ban`).", discord.Color.red()), ephemeral=True)
        if isinstance(target, discord.Member) and target.top_role >= ctx.author.top_role and ctx.author != ctx.guild.owner:
            return await ctx.send(embed=make_embed("You cannot ban a user with an equal or higher role.", discord.Color.red()), ephemeral=True)

        try:
            ban_entry = await ctx.guild.fetch_ban(target)
            if ban_entry:
                return await ctx.send(embed=make_embed("This user is already banned.", discord.Color.red()), ephemeral=True)
        except discord.NotFound:
            pass

        try:
            from Components.Commands._utils import send_moderation_dm, make_embed
            await send_moderation_dm(target, ctx.guild.name, "banned", reason, guild_id=ctx.guild.id)
            
            await ctx.guild.ban(target, reason=f"Banned by {ctx.author} | Reason: {reason}")
            from Components.Commands.Ban._storage import add_ban_history
            add_ban_history(ctx.guild.id, target.id, reason, ctx.author.id)
            case_id = create_case(ctx.guild.id, target.id, ctx.author.id, "ban", reason)
            add_modlog(ctx.guild.id, target.id, ctx.author.id, "Ban", reason)

            await log_event(
                ctx.guild,
                "moderation_action",
                "User Banned (`-ban`)",
                f"**Target:** {target.mention} (`{target.id}`)\n**Moderator:** {ctx.author.mention} (`{ctx.author.id}`)\n**Reason:** {reason}"
            )
            
            embed = discord.Embed(title="User Banned", color=discord.Color.red())
            embed.add_field(name="Target", value=f"{target.mention} (`{target.id}`)", inline=False)
            embed.add_field(name="Reason", value=reason, inline=False)
            embed.add_field(name="Moderator", value=ctx.author.mention, inline=False)
            await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())
        except discord.Forbidden:
            await ctx.send(embed=make_embed("I do not have sufficient permissions to ban this user.", discord.Color.red()), ephemeral=True)
        except Exception as e:
            await ctx.send(embed=make_embed(f"Error banning user: {e}", discord.Color.red()), ephemeral=True)

    @ban.error
    async def ban_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send(embed=make_embed("You do not have permission to ban members.", discord.Color.red()), ephemeral=True)
        elif isinstance(error, commands.BotMissingPermissions):
            await ctx.send(embed=make_embed("I am missing the Ban Members permission.", discord.Color.red()), ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send(embed=make_embed(format_usage("-ban", "<@member>", "[reason]"), discord.Color.red()), ephemeral=True)
        elif isinstance(error, commands.BadArgument):
            await ctx.send(embed=make_embed(f"{format_usage('-ban','<@member>','[reason]')}"), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(BanCommand(bot))



