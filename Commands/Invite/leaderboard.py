import discord
from discord.ext import commands
from Commands.Invite._storage import get_leaderboard
from Commands._utils import format_usage


class LeaderboardCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_group(name="leaderboard", description="Displays leaderboards for the server.")
    async def leaderboard_group(self, ctx: commands.Context):
        if ctx.invoked_subcommand is None:
            await ctx.send("Please use `/leaderboard invites`.", ephemeral=True)

    @leaderboard_group.command(name="invites", description="Displays the top inviters of the server.")
    async def leaderboard_invites(self, ctx: commands.Context, limit: int = 10):
        await ctx.defer()
        
        lb = get_leaderboard(ctx.guild.id, limit=limit)

        from Embeds import get_command_embed
        kwargs = get_command_embed(ctx.guild.id, "leaderboard_invites", msg_type="info", leaderboard=lb, limit=limit, guild=ctx.guild)
        await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())

    @leaderboard_invites.error
    async def leaderboard_invites_error(self, ctx: commands.Context, error):
        await ctx.send(f"An error occurred: {error}", ephemeral=True)


async def setup(bot: commands.Bot):
    await bot.add_cog(LeaderboardCommand(bot))
