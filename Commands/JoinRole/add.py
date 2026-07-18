utf-8import discord
from discord import app_commands
from discord.ext import commands
from Commands.JoinRole.joinrole import joinrole_group
from Commands.JoinRole._storage import add_join_role
from Commands.JoinRole._views import JoinRoleLayout

async def _do_jr_add(ctx: commands.Context, role: discord.Role):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)

    if role.is_default() or role.managed:
        return await ctx.send("You cannot configure `@everyone` or bot integration roles (`managed roles`) as join roles.", ephemeral=True)

    if ctx.guild.me.top_role <= role:
        return await ctx.send(f"I cannot assign {role.mention} because it is higher than or equal to my highest role (`{ctx.guild.me.top_role.name}`).", ephemeral=True)

    added = add_join_role(ctx.guild.id, role.id)
    summary = f"Added {role.mention}" if added else f"{role.mention} is already in the join roles list."
    view = JoinRoleLayout(ctx.guild, summary, ctx.author.id)
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

@joinrole_group.command(name="add", description="Add auto join role.")
@commands.has_permissions(manage_roles=True)
@app_commands.describe(role="The role to automatically give to joining members")
async def add_cmd(ctx: commands.Context, role: discord.Role):
    await _do_jr_add(ctx, role)

class JoinRoleAddCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="jr_add", hidden=True)
    @commands.has_permissions(manage_roles=True)
    async def jr_add_prefix(self, ctx: commands.Context, role: discord.Role):
        await _do_jr_add(ctx, role)

async def setup(bot: commands.Bot):
    from Commands.JoinRole.joinrole import joinrole_group
    if "joinrole" not in bot.all_commands:
        bot.add_command(joinrole_group)
    await bot.add_cog(JoinRoleAddCog(bot))
