import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Role._group import role_group

class RoleRemoveAllSuccessLayout(LayoutView):
    def __init__(self, role: discord.Role, count: int, author: discord.Member):
        super().__init__()
        self.container = Container(
            TextDisplay(content=f"### Role Removed from All Members\n**Role:** {role.mention} (`{role.id}`)"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Members Updated:** `{count}`\n**Moderator:** {author.mention}")
        )
        self.add_item(self.container)

async def _do_rolerall(ctx: commands.Context, role: discord.Role, reason: str):
    await ctx.defer()
    if role >= ctx.guild.me.top_role:
        return await ctx.send("I cannot remove that role because it is higher than or equal to my highest role.", ephemeral=True)
    if role >= ctx.author.top_role and ctx.author != ctx.guild.owner:
        return await ctx.send("You cannot remove a role higher than or equal to your own top role.", ephemeral=True)
    if role.is_default():
        return await ctx.send("You cannot remove the @everyone role.", ephemeral=True)

    updated_count = 0
    for member in ctx.guild.members:
        if role in member.roles:
            try:
                await member.remove_roles(role, reason=f"Role Remove All by {ctx.author} | Reason: {reason}")
                updated_count += 1
            except Exception:
                pass

    view = RoleRemoveAllSuccessLayout(role, updated_count, ctx.author)
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

@role_group.command(name="rall", aliases=["rolerall"], description="Removes a role from every member on the server.")
@commands.has_permissions(administrator=True)
@commands.bot_has_permissions(manage_roles=True)
async def role_rall_cmd(ctx: commands.Context, role: discord.Role, *, reason: str = "No reason provided"):
    await _do_rolerall(ctx, role, reason)

@role_rall_cmd.error
async def role_rall_error(ctx: commands.Context, error):
    if isinstance(error, commands.MissingPermissions):
        await ctx.send("You need Administrator permissions to run this command.", ephemeral=True)
    elif isinstance(error, commands.MissingRequiredArgument):
        await ctx.send("Usage: `-role rall <@role/name> [reason]`", ephemeral=True)
    else:
        await ctx.send(f"An error occurred: {error}", ephemeral=True)

class RoleRemoveAllFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="rolerall", hidden=True)
    @commands.has_permissions(administrator=True)
    @commands.bot_has_permissions(manage_roles=True)
    async def rolerall_prefix(self, ctx: commands.Context, role: discord.Role, *, reason: str = "No reason provided"):
        await _do_rolerall(ctx, role, reason)

async def setup(bot: commands.Bot):
    if "role" not in bot.all_commands:
        bot.add_command(role_group)
    await bot.add_cog(RoleRemoveAllFallback(bot))
