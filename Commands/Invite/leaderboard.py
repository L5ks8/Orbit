import discord
import io
from discord import app_commands
from discord.ext import commands
from Commands.Invite._storage import get_leaderboard
from Commands._utils import format_usage, make_embed


class LeaderboardCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_group(name="inviteleaderboard", description="Displays invite leaderboards for the server.")
    async def leaderboard_group(self, ctx: commands.Context):
        if ctx.invoked_subcommand is None:
            await ctx.send(embed=make_embed("Please use `/inviteleaderboard invites`."), ephemeral=True)

    @leaderboard_group.command(name="invites", description="Displays the top inviters of the server.")
    @app_commands.describe(limit="The number of users to show on the leaderboard")
    async def leaderboard_invites(self, ctx: commands.Context, limit: int = 10):
        await ctx.defer()
        
        lb = get_leaderboard(ctx.guild.id, limit=limit)

        if not lb:
            embed = discord.Embed(
                title="Invite Leaderboard",
                description="No invite data found for this server.",
                color=0x2B2D31
            )
            return await ctx.send(embed=embed)

        entries = []
        for i, data in enumerate(lb, 1):
            uid = int(data["user_id"])
            member = ctx.guild.get_member(uid) or ctx.bot.get_user(uid)
            if not member:
                try:
                    member = await ctx.bot.fetch_user(uid)
                except Exception:
                    pass
            
            name = member.display_name if hasattr(member, 'display_name') else (member.name if member else f"User#{uid}")
            
            avatar_bytes = None
            if member and member.display_avatar:
                try:
                    avatar_bytes = await member.display_avatar.read()
                except Exception:
                    pass
            
            entries.append({
                "name": name,
                "level": 0,
                "value_label": str(data["total"]),
                "avatar_bytes": avatar_bytes,
                "rank": i
            })
            
        from Commands.Level.leaderboard_card import generate_leaderboard_card
        
        img_bytes = generate_leaderboard_card(
            entries=entries,
            sort_key="invites"
        )
        
        file = discord.File(io.BytesIO(img_bytes), filename="leaderboard.png")
        import os
        base_url = os.environ.get("BASE_URL")
        embed = discord.Embed(
            title="Invite Leaderboard",
            description=f"[Want to see more than Top {limit}?]({base_url}/leaderboard/{ctx.guild.id}?sort=invites)",
            color=0x2B2D31
        )
        embed.set_image(url="attachment://leaderboard.png")

        await ctx.send(embed=embed, file=file)

    @leaderboard_invites.error
    async def leaderboard_invites_error(self, ctx: commands.Context, error):
        await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)


async def setup(bot: commands.Bot):
    await bot.add_cog(LeaderboardCommand(bot))