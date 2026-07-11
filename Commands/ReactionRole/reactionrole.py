import discord
from discord.ext import commands
from Commands.ReactionRole._views import ReactionRolePanelLayout

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

    view = ReactionRolePanelLayout(title=title, description=description, roles=valid_roles, image_url=image_url)
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())


@commands.hybrid_group(name="reactionrole", aliases=["rr", "btnrole"], description="Manages persistent Reaction Role / Button Role panels.")
@commands.has_permissions(administrator=True)
async def reactionrole_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        await ctx.send("Usage: `/reactionrole create <title> <role1> [role2...]`", ephemeral=True)


@reactionrole_group.command(name="create", description="Creates a persistent Button Role assignment panel (`/rr create`).")
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


class ReactionRoleCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @reactionrole_group.error
    async def rr_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need `Administrator` permission to manage reaction roles.", ephemeral=True)
        elif isinstance(error, commands.BotMissingPermissions):
            await ctx.send("I need `Manage Roles` permission to assign roles.", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

    @commands.Cog.listener()
    async def on_interaction(self, interaction: discord.Interaction):
        if interaction.type != discord.InteractionType.component:
            return
        
        custom_id = interaction.data.get("custom_id", "")
        if not custom_id.startswith("rr_btn_"):
            return

        if not interaction.guild:
            return await interaction.response.send_message("This button can only be used inside a server.", ephemeral=True)

        role_id_str = custom_id.replace("rr_btn_", "")
        if not role_id_str.isdigit():
            return

        role_id = int(role_id_str)
        role = interaction.guild.get_role(role_id)
        if not role:
            return await interaction.response.send_message(f"This role (`ID: {role_id}`) no longer exists on this server.", ephemeral=True)

        if not interaction.guild.me.guild_permissions.manage_roles or role >= interaction.guild.me.top_role:
            return await interaction.response.send_message(f"I do not have sufficient hierarchy (`Manage Roles` / Role Position) to assign or remove `{role.name}`.", ephemeral=True)

        if role in interaction.user.roles:
            try:
                await interaction.user.remove_roles(role, reason="Reaction Role toggle (remove)")
                await interaction.response.send_message(f"Removed role `{role.name}` from you.", ephemeral=True)
            except Exception as e:
                await interaction.response.send_message(f"Failed to remove role: {e}", ephemeral=True)
        else:
            try:
                await interaction.user.add_roles(role, reason="Reaction Role toggle (add)")
                await interaction.response.send_message(f"Assigned role `{role.name}` to you.", ephemeral=True)
            except Exception as e:
                await interaction.response.send_message(f"Failed to assign role: {e}", ephemeral=True)


class ReactionRolePrefixFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="rr create", aliases=["rrcreate", "reactionrole create"], hidden=True)
    @commands.has_permissions(administrator=True)
    async def rr_create_prefix(self, ctx: commands.Context, title: str, role1: discord.Role, role2: discord.Role = None, role3: discord.Role = None, role4: discord.Role = None, role5: discord.Role = None, *, description: str = "Click any button below to assign or remove the corresponding role."):
        await _do_create_panel(ctx, title, description, None, [role1, role2, role3, role4, role5])


async def setup(bot: commands.Bot):
    if "reactionrole" not in bot.all_commands:
        bot.add_command(reactionrole_group)
    await bot.add_cog(ReactionRoleCog(bot))
    await bot.add_cog(ReactionRolePrefixFallback(bot))
