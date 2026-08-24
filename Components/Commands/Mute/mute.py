import discord
from discord.ext import commands
from discord.ui import Container, TextDisplay, Separator
from Components.Commands.Whitelist._storage import is_whitelisted
from Components.Commands.Mute._storage import get_muted_role_id, set_muted_role_id
from Components.Dashboard.Automoderation.log_storage import log_event
from Components.Commands.ModLog._modlog_storage import add_modlog
from Components.Commands._utils import MemberOrIDConverter, format_usage, make_embed

async def get_or_create_muted_role(guild: discord.Guild) -> discord.Role:
    stored_id = get_muted_role_id(guild.id)
    if stored_id:
        role = guild.get_role(stored_id)
        if role:
            return role

    role = discord.utils.get(guild.roles, name="Muted")
    if not role:
        permissions = discord.Permissions(
            send_messages=False,
            send_messages_in_threads=False,
            create_public_threads=False,
            create_private_threads=False,
            add_reactions=False,
            speak=False,
            stream=False
        )
        role = await guild.create_role(name="Muted", permissions=permissions, reason="Orbit Mute Role")

    set_muted_role_id(guild.id, role.id)
    return role

class MuteCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="mute", description="Mutes a user.")
    @commands.has_permissions(manage_roles=True)
    @commands.bot_has_permissions(manage_roles=True)
    async def mute(self, ctx: commands.Context, target: discord.Member, *, reason: str = "No reason provided"):
        await ctx.defer()
        if target.id == ctx.author.id:
            return await ctx.send(embed=make_embed("You cannot mute yourself.", discord.Color.red()), ephemeral=True)
        if is_whitelisted(ctx.guild.id, target.id):
            return await ctx.send(embed=make_embed("This user is on the global moderation whitelist (`Immune to Mute`).", discord.Color.red()), ephemeral=True)
        if target.top_role >= ctx.author.top_role and ctx.author != ctx.guild.owner:
            return await ctx.send(embed=make_embed("You cannot mute a user with an equal or higher role.", discord.Color.red()), ephemeral=True)

        role = await get_or_create_muted_role(ctx.guild)
        if role in target.roles:
            return await ctx.send(embed=make_embed("This user is already muted.", discord.Color.red()), ephemeral=True)

        try:
            from Components.Commands._utils import send_moderation_dm
            await send_moderation_dm(target, ctx.guild.name, "muted", reason, guild_id=ctx.guild.id)

            await target.add_roles(role, reason=f"Muted by {ctx.author} | Reason: {reason}")
            add_modlog(ctx.guild.id, target.id, ctx.author.id, "Mute", reason)
        except discord.Forbidden:
            return await ctx.send(embed=make_embed("I do not have permissions to manage roles or my role is lower than the Muted role.", discord.Color.red()), ephemeral=True)
        except Exception as e:
            return await ctx.send(embed=make_embed(f"Error assigning muted role: {e}", discord.Color.red()), ephemeral=True)


        await log_event(
            ctx.guild,
            "moderation_action",
            "User Muted (`-mute`)",
            f"**Target:** {target.mention} (`{target.id}`)\n**Moderator:** {ctx.author.mention} (`{ctx.author.id}`)\n**Reason:** {reason}\n**Muted Role:** {role.mention}"
        )
        embed = discord.Embed(title="User Muted", color=discord.Color.red())
        embed.add_field(name="Target", value=f"{target.mention} (`{target.id}`)", inline=False)
        embed.add_field(name="Reason", value=reason, inline=False)
        embed.add_field(name="Moderator", value=ctx.author.mention, inline=False)
        if role:
            embed.add_field(name="Role Assigned", value=role.mention, inline=False)
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

    @mute.error
    async def mute_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send(embed=make_embed("You need Manage Roles permission to mute users.", discord.Color.red()), ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send(embed=make_embed(format_usage("-mute", "<@member>", "[reason]"), discord.Color.red()), ephemeral=True)
        elif isinstance(error, commands.BadArgument):
            await ctx.send(embed=make_embed(f"{format_usage('-mute','<@member>','[reason]')}"), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(MuteCommand(bot))



