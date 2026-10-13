import discord
from discord.ext import commands
from discord.ui import Container, TextDisplay, Separator
from Components.Commands.Mute._storage import get_muted_role_id
from Components.Commands.Mute.mute import get_or_create_muted_role
from Components.Systems.Automoderation.log_storage import log_event
from Components.Commands.ModLog._modlog_storage import add_modlog
from Components.Commands._utils import make_embed, make_v2_card, ORBIT_COLOR, InteractionContext
from Components.emojis import Emojis


class UnmuteCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(name="unmute", description="Removes the Muted role from a user.")
    @app_commands.default_permissions(manage_roles=True)
    @app_commands.checks.has_permissions(manage_roles=True)
    @app_commands.checks.bot_has_permissions(manage_roles=True)
    async def unmute(self, interaction: discord.Interaction, target: discord.Member, *, reason: str = "No reason provided"):
        ctx = InteractionContext(interaction)
        await ctx.defer()
        role = await get_or_create_muted_role(ctx.guild)
        if not role or role not in target.roles:
            return await ctx.send(embed=make_embed("This user is not currently muted.", discord.Color.red()), ephemeral=True)

        try:
            await target.remove_roles(role, reason=f"Unmuted by {ctx.author} | Reason: {reason}")
            add_modlog(ctx.guild.id, target.id, ctx.author.id, "Unmute", reason)
        except discord.Forbidden:
            return await ctx.send(embed=make_embed("I do not have permissions to remove the Muted role.", discord.Color.red()), ephemeral=True)
        except Exception as e:
            return await ctx.send(embed=make_embed(f"Error removing muted role: {e}", discord.Color.red()), ephemeral=True)


        await log_event(
            ctx.guild,
            "moderation_action",
            "User Unmuted (`/unmute`)",
            f"**Target:** {target.mention} (`{target.id}`)\n**Moderator:** {ctx.author.mention} (`{ctx.author.id}`)\n**Reason:** {reason}\n**Removed Role:** {role.mention}"
        )
        body = (
            f"# User Unmuted\n\n"
            f"**Target:** {target.mention} (`{target.id}`)\n"
            f"**Reason:** {reason}\n"
            f"**Moderator:** {ctx.author.mention}"
            + (f"\n**Role Removed:** {role.mention}" if role else "")
        )
        card = make_v2_card(body, color=ORBIT_COLOR)
        if card:
            return await ctx.send(view=card, allowed_mentions=discord.AllowedMentions.none())
        embed = discord.Embed(title="User Unmuted", color=ORBIT_COLOR)
        embed.add_field(name="Target", value=f"{target.mention} (`{target.id}`)", inline=False)
        embed.add_field(name="Reason", value=reason, inline=False)
        embed.add_field(name="Moderator", value=ctx.author.mention, inline=False)
        if role:
            embed.add_field(name="Role Removed", value=role.mention, inline=False)
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

    @unmute.error
    async def unmute_error(self, interaction: discord.Interaction, error):
        ctx = InteractionContext(interaction)
        if isinstance(error, (app_commands.MissingPermissions, commands.MissingPermissions)):
            await ctx.send(embed=make_embed("You need Manage Roles permission to unmute users.", discord.Color.red()), ephemeral=True)
        elif isinstance(error, (commands.MissingRequiredArgument, commands.BadArgument)):
            await ctx.send(embed=make_embed("Usage: /unmute <target> [reason]", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(UnmuteCommand(bot))

