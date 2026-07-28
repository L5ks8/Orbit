import discord
from discord.ext import commands
from Commands.Invite._storage import get_invited_by_user
import csv
import io
from Commands._utils import format_usage
from Embeds import get_command_embed


class ExportInvitedListCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="exportinvitedlist", description="Export the invited list of the specified user in a .csv file.")
    @commands.has_permissions(manage_guild=True)
    async def exportinvitedlist(self, ctx: commands.Context, user: discord.Member = None):
        await ctx.defer()
        target = user or ctx.author
        
        raw_list = get_invited_by_user(ctx.guild.id, target.id)
        
        if not raw_list:
            return await ctx.send(f"{target.mention} has not invited anyone.", ephemeral=True)
            
        csv_file = io.StringIO()
        writer = csv.writer(csv_file)
        writer.writerow(["User ID", "Invite Code"])
        
        for item in raw_list:
            writer.writerow([item.get("member_id", "Unknown"), item.get("code", "Unknown")])
            
        csv_file.seek(0)
        file = discord.File(fp=io.BytesIO(csv_file.getvalue().encode('utf-8')), filename=f"invited_list_{target.id}.csv")
        
        kwargs = get_command_embed(ctx.guild.id, "exportinvitedlist", msg_type="success", user=target)
        await ctx.send(**kwargs, file=file, allowed_mentions=discord.AllowedMentions.none())

    @exportinvitedlist.error
    async def exportinvitedlist_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You do not have permission to manage invites.", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)


async def setup(bot: commands.Bot):
    await bot.add_cog(ExportInvitedListCommand(bot))
