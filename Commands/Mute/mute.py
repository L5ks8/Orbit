import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Whitelist._storage import is_whitelisted

async def get_or_create_muted_role(guild: discord.Guild) -> discord.Role:
    role = discord.utils.get(guild.roles, name="Muted")
    if not role:
        role = await guild.create_role(name="Muted", reason="Orbit Mute Role")
        for channel in guild.channels:
            try:
                await channel.set_permissions(role, send_messages=False, add_reactions=False)
            except Exception:
                pass
    return role

class MuteSuccessLayout(LayoutView):
    def __init__(self, target: discord.Member, reason: str, author: discord.Member):
        super().__init__()
        self.container = Container(
            TextDisplay(content=f"### User Muted\n**Target:** {target.mention} (`{target.id}`)"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Reason:** {reason}\n**Moderator:** {author.mention}")
        )
        self.add_item(self.container)

class MuteCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="mute", description="Mutes a user from typing in chat channels.")
    @commands.has_permissions(manage_roles=True)
    @commands.bot_has_permissions(manage_roles=True)
    async def mute(self, ctx: commands.Context, target: discord.Member, *, reason: str = "No reason provided"):
        await ctx.defer()
        if target.id == ctx.author.id:
            return await ctx.send("You cannot mute yourself.", ephemeral=True)
        if is_whitelisted(ctx.guild.id, target.id):
            return await ctx.send("This user is on the global moderation whitelist (`Immune to Mute`).", ephemeral=True)
        if target.top_role >= ctx.author.top_role and ctx.author != ctx.guild.owner:
            return await ctx.send("You cannot mute a user with an equal or higher role.", ephemeral=True)

        role = await get_or_create_muted_role(ctx.guild)
        if role in target.roles:
            return await ctx.send("This user is already muted.", ephemeral=True)

        try:
            await target.add_roles(role, reason=f"Muted by {ctx.author} | Reason: {reason}")
            view = MuteSuccessLayout(target, reason, ctx.author)
            await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())
        except discord.Forbidden:
            await ctx.send("I do not have permissions to manage roles or my role is lower than the Muted role.", ephemeral=True)
        except Exception as e:
            await ctx.send(f"Error muting user: {e}", ephemeral=True)

    @mute.error
    async def mute_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Manage Roles permission to mute users.", ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage: -mute <@user/ID> [reason]", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(MuteCommand(bot))
