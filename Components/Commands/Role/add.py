import discord
from discord.ext import commands
from Components.Commands.Role.role import role_group

async def _do_addrole(ctx: commands.Context, target: discord.Member, role: discord.Role, reason: str):
    await ctx.defer()
    if role >= ctx.guild.me.top_role:
        return await ctx.send(embed=make_embed("I cannot assign that role because it is higher than or equal to my highest role.", discord.Color.red()), ephemeral=True)
    if role >= ctx.author.top_role and ctx.author != ctx.guild.owner:
        return await ctx.send(embed=make_embed("You cannot assign a role higher than or equal to your own top role.", discord.Color.red()), ephemeral=True)
    if role in target.roles:
        return await ctx.send(embed=make_embed("The user already has that role.", discord.Color.red()), ephemeral=True)

    try:
        await target.add_roles(role, reason=f"Role added by {ctx.author} | Reason: {reason}")
        embed = discord.Embed(title="Role Added", color=role.color)
        embed.add_field(name="Target", value=f"{target.mention} (`{target.id}`)", inline=False)
        embed.add_field(name="Role", value=f"{role.mention} (`{role.id}`)", inline=False)
        embed.add_field(name="Reason", value=reason, inline=False)
        embed.add_field(name="Moderator", value=ctx.author.mention, inline=False)
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())
    except discord.Forbidden:
        await ctx.send(embed=make_embed("I do not have sufficient permissions to add that role.", discord.Color.red()), ephemeral=True)
    except Exception as e:
        await ctx.send(embed=make_embed(f"Error adding role: {e}", discord.Color.red()), ephemeral=True)

@role_group.command(name="add", aliases=["addrole"], description="Assign a role to a member.")
@commands.has_permissions(manage_roles=True)
@commands.bot_has_permissions(manage_roles=True)
async def role_add_cmd(ctx: commands.Context, target: discord.Member, role: discord.Role, *, reason: str = "No reason provided"):
    await _do_addrole(ctx, target, role, reason)

class RoleAddCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @role_add_cmd.error
    async def role_add_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send(embed=make_embed("You need Manage Roles permission to assign roles.", discord.Color.red()), ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send(embed=make_embed("Usage: `-role add <@user> <@role> [reason]` or `/role add target:... role:...`", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

class AddRoleFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="rl_add", aliases=["addrole"], hidden=True)
    @commands.has_permissions(manage_roles=True)
    @commands.bot_has_permissions(manage_roles=True)
    async def addrole_prefix(self, ctx: commands.Context, target: discord.Member, role: discord.Role, *, reason: str = "No reason provided"):
        await _do_addrole(ctx, target, role, reason)

async def setup(bot: commands.Bot):
    from Components.Commands.Role.role import role_group
    from Components.Commands._utils import make_embed
    if "role" not in bot.all_commands:
        bot.add_command(role_group)
    await bot.add_cog(RoleAddCog(bot))
    await bot.add_cog(AddRoleFallback(bot))