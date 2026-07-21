import discord
from discord.ext import commands
from Commands.Role.role import role_group

async def _do_roleinfo(ctx: commands.Context, role: discord.Role):
    await ctx.defer()
    created_ts = int(role.created_at.timestamp())
    from Embeds import get_command_embed
    kwargs = get_command_embed(
        ctx.guild.id, "role", msg_type="info", 
        role_mention=role.mention, role_id=role.id, role_color=role.color,
        role_created_at=f"<t:{created_ts}:F> (<t:{created_ts}:R>)",
        role_members=len(role.members), role_position=role.position,
        role_hoisted=role.hoist, role_mentionable=role.mentionable,
        role_managed=role.managed
    )
    await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())

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
