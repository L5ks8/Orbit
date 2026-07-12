import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator

class UnmuteSuccessLayout(LayoutView):
    def __init__(self, target: discord.Member, reason: str, author: discord.Member):
        super().__init__()
        self.container = Container(
            TextDisplay(content=f"### User Unmuted\n**Target:** {target.mention} (`{target.id}`)"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Reason:** {reason}\n**Moderator:** {author.mention}")
        )
        self.add_item(self.container)

class UnmuteCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="unmute", description="Removes the Muted role from a user.")
    @commands.has_permissions(manage_roles=True)
    @commands.bot_has_permissions(manage_roles=True)
    async def unmute(self, ctx: commands.Context, target: discord.Member, *, reason: str = "No reason provided"):
        await ctx.defer()
        role = discord.utils.get(ctx.guild.roles, name="Muted")
        if not role or role not in target.roles:
            return await ctx.send("This user is not currently muted.", ephemeral=True)

        try:
            await target.remove_roles(role, reason=f"Unmuted by {ctx.author} | Reason: {reason}")
            view = UnmuteSuccessLayout(target, reason, ctx.author)
            await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())
        except discord.Forbidden:
            await ctx.send("I do not have permissions to remove the Muted role.", ephemeral=True)
        except Exception as e:
            await ctx.send(f"Error unmuting user: {e}", ephemeral=True)

    @unmute.error
    async def unmute_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Manage Roles permission to unmute users.", ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage: -unmute <@user/ID> [reason]", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(UnmuteCommand(bot))
