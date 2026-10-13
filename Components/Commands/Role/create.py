import discord
from discord.ext import commands
from Components.Commands.Role.role import role_group
from Components.Commands._utils import make_embed, make_v2_card, ORBIT_COLOR, InteractionContext
from Components.emojis import Emojis

async def _do_createrole(ctx: InteractionContext, name: str, color: str = None, hoist: bool = False, mentionable: bool = False):
    await ctx.defer()
    
    parsed_color = discord.Color.default()
    if color:
        try:
            parsed_color = discord.Color(int(color.replace("#", ""), 16))
        except ValueError:
            return await ctx.send(embed=make_embed("Invalid color format. Please use hex (e.g. #ff0000).", discord.Color.red()), ephemeral=True)

    try:
        new_role = await ctx.guild.create_role(
            name=name, 
            color=parsed_color, 
            hoist=hoist, 
            mentionable=mentionable, 
            reason=f"Created by {ctx.author}"
        )
        
        body = f"# Role Created\n\nSuccessfully created the role {new_role.mention}."
        
        embed = discord.Embed(
            title="Role Created", 
            description=f"Successfully created the role {new_role.mention}.", 
            color=parsed_color
        )
        await ctx.send(embed=embed)
    except discord.Forbidden:
        await ctx.send(embed=make_embed("I do not have sufficient permissions to create roles.", discord.Color.red()), ephemeral=True)
    except Exception as e:
        await ctx.send(embed=make_embed(f"Error creating role: {e}", discord.Color.red()), ephemeral=True)

@role_group.command(name="create", description="Create a new role in the server.")
async def role_create_cmd(interaction: discord.Interaction, name: str, color: str = None, hoist: bool = False, mentionable: bool = False):
    ctx = InteractionContext(interaction)
    await _do_createrole(ctx, name, color, hoist, mentionable)

class RoleCreateCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @role_create_cmd.error
    async def role_create_error(self, interaction: discord.Interaction, error):
        ctx = InteractionContext(interaction)
        if isinstance(error, commands.MissingPermissions):
            await ctx.send(embed=make_embed("You need Manage Roles permission to create roles.", discord.Color.red()), ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send(embed=make_embed("Usage: `/role create <name> [color_hex] [hoist] [mentionable]`", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    pass
