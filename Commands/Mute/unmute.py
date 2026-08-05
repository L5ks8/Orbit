import discord
from discord.ext import commands
from discord.ui import Container, TextDisplay, Separator
from Commands.Mute._storage import get_muted_role_id
from Commands.Mute.mute import get_or_create_muted_role
from Commands.Log._storage import log_event
from Commands.Log._modlog_storage import add_modlog



class UnmuteCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="unmute", description="Removes the Muted role from a user.")
    @commands.has_permissions(manage_roles=True)
    @commands.bot_has_permissions(manage_roles=True)
    async def unmute(self, ctx: commands.Context, target: discord.Member, *, reason: str = "No reason provided"):
        await ctx.defer()
        role = await get_or_create_muted_role(ctx.guild)
        if not role or role not in target.roles:
            return await ctx.send("This user is not currently muted.", ephemeral=True)

        try:
            await target.remove_roles(role, reason=f"Unmuted by {ctx.author} | Reason: {reason}")
            add_modlog(ctx.guild.id, target.id, ctx.author.id, "Unmute", reason)
        except discord.Forbidden:
            return await ctx.send("I do not have permissions to remove the Muted role.", ephemeral=True)
        except Exception as e:
            return await ctx.send(f"Error removing muted role: {e}", ephemeral=True)


        await log_event(
            ctx.guild,
            "moderation_action",
            "User Unmuted (`-unmute`)",
            f"**Target:** {target.mention} (`{target.id}`)\n**Moderator:** {ctx.author.mention} (`{ctx.author.id}`)\n**Reason:** {reason}\n**Removed Role:** {role.mention}"
        )
        embed = discord.Embed(title="User Unmuted", color=discord.Color.green())
        embed.add_field(name="Target", value=f"{target.mention} (`{target.id}`)", inline=False)
        embed.add_field(name="Reason", value=reason, inline=False)
        embed.add_field(name="Moderator", value=ctx.author.mention, inline=False)
        if role:
            embed.add_field(name="Role Removed", value=role.mention, inline=False)
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

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

