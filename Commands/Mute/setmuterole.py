import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Mute._storage import set_muted_role_id, get_muted_role_id


class SetMuteRoleLayout(LayoutView):
    def __init__(self, role: discord.Role, author: discord.Member):
        super().__init__()
        self.container = Container(
            TextDisplay(content=f"### Muted Role Configured\n**Role:** {role.mention} (`{role.id}`)"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Configured by:** {author.mention}\n*This role ID has been saved to storage. `-mute` and `-unmute` will now use this role while disabling user permissions across every channel.*")
        )
        self.add_item(self.container)


class SetMuteRoleCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="setmuterole", aliases=["muterole"], description="Sets or updates the Muted role saved for this server.")
    @commands.has_permissions(manage_roles=True)
    async def setmuterole(self, ctx: commands.Context, role: discord.Role = None):
        if role is None:
            current_id = get_muted_role_id(ctx.guild.id)
            if current_id:
                curr_role = ctx.guild.get_role(current_id)
                role_text = curr_role.mention if curr_role else f"`ID: {current_id} (Role deleted)`"
            else:
                role_text = "`None configured (Default 'Muted' will be created/used)`"
            return await ctx.send(f"**Current Muted Role:** {role_text}\n> To change: `-setmuterole @Role`", ephemeral=True)

        set_muted_role_id(ctx.guild.id, role.id)
        view = SetMuteRoleLayout(role, ctx.author)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

    @setmuterole.error
    async def setmuterole_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Manage Roles permission to configure the Muted role.", ephemeral=True)
        elif isinstance(error, commands.BadArgument):
            await ctx.send("Could not find that role. Usage: `-setmuterole @Role`", ephemeral=True)


async def setup(bot: commands.Bot):
    await bot.add_cog(SetMuteRoleCommand(bot))
