import discord
from discord.ext import commands
from discord.ui import Container, TextDisplay, Separator
from Commands.Whitelist._storage import is_whitelisted
from Commands.Mute._storage import get_muted_role_id, set_muted_role_id
from Commands.Log._storage import log_event
from Commands._utils import MemberOrIDConverter, format_usage

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
            return await ctx.send("You cannot mute yourself.", ephemeral=True)
        if is_whitelisted(ctx.guild.id, target.id):
            return await ctx.send("This user is on the global moderation whitelist (`Immune to Mute`).", ephemeral=True)
        if target.top_role >= ctx.author.top_role and ctx.author != ctx.guild.owner:
            return await ctx.send("You cannot mute a user with an equal or higher role.", ephemeral=True)

        role = await get_or_create_muted_role(ctx.guild)
        if role in target.roles:
            return await ctx.send("This user is already muted.", ephemeral=True)

        try:
            await target.add_roles(role, reason=f"Muted by {ctx.author} | Reason: {reason}")
        except discord.Forbidden:
            return await ctx.send("I do not have permissions to manage roles or my role is lower than the Muted role.", ephemeral=True)
        except Exception as e:
            return await ctx.send(f"Error assigning muted role: {e}", ephemeral=True)

        from Embeds import get_command_embed
        await log_event(
            ctx.guild,
            "moderation_action",
            "User Muted (`-mute`)",
            f"**Target:** {target.mention} (`{target.id}`)\n**Moderator:** {ctx.author.mention} (`{ctx.author.id}`)\n**Reason:** {reason}\n**Muted Role:** {role.mention}"
        )
        kwargs = get_command_embed(ctx.guild.id, "mute", msg_type="success", target=target, reason=reason, author=ctx.author, role=role)
        await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())

    @mute.error
    async def mute_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Manage Roles permission to mute users.", ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send(format_usage("-mute", "<@member>", "[reason]"), ephemeral=True)
        elif isinstance(error, commands.BadArgument):
            await ctx.send(f"{format_usage('-mute', '<@member>', '[reason]')}", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(MuteCommand(bot))

