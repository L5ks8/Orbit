import discord
from discord.ext import commands
from Components.Commands._utils import make_embed, make_v2_card, ORBIT_COLOR, InteractionContext
from Components.emojis import Emojis

class CheckBanCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(name="checkban", description="Check if a user is banned from the server.")
    @app_commands.default_permissions(ban_members=True)
    @app_commands.checks.has_permissions(ban_members=True)
    async def checkban(self, interaction: discord.Interaction, target: discord.User):
        ctx = InteractionContext(interaction)
        target_id = target.id

        try:
            ban_entry = await ctx.guild.fetch_ban(discord.Object(id=target_id))
            reason = ban_entry.reason or "No reason provided"
            
            content = f"# User is Banned\n\n**User:** {ban_entry.user} (`{ban_entry.user.id}`)\n**Reason:** {reason}"
            card = make_v2_card(content, color=ORBIT_COLOR)
            if card:
                return await ctx.send(view=card)

            embed = discord.Embed(title="User is Banned", color=ORBIT_COLOR)
            embed.add_field(name="User", value=f"{ban_entry.user} (`{ban_entry.user.id}`)", inline=False)
            embed.add_field(name="Reason", value=reason, inline=False)
            await ctx.send(embed=embed)
        except discord.NotFound:
            await ctx.send(embed=make_embed(f"The user with ID `{target_id}` is **not** currently banned on this server."))
        except discord.Forbidden:
            await ctx.send(embed=make_embed("I do not have permission to view the ban list.", discord.Color.red()), ephemeral=True)
        except discord.HTTPException:
            await ctx.send(embed=make_embed("Failed to fetch ban information due to an API error.", discord.Color.red()), ephemeral=True)

    @checkban.error
    async def checkban_error(self, interaction: discord.Interaction, error):
        ctx = InteractionContext(interaction)
        if isinstance(error, (app_commands.MissingPermissions, commands.MissingPermissions)):
            await ctx.send(embed=make_embed("You do not have permission to use this command.", discord.Color.red()), ephemeral=True)
        elif isinstance(error, (app_commands.AppCommandError, commands.MissingRequiredArgument)):
            await ctx.send(embed=make_embed("Usage: `/checkban <target>`", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(CheckBanCommand(bot))