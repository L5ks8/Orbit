utf-8import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Role.role import role_group

class RoleAllSuccessLayout(LayoutView):
    def __init__(self, role: discord.Role, count: int, author: discord.Member):
        super().__init__()
        self.container = Container(
            TextDisplay(content=f"### Role Assigned to All Members\n**Role:** {role.mention} (`{role.id}`)"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Members Updated:** `{count}`\n**Moderator:** {author.mention}")
        )
        self.add_item(self.container)

async def _do_roleall(ctx: commands.Context, role: discord.Role, reason: str):
    await ctx.defer()
    if role >= ctx.guild.me.top_role:
        return await ctx.send("I cannot assign that role because it is higher than or equal to my highest role.", ephemeral=True)
    if role >= ctx.author.top_role and ctx.author != ctx.guild.owner:
        return await ctx.send("You cannot assign a role higher than or equal to your own top role.", ephemeral=True)
    if role.is_default():
        return await ctx.send("You cannot assign the @everyone role explicitly.", ephemeral=True)

    updated_count = 0
    for member in ctx.guild.members:
        if not member.bot and role not in member.roles:
            try:
                await member.add_roles(role, reason=f"Role All by {ctx.author} | Reason: {reason}")
                updated_count += 1
            except Exception:
                pass

    view = RoleAllSuccessLayout(role, updated_count, ctx.author)
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

@role_group.command(name="all", aliases=["roleall"], description="Assign a role to every member.")
@commands.has_permissions(administrator=True)
@commands.bot_has_permissions(manage_roles=True)
async def role_all_cmd(ctx: commands.Context, role: discord.Role, *, reason: str = "No reason provided"):
    await _do_roleall(ctx, role, reason)

class RoleAllCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @role_all_cmd.error
    async def role_all_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Administrator permissions to run this command.", ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage: `-role all <@role/name> [reason]`", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

class RoleAllFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="rl_all", aliases=["roleall"], hidden=True)
    @commands.has_permissions(administrator=True)
    @commands.bot_has_permissions(manage_roles=True)
    async def roleall_prefix(self, ctx: commands.Context, role: discord.Role, *, reason: str = "No reason provided"):
        await _do_roleall(ctx, role, reason)

async def setup(bot: commands.Bot):
    from Commands.Role.role import role_group
    if "role" not in bot.all_commands:
        bot.add_command(role_group)
    await bot.add_cog(RoleAllCog(bot))
    await bot.add_cog(RoleAllFallback(bot))
