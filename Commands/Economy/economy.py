import time
import random
import discord
from discord import app_commands
from discord.ext import commands
from Commands.Economy._storage import (
    load_economy_config,
    get_user_balance,
    claim_daily,
    claim_work,
    get_user_economy,
    set_user_economy,
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

    @commands.hybrid_command(name="work", description="Work a job to earn money!")
    async def work(self, ctx: commands.Context):
        if not ctx.guild:
            return await ctx.send("This command must be run inside a server.", ephemeral=True)

        config = load_economy_config(ctx.guild.id)
        if not config.get("enabled", True) or not config.get("work_enabled", True):
            return await ctx.send("The work command is currently disabled on this server.", ephemeral=True)

        symbol = config.get("currency_symbol", "🪙")
        success, amount, template, cooldown_rem = claim_work(ctx.guild.id, ctx.author.id)

        if not success:
            next_time = int(time.time()) + cooldown_rem
            embed = discord.Embed(
                title="Work Cooldown",
                description=f"You are exhausted from your last shift!\nYou can work again <t:{next_time}:R>.",
                color=discord.Color.red()
            )
            return await ctx.send(embed=embed, ephemeral=True)

        resp_text = template.format(symbol=symbol, amount=amount)
        cooldown_min = int(config.get("work_cooldown_min", 240))
        next_work = int(time.time()) + (cooldown_min * 60)

        embed = discord.Embed(
            title="Work Completed!",
            description=f"💼 {resp_text}\n\n⏰ **Next Shift:** <t:{next_work}:R>",
            color=discord.Color.green()
        )
        embed.set_thumbnail(url=ctx.author.display_avatar.url)

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
        embed.set_footer(text="Use /daily and /work to earn money every day!")

        await ctx.send(embed=embed)

    @commands.hybrid_command(name="inventory", aliases=["inv", "items"], description="View your inventory items and chests.")
    async def inventory(self, ctx: commands.Context):
        if not ctx.guild:
            return await ctx.send("This command must be run inside a server.", ephemeral=True)

        config = load_economy_config(ctx.guild.id)
        symbol = config.get("currency_symbol", "🪙")
        user_data = get_user_economy(ctx.guild.id, ctx.author.id)
        inv = user_data.get("inventory", [])

        if not inv:
            embed = discord.Embed(
                title=f"🎒 {ctx.author.display_name}'s Inventory",
                description="Your inventory is empty! Earn money with `/work` or `/daily` to acquire chests and items.",
                color=discord.Color.blue()
            )
            embed.set_thumbnail(url=ctx.author.display_avatar.url)
            return await ctx.send(embed=embed)

        item_counts = {}
        for item_id in inv:
            item_counts[item_id] = item_counts.get(item_id, 0) + 1

        all_items = {it.get("id"): it for it in config.get("items", [])}
        all_chests = {ch.get("id"): ch for ch in config.get("chests", [])}

        lines = []
        for iid, qty in item_counts.items():
            if iid in all_items:
                it = all_items[iid]
                lines.append(f"📦 **{it.get('name', iid)}** x{qty} — *{it.get('description', 'No description')}*")
            elif iid in all_chests:
                ch = all_chests[iid]
                lines.append(f"🧰 **{ch.get('name', iid)}** x{qty} (Chest) — Use `/chest open` to unlock!")
            else:
                lines.append(f"❓ `{iid}` x{qty}")

        embed = discord.Embed(
            title=f"🎒 {ctx.author.display_name}'s Inventory",
            description="\n".join(lines),
            color=discord.Color.blue()
        )
        embed.set_thumbnail(url=ctx.author.display_avatar.url)
        embed.set_footer(text=f"Wallet: {symbol} {user_data.get('balance', 0):,}")
        await ctx.send(embed=embed)

    @commands.hybrid_command(name="chest", description="Open a chest from your inventory.")
    @app_commands.describe(chest_name="Name or ID of the chest to open")
    async def open_chest(self, ctx: commands.Context, chest_name: str):
        if not ctx.guild:
            return await ctx.send("This command must be run inside a server.", ephemeral=True)

        config = load_economy_config(ctx.guild.id)
        user_data = get_user_economy(ctx.guild.id, ctx.author.id)
        inv = user_data.get("inventory", [])

        chests = config.get("chests", [])
        target_chest = None
        for c in chests:
            if c.get("id", "").lower() == chest_name.lower() or c.get("name", "").lower() == chest_name.lower():
                target_chest = c
                break

        if not target_chest:
            return await ctx.send(f"Chest `{chest_name}` not found on this server.", ephemeral=True)

        cid = target_chest.get("id")
        if cid not in inv:
            return await ctx.send(f"You do not have a **{target_chest.get('name')}** in your inventory!", ephemeral=True)

        rarity_weights = target_chest.get("rarity_weights", {})
        rarities = config.get("rarities", [])
        items = config.get("items", [])

        if not rarities or not items:
            return await ctx.send("No items or rarities configured for this chest yet.", ephemeral=True)

        # Roll rarity
        weighted_list = []
        for r in rarities:
            w = rarity_weights.get(r["id"], r.get("weight", 1))
            weighted_list.extend([r] * max(1, int(w)))

        chosen_rarity = random.choice(weighted_list)
        matching_items = [it for it in items if it.get("rarity_id") == chosen_rarity["id"]]
        if not matching_items:
            matching_items = items

        granted_item = random.choice(matching_items)

        # Consume chest and add item
        inv.remove(cid)
        inv.append(granted_item["id"])
        user_data["inventory"] = inv
        set_user_economy(ctx.guild.id, ctx.author.id, user_data)

        embed = discord.Embed(
            title="✨ Chest Opened!",
            description=(
                f"You opened a **{target_chest.get('name')}** and found:\n\n"
                f"🎁 **{granted_item.get('name')}** (`{chosen_rarity.get('name')}`)\n"
                f"*{granted_item.get('description', '')}*"
            ),
            color=discord.Color.from_str(chosen_rarity.get("color", "#7289DA"))
        )
        embed.set_thumbnail(url=ctx.author.display_avatar.url)
        await ctx.send(embed=embed)

async def setup(bot: commands.Bot):
    await bot.add_cog(EconomyCommand(bot))
