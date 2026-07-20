import discord
from discord.ext import commands
from Commands.ReactionRole.reactionrole import reactionrole_group


async def _do_create_panel(
    ctx: commands.Context,
    title: str,
    description: str,
    image_url: str | None,
    roles: list[discord.Role]
):
    valid_roles = [r for r in roles if r is not None]
    if not valid_roles:
        return await ctx.send("You must specify at least one valid role (`role1`).", ephemeral=True)

    if len(valid_roles) > 10:
        return await ctx.send("You can attach at most 10 roles per panel.", ephemeral=True)

    for r in valid_roles:
        if r >= ctx.guild.me.top_role and r != ctx.guild.me:
            return await ctx.send(f"I cannot assign the role `{r.name}` because it is equal to or higher than my highest role.", ephemeral=True)

    from Embeds import get_command_embed
    kwargs = get_command_embed(ctx.guild.id, "reaction_role", title=title, description=description, image_url=image_url, roles=valid_roles)
    await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())

@reactionrole_group.command(name="create", description="Create a button role panel.")
@commands.has_permissions(administrator=True)
async def rr_create_cmd(
    ctx: commands.Context,
    title: str,
    role1: discord.Role,
    role2: discord.Role = None,
    role3: discord.Role = None,
    role4: discord.Role = None,
    role5: discord.Role = None,
    description: str = "Click any button below to assign or remove the corresponding role.",
    image: discord.Attachment = None,
    image_url: str = None
):
    await ctx.defer()
    img_final = image.url if image else (image_url.strip() if image_url else None)
    roles_list = [role1, role2, role3, role4, role5]
    await _do_create_panel(ctx, title, description, img_final, roles_list)

class ReactionRoleCreateCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="rr_create", aliases=["rrcreate", "reactionrolecreate"], hidden=True)
    @commands.has_permissions(administrator=True)
    async def rr_create_prefix(self, ctx: commands.Context, title: str, role1: discord.Role, role2: discord.Role = None, role3: discord.Role = None, role4: discord.Role = None, role5: discord.Role = None, *, description: str = "Click any button below to assign or remove the corresponding role."):
        await _do_create_panel(ctx, title, description, None, [role1, role2, role3, role4, role5])

async def setup(bot: commands.Bot):
    from Commands.ReactionRole.reactionrole import reactionrole_group
    if "reactionrole" not in bot.all_commands:
        bot.add_command(reactionrole_group)
    await bot.add_cog(ReactionRoleCreateCog(bot))

