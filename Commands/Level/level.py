import discord
from discord import app_commands
from discord.ext import commands
from Commands.Level._storage import (
    load_level_config, get_user_xp, xp_progress,
    get_leaderboard, get_user_rank, level_from_xp
)
import io

class LevelCommandsCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(name="rank", description="View your or another member's rank card.")
    @app_commands.describe(member="The member to check")
    async def rank(self, interaction: discord.Interaction, member: discord.Member = None):
        config = load_level_config(interaction.guild.id)
        if not config.get("enabled", False):
            return await interaction.response.send_message("The Level System is not enabled on this server.", ephemeral=True)

        target = member or interaction.user
        data = get_user_xp(interaction.guild.id, target.id)
        total_xp = data.get("total_xp", 0)
        level, current_xp, needed_xp = xp_progress(total_xp)
        rank = get_user_rank(interaction.guild.id, target.id)
        msg_count = data.get("message_count", 0)
        voice_mins = data.get("voice_minutes", 0)
        react_count = data.get("reaction_count", 0)

        # Try to generate rank card image
        try:
            from Commands.Level.rank_card import generate_rank_card
            avatar_bytes = await target.display_avatar.read()
            img_bytes = generate_rank_card(
                username=target.display_name,
                avatar_bytes=avatar_bytes,
                rank=rank,
                level=level,
                current_xp=current_xp,
                needed_xp=needed_xp,
                total_xp=total_xp,
                message_count=msg_count,
                voice_minutes=voice_mins,
                reaction_count=react_count
            )
            file = discord.File(io.BytesIO(img_bytes), filename="rank_card.png")
            await interaction.response.send_message(file=file)
        except Exception:
            # Fallback to embed if image gen fails
            progress = int((current_xp / needed_xp) * 10) if needed_xp > 0 else 10
            bar = "🟦" * progress + "⬛" * (10 - progress)

            embed = discord.Embed(color=0x3B82F6)
            embed.set_author(name=target.display_name, icon_url=target.display_avatar.url)
            embed.add_field(name="Rank", value=f"#{rank}", inline=True)
            embed.add_field(name="Level", value=str(level), inline=True)
            embed.add_field(name="XP", value=f"{current_xp:,} / {needed_xp:,}", inline=True)
            embed.add_field(name="Progress", value=f"{bar}\n📨 {msg_count:,} • 🎙 {voice_mins:,}m • 😄 {react_count:,} • Total: {total_xp:,} XP", inline=False)
            embed.set_thumbnail(url=target.display_avatar.url)
            await interaction.response.send_message(embed=embed)

    @app_commands.command(name="leaderboard", description="View the server's XP leaderboard.")
    async def leaderboard(self, interaction: discord.Interaction):
        config = load_level_config(interaction.guild.id)
        if not config.get("enabled", False):
            return await interaction.response.send_message("The Level System is not enabled on this server.", ephemeral=True)

        top = get_leaderboard(interaction.guild.id, 10)
        if not top:
            return await interaction.response.send_message("No one has earned XP yet!", ephemeral=True)

        desc_lines = []
        for i, entry in enumerate(top, 1):
            uid = entry.get("user_id")
            xp = entry.get("total_xp", 0)
            lvl = level_from_xp(xp)
            member = interaction.guild.get_member(uid)
            name = member.display_name if member else f"User#{uid}"
            medal = ["🥇", "🥈", "🥉"][i-1] if i <= 3 else f"`#{i}`"
            desc_lines.append(f"{medal} **{name}** — Level {lvl} • {xp:,} XP")

        embed = discord.Embed(
            title="🏆 XP Leaderboard",
            description="\n".join(desc_lines),
            color=0x3B82F6
        )
        embed.set_footer(text=interaction.guild.name, icon_url=interaction.guild.icon.url if interaction.guild.icon else None)

        await interaction.response.send_message(embed=embed)


async def setup(bot: commands.Bot):
    await bot.add_cog(LevelCommandsCog(bot))
