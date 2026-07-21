import discord
from discord.ext import commands
from Commands.Role.role import role_group

async def _do_createrole(ctx: commands.Context, name: str, color: str = None, hoist: bool = False, mentionable: bool = False):
    await ctx.defer()
    
    parsed_color = discord.Color.default()
    if color:
        try:
            parsed_color = discord.Color(int(color.replace("#", ""), 16))
        except ValueError:
            return await ctx.send("Invalid color format. Please use hex (e.g. #ff0000).", ephemeral=True)

    try:
        new_role = await ctx.guild.create_role(
            name=name, 
            color=parsed_color, 
            hoist=hoist, 
            mentionable=mentionable, 
            reason=f"Created by {ctx.author}"
        )
        
        embed = discord.Embed(
            title="Role Created", 
            description=f"Successfully created the role {new_role.mention}.", 
            color=parsed_color
        )
        await ctx.send(embed=embed)
    except discord.Forbidden:
        await ctx.send("I do not have sufficient permissions to create roles.", ephemeral=True)
    except Exception as e:
        await ctx.send(f"Error creating role: {e}", ephemeral=True)

@role_group.command(name="create", description="Create a new role in the server.")
@commands.has_permissions(manage_roles=True)
@commands.bot_has_permissions(manage_roles=True)
async def role_create_cmd(ctx: commands.Context, name: str, color: str = None, hoist: bool = False, mentionable: bool = False):
    await _do_createrole(ctx, name, color, hoist, mentionable)

class RoleCreateCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @role_create_cmd.error
    async def role_create_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Manage Roles permission to create roles.", ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage: `-role create <name> [color_hex] [hoist] [mentionable]`", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    from Commands.Role.role import role_group
    if "role" not in bot.all_commands:
        bot.add_command(role_group)
    await bot.add_cog(RoleCreateCog(bot))
