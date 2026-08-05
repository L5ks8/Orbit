import discord
from discord.ext import commands
from Commands.Role.role import role_group

async def _do_roleinfo(ctx: commands.Context, role: discord.Role):
    await ctx.defer()
    created_ts = int(role.created_at.timestamp())
    embed = discord.Embed(title="Role Info", color=role.color)
    embed.add_field(name="Role", value=f"{role.mention} (`{role.id}`)", inline=False)
    embed.add_field(name="Created At", value=f"<t:{created_ts}:F> (<t:{created_ts}:R>)", inline=False)
    embed.add_field(name="Members", value=f"`{len(role.members)}`", inline=True)
    embed.add_field(name="Position", value=f"`{role.position}`", inline=True)
    embed.add_field(name="Hoisted", value=f"`{role.hoist}`", inline=True)
    embed.add_field(name="Mentionable", value=f"`{role.mentionable}`", inline=True)
    embed.add_field(name="Managed", value=f"`{role.managed}`", inline=True)
    
    await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

@role_group.command(name="info", aliases=["roleinfo"], description="Display information about a role.")
async def role_info_cmd(ctx: commands.Context, role: discord.Role):
    await _do_roleinfo(ctx, role)

class RoleInfoCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @role_info_cmd.error
    async def role_info_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage: `-role info <@role/name/ID>`", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

class RoleInfoFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="rl_info", aliases=["roleinfo"], hidden=True)
    async def roleinfo_prefix(self, ctx: commands.Context, role: discord.Role):
        await _do_roleinfo(ctx, role)

async def setup(bot: commands.Bot):
    from Commands.Role.role import role_group
    if "role" not in bot.all_commands:
        bot.add_command(role_group)
    await bot.add_cog(RoleInfoCog(bot))
    await bot.add_cog(RoleInfoFallback(bot))
