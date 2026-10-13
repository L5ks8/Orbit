import discord
from discord import app_commands
from discord.ext import commands
from Components.Commands.Invite._storage import get_invited_by_user
import csv
import io
from Components.Commands._utils import format_usage, make_embed, make_v2_card, ORBIT_COLOR, InteractionContext
from Components.emojis import Emojis


class ExportInvitedListCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(name="exportinvitedlist", description="Export the invited list of the specified user in a .csv file.")
    @app_commands.default_permissions(manage_guild=True)
    @app_commands.checks.has_permissions(manage_guild=True)
    async def exportinvitedlist(self, interaction: discord.Interaction, user: discord.Member = None):
        ctx = InteractionContext(interaction)
        await ctx.defer()
        target = user or ctx.author
        
        raw_list = get_invited_by_user(ctx.guild.id, target.id)
        
        if not raw_list:
            return await ctx.send(embed=make_embed(f"{target.mention} has not invited anyone."), ephemeral=True)
            
        csv_file = io.StringIO()
        writer = csv.writer(csv_file)
        writer.writerow(["User ID", "Invite Code"])
        
        for item in raw_list:
            writer.writerow([item.get("member_id", "Unknown"), item.get("code", "Unknown")])
            
        csv_file.seek(0)
        file = discord.File(fp=io.BytesIO(csv_file.getvalue().encode('utf-8')), filename=f"invited_list_{target.id}.csv")
        
        card = make_v2_card(f"# Export Invited List\n\nSuccessfully exported the invited list for {target.mention}.", color=ORBIT_COLOR)
        if card:
            return await ctx.send(view=card, file=file, allowed_mentions=discord.AllowedMentions.none())
        embed = discord.Embed(
            title="Export Invited List",
            description=f"Successfully exported the invited list for {target.mention}.",
            color=ORBIT_COLOR
        )
        await ctx.send(embed=embed, file=file, allowed_mentions=discord.AllowedMentions.none())

    @exportinvitedlist.error
    async def exportinvitedlist_error(self, interaction: discord.Interaction, error):
        ctx = InteractionContext(interaction)
        if isinstance(error, (app_commands.MissingPermissions, commands.MissingPermissions)):
            await ctx.send(embed=make_embed("You do not have permission to manage invites.", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)


async def setup(bot: commands.Bot):
    await bot.add_cog(ExportInvitedListCommand(bot))