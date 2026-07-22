import time
import discord
from discord import app_commands
from discord.ext import commands
from Commands.Economy._storage import (
    load_economy_config,
    get_user_balance,
    claim_daily,
    get_economy_leaderboard
)

class EconomyCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="bal", aliases=["balance", "money"], description="Check your or another member's balance.")
    @app_commands.describe(user="Optional member to check balance for")
    async def balance(self, ctx: commands.Context, user: discord.Member | None = None):
        target = user or ctx.author
        if not ctx.guild:
            return await ctx.send("This command must be run inside a server.", ephemeral=True)

        config = load_economy_config(ctx.guild.id)
        symbol = config.get("currency_symbol", "🪙")
        bal = get_user_balance(ctx.guild.id, target.id)

        is_self = (target.id == ctx.author.id)
        title = "Your Wallet" if is_self else f"{target.display_name}'s Wallet"

        embed = discord.Embed(
            title=title,
            color=discord.Color.gold()
        )
        embed.add_field(
            name="Balance",
            value=f"**{symbol} {bal:,}**",
            inline=False
        )
        embed.set_thumbnail(url=target.display_avatar.url)
        embed.set_footer(text=f"Server: {ctx.guild.name}")

        await ctx.send(embed=embed)

    @commands.hybrid_command(name="daily", description="Claim your daily money reward!")
    async def daily(self, ctx: commands.Context):
        if not ctx.guild:
            return await ctx.send("This command must be run inside a server.", ephemeral=True)

        config = load_economy_config(ctx.guild.id)
        if not config.get("enabled", True):
            return await ctx.send("The economy system is currently disabled on this server.", ephemeral=True)

        symbol = config.get("currency_symbol", "🪙")
        success, amount, streak, cooldown_rem = claim_daily(ctx.guild.id, ctx.author.id)

        if not success:
            next_time = int(time.time()) + cooldown_rem
            embed = discord.Embed(
                title="Daily Reward Cooldown",
                description=f"You have already claimed your daily reward!\nCome back <t:{next_time}:R> to claim again.",
                color=discord.Color.red()
            )
            return await ctx.send(embed=embed, ephemeral=True)

        next_claim = int(time.time()) + 86400
        embed = discord.Embed(
            title="Daily Reward Claimed!",
            description=(
                f"You received **{symbol} {amount:,}**!\n\n"
                f"🔥 **Streak:** `Day {streak}`\n"
                f"⏰ **Next Claim:** <t:{next_claim}:R>"
            ),
            color=discord.Color.green()
        )
        embed.set_thumbnail(url=ctx.author.display_avatar.url)
        embed.set_footer(text="Keep claiming daily to increase your streak bonus!")

        await ctx.send(embed=embed)

    @commands.hybrid_command(name="baltop", aliases=["leaderboard", "moneytop"], description="View the server's money leaderboard.")
    async def baltop(self, ctx: commands.Context):
        if not ctx.guild:
            return await ctx.send("This command must be run inside a server.", ephemeral=True)

        config = load_economy_config(ctx.guild.id)
        symbol = config.get("currency_symbol", "🪙")
        leaderboard_data = get_economy_leaderboard(ctx.guild.id, limit=10)

        if not leaderboard_data:
            return await ctx.send("No economy data found for this server yet.", ephemeral=True)

        medals = ["🥇", "🥈", "🥉"]
        lines = []

        for idx, entry in enumerate(leaderboard_data, 1):
            uid = entry.get("user_id")
            bal = entry.get("balance", 0)
            prefix = medals[idx - 1] if idx <= 3 else f"`{idx}.`"

            member = ctx.guild.get_member(uid)
            display_name = member.display_name if member else f"User ID {uid}"

            lines.append(f"{prefix} **{display_name}** — {symbol} `{bal:,}`")

        embed = discord.Embed(
            title=f"🏆 {ctx.guild.name} — Wealth Leaderboard",
            description="\n".join(lines),
            color=discord.Color.gold()
        )
        embed.set_thumbnail(url=ctx.guild.icon.url if ctx.guild.icon else "")
        embed.set_footer(text="Use /daily to earn free money every day!")

        await ctx.send(embed=embed)

async def setup(bot: commands.Bot):
    await bot.add_cog(EconomyCommand(bot))
