import discord
from discord import app_commands
from discord.ext import commands
from Commands.JoinRole.joinrole import joinrole_group
from Commands.JoinRole._storage import remove_join_role
from Commands.JoinRole._views import JoinRoleLayout

async def _do_jr_remove(ctx: commands.Context, role: discord.Role):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)

    removed = remove_join_role(ctx.guild.id, role.id)
    summary = f"Removed {role.mention}" if removed else f"{role.mention} was not in the join roles list."
    view = JoinRoleLayout(ctx.guild, summary, ctx.author.id)
    await ctx.send(**view.get_kwargs(), allowed_mentions=discord.AllowedMentions.none())

@joinrole_group.command(name="remove", description="Remove auto join role.")
@commands.has_permissions(manage_roles=True)
@app_commands.describe(role="The role to remove from automatic assignment")
async def remove_cmd(ctx: commands.Context, role: discord.Role):
    await _do_jr_remove(ctx, role)

class JoinRoleRemoveCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="jr_remove", hidden=True)
    @commands.has_permissions(manage_roles=True)
    async def jr_remove_prefix(self, ctx: commands.Context, role: discord.Role):
        await _do_jr_remove(ctx, role)

async def setup(bot: commands.Bot):
    from Commands.JoinRole.joinrole import joinrole_group
    if "joinrole" not in bot.all_commands:
        bot.add_command(joinrole_group)
    await bot.add_cog(JoinRoleRemoveCog(bot))

