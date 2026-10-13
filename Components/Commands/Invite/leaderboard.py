import discord
import io
import os
from discord import app_commands
from discord.ext import commands
from Components.Commands.Invite._storage import get_leaderboard
from Components.Commands._utils import format_usage, make_embed, ORBIT_COLOR, InteractionContext
from Components.emojis import Emojis


class LeaderboardCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    leaderboard_group = app_commands.Group(name="inviteleaderboard", description="Displays invite leaderboards for the server.")

    @leaderboard_group.command(name="invites", description="Displays the top inviters of the server.")
    @app_commands.describe(limit="The number of users to show on the leaderboard")
    async def leaderboard_invites(self, interaction: discord.Interaction, limit: int = 10):
        ctx = InteractionContext(interaction)
        await ctx.defer()
        
        lb = get_leaderboard(ctx.guild.id, limit=limit)

        if not lb:
            embed = discord.Embed(
                title="Invite Leaderboard",
                description="No invite data found for this server.",
                color=ORBIT_COLOR
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
            
        from Components.Systems.Level.leaderboard_card import generate_leaderboard_card
        
        img_bytes = generate_leaderboard_card(
            entries=entries,
            sort_key="invites"
        )
        
        file = discord.File(io.BytesIO(img_bytes), filename="leaderboard.png")
        base_url = os.environ.get("BASE_URL")
        embed = discord.Embed(
            title="Invite Leaderboard",
            description=f"[Want to see more than Top {limit}?]({base_url}/leaderboard/{ctx.guild.id}?sort=invites)",
            color=ORBIT_COLOR
        )
        embed.set_image(url="attachment://leaderboard.png")

        await ctx.send(embed=embed, file=file)

    @leaderboard_invites.error
    async def leaderboard_invites_error(self, interaction: discord.Interaction, error: app_commands.AppCommandError):
        ctx = InteractionContext(interaction)
        await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)


async def setup(bot: commands.Bot):
    await bot.add_cog(LeaderboardCommand(bot))