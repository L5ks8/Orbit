utf-8import discord
from discord.ext import commands
from Commands.JoinRole.joinrole import joinrole_group
from Commands.JoinRole._views import JoinRoleLayout

async def _do_jr_list(ctx: commands.Context):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)

    view = JoinRoleLayout(ctx.guild, "Viewing list", ctx.author.id)
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

@joinrole_group.command(name="list", description="List configured auto join roles.")
@commands.has_permissions(manage_roles=True)
async def list_cmd(ctx: commands.Context):
    await _do_jr_list(ctx)

class JoinRoleListCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="jr_list", hidden=True)
    @commands.has_permissions(manage_roles=True)
    async def jr_list_prefix(self, ctx: commands.Context):
        await _do_jr_list(ctx)

async def setup(bot: commands.Bot):
    from Commands.JoinRole.joinrole import joinrole_group
    if "joinrole" not in bot.all_commands:
        bot.add_command(joinrole_group)
    await bot.add_cog(JoinRoleListCog(bot))
