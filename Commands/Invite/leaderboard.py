import discord
from discord.ext import commands
from Commands.Invite._storage import get_leaderboard
from Commands._utils import format_usage


class LeaderboardCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_group(name="inviteleaderboard", description="Displays invite leaderboards for the server.")
    async def leaderboard_group(self, ctx: commands.Context):
        if ctx.invoked_subcommand is None:
            await ctx.send("Please use `/inviteleaderboard invites`.", ephemeral=True)

    @leaderboard_group.command(name="invites", description="Displays the top inviters of the server.")
    async def leaderboard_invites(self, ctx: commands.Context, limit: int = 10):
        await ctx.defer()
        
        lb = get_leaderboard(ctx.guild.id, limit=limit)

        embed = discord.Embed(
            title="Invite Leaderboard",
            color=discord.Color.blurple()
        )

        if not lb:
            embed.description = "No invite data found for this server."
        else:
            lines = []
            for i, data in enumerate(lb, 1):
                uid = data["user_id"]
                lines.append(f"`{i}.` <@{uid}> — **{data['total']}** invites (`{data['regular']}` regular, `{data['bonus']}` bonus, `{data['fake']}` fake, `{data['left']}` left)")
            embed.description = "\n".join(lines)

        if ctx.guild:
            embed.set_footer(text=ctx.guild.name, icon_url=ctx.guild.icon.url if ctx.guild.icon else None)

        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

    @leaderboard_invites.error
    async def leaderboard_invites_error(self, ctx: commands.Context, error):
        await ctx.send(f"An error occurred: {error}", ephemeral=True)


async def setup(bot: commands.Bot):
    await bot.add_cog(LeaderboardCommand(bot))
