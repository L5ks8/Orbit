import discord
from discord.ext import commands
from discord.ui import Container, TextDisplay, Separator
from Components.Systems.Automoderation.log_storage import log_event
from Components.Commands.ModLog._modlog_storage import add_modlog
from Components.Commands._utils import make_embed, make_v2_card, ORBIT_COLOR, InteractionContext
from Components.emojis import Emojis


class UntimeoutCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(name="untimeout", description="Removes an active timeout from a user.")
    @app_commands.default_permissions(moderate_members=True)
    @app_commands.checks.has_permissions(moderate_members=True)
    @app_commands.checks.bot_has_permissions(moderate_members=True)
    async def untimeout(self, interaction: discord.Interaction, target: discord.Member, *, reason: str = "No reason provided"):
        ctx = InteractionContext(interaction)
        await ctx.defer()
        if not target.is_timed_out():
            return await ctx.send(embed=make_embed("This user is not currently timed out.", discord.Color.red()), ephemeral=True)

        try:
            await target.timeout(None, reason=f"Untimeout by {ctx.author} | Reason: {reason}")
            add_modlog(ctx.guild.id, target.id, ctx.author.id, "Untimeout", reason)
            
            await log_event(
                ctx.guild,
                "moderation_action",
                "User Timeout Removed (`/untimeout`)",
                f"**Target:** {target.mention} (`{target.id}`)\n**Moderator:** {ctx.author.mention} (`{ctx.author.id}`)\n**Reason:** {reason}"
            )
            v2_body = (
                f"# User Timeout Removed\n\n"
                f"**Target:** {target.mention} (`{target.id}`)\n"
                f"**Moderator:** {ctx.author.mention}\n"
                f"**Status:** `Cleared`"
            )
            if reason and reason != "No reason provided":
                v2_body += f"\n**Reason:** {reason}"
            card = make_v2_card(v2_body, color=ORBIT_COLOR)
            if card:
                return await ctx.send(view=card, allowed_mentions=discord.AllowedMentions.none())

            embed = discord.Embed(title="User Timeout Removed", color=ORBIT_COLOR)
            embed.add_field(name="Target", value=f"{target.mention} (`{target.id}`)", inline=False)
            if reason and reason != "No reason provided":
                embed.add_field(name="Reason", value=reason, inline=False)
            embed.add_field(name="Moderator", value=ctx.author.mention, inline=False)
            embed.add_field(name="Status", value="`Cleared`", inline=False)
            await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())
        except discord.Forbidden:
            await ctx.send(embed=make_embed("I do not have sufficient permissions to remove the timeout.", discord.Color.red()), ephemeral=True)
        except Exception as e:
            await ctx.send(embed=make_embed(f"Error removing timeout: {e}", discord.Color.red()), ephemeral=True)

    @untimeout.error
    async def untimeout_error(self, interaction: discord.Interaction, error):
        ctx = InteractionContext(interaction)
        if isinstance(error, (app_commands.MissingPermissions, commands.MissingPermissions)):
            await ctx.send(embed=make_embed("You need Moderate Members permission to remove timeouts.", discord.Color.red()), ephemeral=True)
        elif isinstance(error, (commands.MissingRequiredArgument, commands.BadArgument)):
            await ctx.send(embed=make_embed("Usage: /untimeout <target> [reason]", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(UntimeoutCommand(bot))

