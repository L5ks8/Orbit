import discord
from discord.ext import commands
from Commands.Role.role import role_group

async def _do_removerole(ctx: commands.Context, target: discord.Member, role: discord.Role, reason: str):
    await ctx.defer()
    if role >= ctx.guild.me.top_role:
        return await ctx.send(embed=make_embed("I cannot remove that role because it is higher than or equal to my highest role.", discord.Color.red()), ephemeral=True)
    if role >= ctx.author.top_role and ctx.author != ctx.guild.owner:
        return await ctx.send(embed=make_embed("You cannot remove a role higher than or equal to your own top role.", discord.Color.red()), ephemeral=True)
    if role not in target.roles:
        return await ctx.send(embed=make_embed("The user does not currently have that role.", discord.Color.red()), ephemeral=True)

    try:
        await target.remove_roles(role, reason=f"Role removed by {ctx.author} | Reason: {reason}")
        embed = discord.Embed(title="Role Removed", color=role.color)
        embed.add_field(name="Target", value=f"{target.mention} (`{target.id}`)", inline=False)
        embed.add_field(name="Role", value=f"{role.mention} (`{role.id}`)", inline=False)
        embed.add_field(name="Reason", value=reason, inline=False)
        embed.add_field(name="Moderator", value=ctx.author.mention, inline=False)
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())
    except discord.Forbidden:
        await ctx.send(embed=make_embed("I do not have sufficient permissions to remove that role.", discord.Color.red()), ephemeral=True)
    except Exception as e:
        await ctx.send(embed=make_embed(f"Error removing role: {e}", discord.Color.red()), ephemeral=True)

@role_group.command(name="remove", aliases=["removerole"], description="Remove a role from a member.")
@commands.has_permissions(manage_roles=True)
@commands.bot_has_permissions(manage_roles=True)
async def role_remove_cmd(ctx: commands.Context, target: discord.Member, role: discord.Role, *, reason: str = "No reason provided"):
    await _do_removerole(ctx, target, role, reason)

class RoleRemoveCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @role_remove_cmd.error
    async def role_remove_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send(embed=make_embed("You need Manage Roles permission to remove roles.", discord.Color.red()), ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send(embed=make_embed("Usage: `-role remove <@user> <@role> [reason]`", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

class RemoveRoleFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="rl_remove", aliases=["removerole"], hidden=True)
    @commands.has_permissions(manage_roles=True)
    @commands.bot_has_permissions(manage_roles=True)
    async def removerole_prefix(self, ctx: commands.Context, target: discord.Member, role: discord.Role, *, reason: str = "No reason provided"):
        await _do_removerole(ctx, target, role, reason)

async def setup(bot: commands.Bot):
    from Commands.Role.role import role_group
from Commands._utils import make_embed
    if "role" not in bot.all_commands:
        bot.add_command(role_group)
    await bot.add_cog(RoleRemoveCog(bot))
    await bot.add_cog(RemoveRoleFallback(bot))