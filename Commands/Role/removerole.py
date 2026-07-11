import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Role._group import role_group

class RemoveRoleSuccessLayout(LayoutView):
    def __init__(self, target: discord.Member, role: discord.Role, reason: str, author: discord.Member):
        super().__init__()
        self.container = Container(
            TextDisplay(content=f"### Role Removed\n**Target:** {target.mention} (`{target.id}`)"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Role:** {role.mention} (`{role.id}`)\n**Reason:** {reason}\n**Moderator:** {author.mention}")
        )
        self.add_item(self.container)

async def _do_removerole(ctx: commands.Context, target: discord.Member, role: discord.Role, reason: str):
    await ctx.defer()
    if role >= ctx.guild.me.top_role:
        return await ctx.send("I cannot remove that role because it is higher than or equal to my highest role.", ephemeral=True)
    if role >= ctx.author.top_role and ctx.author != ctx.guild.owner:
        return await ctx.send("You cannot remove a role higher than or equal to your own top role.", ephemeral=True)
    if role not in target.roles:
        return await ctx.send("The user does not currently have that role.", ephemeral=True)

    try:
        await target.remove_roles(role, reason=f"Role removed by {ctx.author} | Reason: {reason}")
        view = RemoveRoleSuccessLayout(target, role, reason, ctx.author)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())
    except discord.Forbidden:
        await ctx.send("I do not have sufficient permissions to remove that role.", ephemeral=True)
    except Exception as e:
        await ctx.send(f"Error removing role: {e}", ephemeral=True)

@role_group.command(name="remove", aliases=["removerole"], description="Removes a role from a server member.")
@commands.has_permissions(manage_roles=True)
@commands.bot_has_permissions(manage_roles=True)
async def role_remove_cmd(ctx: commands.Context, target: discord.Member, role: discord.Role, *, reason: str = "No reason provided"):
    await _do_removerole(ctx, target, role, reason)

@role_remove_cmd.error
async def role_remove_error(ctx: commands.Context, error):
    if isinstance(error, commands.MissingPermissions):
        await ctx.send("You need Manage Roles permission to remove roles.", ephemeral=True)
    elif isinstance(error, commands.MissingRequiredArgument):
        await ctx.send("Usage: `-role remove <@user> <@role> [reason]`", ephemeral=True)
    else:
        await ctx.send(f"An error occurred: {error}", ephemeral=True)

class RemoveRoleFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="removerole", hidden=True)
    @commands.has_permissions(manage_roles=True)
    @commands.bot_has_permissions(manage_roles=True)
    async def removerole_prefix(self, ctx: commands.Context, target: discord.Member, role: discord.Role, *, reason: str = "No reason provided"):
        await _do_removerole(ctx, target, role, reason)

async def setup(bot: commands.Bot):
    if "role" not in bot.all_commands:
        bot.add_command(role_group)
    await bot.add_cog(RemoveRoleFallback(bot))
