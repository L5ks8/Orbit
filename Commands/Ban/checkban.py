import discord
from discord.ext import commands

class CheckBanCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="checkban", description="Check if a user is banned from the server.")
    @commands.has_permissions(ban_members=True)
    async def checkban(self, ctx: commands.Context, target: discord.User):
        target_id = target.id

        try:
            ban_entry = await ctx.guild.fetch_ban(discord.Object(id=target_id))
            reason = ban_entry.reason or "No reason provided"
            embed = discord.Embed(title="User is Banned", color=discord.Color.red())
            embed.add_field(name="User", value=f"{ban_entry.user} (`{ban_entry.user.id}`)", inline=False)
            embed.add_field(name="Reason", value=reason, inline=False)
            await ctx.send(embed=embed)
        except discord.NotFound:
            await ctx.send(f"The user with ID `{target_id}` is **not** currently banned on this server.")
        except discord.Forbidden:
            await ctx.send("I do not have permission to view the ban list.", ephemeral=True)
        except discord.HTTPException:
            await ctx.send("Failed to fetch ban information due to an API error.", ephemeral=True)

    @checkban.error
    async def checkban_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You do not have permission to use this command.", ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage: `/checkban <target>`", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(CheckBanCommand(bot))
