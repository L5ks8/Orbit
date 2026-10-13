import discord
from Components.Commands._utils import make_embed, make_v2_card, ORBIT_COLOR, InteractionContext
from Components.emojis import Emojis
from discord.ext import commands
from Components.Commands.Role.role import role_group

async def _do_addrole(ctx: InteractionContext, target: discord.Member, role: discord.Role, reason: str):
    await ctx.defer()
    if role >= ctx.guild.me.top_role:
        return await ctx.send(embed=make_embed("I cannot assign that role because it is higher than or equal to my highest role.", discord.Color.red()), ephemeral=True)
    if role >= ctx.author.top_role and ctx.author != ctx.guild.owner:
        return await ctx.send(embed=make_embed("You cannot assign a role higher than or equal to your own top role.", discord.Color.red()), ephemeral=True)
    if role in target.roles:
        return await ctx.send(embed=make_embed("The user already has that role.", discord.Color.red()), ephemeral=True)

    try:
        await target.add_roles(role, reason=f"Role added by {ctx.author} | Reason: {reason}")
        body = (
            f"# Role Added\n\n"
            f"**Target:** {target.mention} (`{target.id}`)\n"
            f"**Role:** {role.mention} (`{role.id}`)\n"
            f"**Reason:** {reason}\n"
            f"**Moderator:** {ctx.author.mention}"
        )
        
        embed = discord.Embed(title="Role Added", color=role.color)
        embed.add_field(name="Target", value=f"{target.mention} (`{target.id}`)", inline=False)
        embed.add_field(name="Role", value=f"{role.mention} (`{role.id}`)", inline=False)
        embed.add_field(name="Reason", value=reason, inline=False)
        embed.add_field(name="Moderator", value=ctx.author.mention, inline=False)
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())
    except discord.Forbidden:
        await ctx.send(embed=make_embed("I do not have sufficient permissions to add that role.", discord.Color.red()), ephemeral=True)
    except Exception as e:
        await ctx.send(embed=make_embed(f"Error adding role: {e}", discord.Color.red()), ephemeral=True)

@role_group.command(name="add", description="Assign a role to a member.")
async def role_add_cmd(interaction: discord.Interaction, target: discord.Member, role: discord.Role, *, reason: str = "No reason provided"):
    ctx = InteractionContext(interaction)
    await _do_addrole(ctx, target, role, reason)

class RoleAddCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @role_add_cmd.error
    async def role_add_error(self, interaction: discord.Interaction, error):
        ctx = InteractionContext(interaction)
        if isinstance(error, commands.MissingPermissions):
            await ctx.send(embed=make_embed("You need Manage Roles permission to assign roles.", discord.Color.red()), ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send(embed=make_embed("Usage: /role add <target> <role> [reason]", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    pass
