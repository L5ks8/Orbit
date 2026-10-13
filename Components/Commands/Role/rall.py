import discord
from Components.Commands._utils import make_embed, make_v2_card, ORBIT_COLOR, InteractionContext
from Components.emojis import Emojis
from discord.ext import commands
from Components.Commands.Role.role import role_group

async def _do_rolerall(ctx: InteractionContext, role: discord.Role, reason: str):
    await ctx.defer()
    if role >= ctx.guild.me.top_role:
        return await ctx.send(embed=make_embed("I cannot remove that role because it is higher than or equal to my highest role.", discord.Color.red()), ephemeral=True)
    if role >= ctx.author.top_role and ctx.author != ctx.guild.owner:
        return await ctx.send(embed=make_embed("You cannot remove a role higher than or equal to your own top role.", discord.Color.red()), ephemeral=True)
    if role.is_default():
        return await ctx.send(embed=make_embed("You cannot remove the @everyone role.", discord.Color.red()), ephemeral=True)

    updated_count = 0
    for member in ctx.guild.members:
        if role in member.roles:
            try:
                await member.remove_roles(role, reason=f"Role Remove All by {ctx.author} | Reason: {reason}")
                updated_count += 1
            except Exception:
                pass

    body = (
        f"# Role Removed from All\n\n"
        f"**Role:** {role.mention} (`{role.id}`)\n"
        f"**Affected:** `{updated_count}` members\n"
        f"**Moderator:** {ctx.author.mention}"
    )
    
    embed = discord.Embed(title="Role Removed from All", color=role.color)
    embed.add_field(name="Role", value=f"{role.mention} (`{role.id}`)", inline=False)
    embed.add_field(name="Affected", value=f"`{updated_count}` members", inline=False)
    embed.add_field(name="Moderator", value=ctx.author.mention, inline=False)
    await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

@role_group.command(name="rall", description="Remove a role from every member.")
async def role_rall_cmd(interaction: discord.Interaction, role: discord.Role, *, reason: str = "No reason provided"):
    ctx = InteractionContext(interaction)
    await _do_rolerall(ctx, role, reason)

class RoleRallCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @role_rall_cmd.error
    async def role_rall_error(self, interaction: discord.Interaction, error):
        ctx = InteractionContext(interaction)
        if isinstance(error, commands.MissingPermissions):
            await ctx.send(embed=make_embed("You need Administrator permissions to run this command.", discord.Color.red()), ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send(embed=make_embed("Usage: /role rall <role> [reason]", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    pass
