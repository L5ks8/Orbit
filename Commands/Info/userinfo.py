import discord
from discord.ext import commands
from typing import Union

async def _do_user_info(ctx: commands.Context, user: Union[discord.Member, discord.User, None]):
    await ctx.defer()
    target = user or ctx.author

    created_timestamp = int(target.created_at.timestamp())
    
    if isinstance(target, discord.Member):
        joined_timestamp = int(target.joined_at.timestamp()) if target.joined_at else None
        joined_str = f"<t:{joined_timestamp}:F> (<t:{joined_timestamp}:R>)" if joined_timestamp else "`Unknown / Not in guild`"
        
        roles = [r.mention for r in reversed(target.roles) if not r.is_default()]
        roles_display = ", ".join(roles[:10]) if roles else "`No custom roles`"
        if len(roles) > 10:
            roles_display += f" and `{len(roles) - 10}` more..."
            
        key_perms = []
        if target.guild_permissions.administrator: key_perms.append("`Administrator`")
        if target.guild_permissions.manage_guild: key_perms.append("`Manage Server`")
        if target.guild_permissions.manage_roles: key_perms.append("`Manage Roles`")
        if target.guild_permissions.manage_channels: key_perms.append("`Manage Channels`")
        if target.guild_permissions.ban_members: key_perms.append("`Ban Members`")
        if target.guild_permissions.kick_members: key_perms.append("`Kick Members`")
        if target.guild_permissions.moderate_members: key_perms.append("`Timeout Members`")
        
        perms_str = ", ".join(key_perms) if key_perms else "`Standard Member Permissions`"
        top_role = target.top_role.mention if target.top_role else "`None`"
    else:
        joined_str = "`Not in guild`"
        roles = []
        roles_display = "`Not in guild`"
        perms_str = "`Not in guild`"
        top_role = "`Not in guild`"

    bot_badge = " *(Bot)*" if target.bot else ""
    
    embed = discord.Embed(title=f"User Information: {target.display_name}{bot_badge}", color=target.color if target.color != discord.Color.default() else discord.Color.blue())
    embed.set_thumbnail(url=target.display_avatar.url)
    embed.add_field(name="Username", value=f"`{target.name}`", inline=True)
    embed.add_field(name="User ID", value=f"`{target.id}`", inline=True)
    embed.add_field(name="Account Created", value=f"<t:{created_timestamp}:F> (<t:{created_timestamp}:R>)", inline=False)
    embed.add_field(name="Joined Server", value=joined_str, inline=False)
    embed.add_field(name="Top Role", value=top_role, inline=False)
    embed.add_field(name=f"Roles ({len(roles)})", value=roles_display, inline=False)
    embed.add_field(name="Key Permissions", value=perms_str, inline=False)

    await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

class UserInfoCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="userinfo", aliases=["user"], description="Display member statistics and roles.")
    async def userinfo_cmd(self, ctx: commands.Context, user: Union[discord.Member, discord.User] = None):
        await _do_user_info(ctx, user)

    @userinfo_cmd.error
    async def userinfo_error(self, ctx: commands.Context, error):
        from Commands._utils import make_embed
        await ctx.send(embed=make_embed("User not found.", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(UserInfoCommand(bot))
