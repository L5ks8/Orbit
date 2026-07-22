import random
import discord
from discord import app_commands
from discord.ext import commands
from Commands.Economy._storage import (
    load_economy_config,
    get_user_balance,
    add_user_balance,
    remove_user_balance
)
from Commands.Level._storage import grant_minigame_xp

class CoinflipView(discord.ui.View):
    def __init__(self, guild_id: int, player: discord.abc.User, bet_amount: int, choice: str):
        super().__init__(timeout=60)
        self.guild_id = guild_id
        self.player = player
        self.bet_amount = bet_amount
        self.choice = choice.lower()
        self.outcome_text = ""
        self.result = ""
        self.game_over = False
        self.money_processed = False

    async def flip(self, interaction: discord.Interaction):
        if not self.game_over:
            # First, deduct the bet
            remove_user_balance(self.guild_id, self.player.id, self.bet_amount)

            # Flip the coin
            outcomes = ["heads", "tails"]
            self.result = random.choice(outcomes)
            self.game_over = True

            cfg = load_economy_config(self.guild_id)
            sym = cfg.get("currency_symbol", "🪙")

            if self.result == self.choice:
                payout = self.bet_amount * 2
                add_user_balance(self.guild_id, self.player.id, payout)
                self.outcome_text = f"The coin landed on **{self.result.capitalize()}**! You won **{sym} {payout:,}**."
                self.money_processed = True
                
                if interaction.guild and interaction.user:
                    xp_earned = await grant_minigame_xp(interaction.guild, interaction.user, interaction.channel, 20)
                    if xp_earned > 0:
                        self.outcome_text += f" *(✨ +{xp_earned} XP)*"
            else:
                self.outcome_text = f"The coin landed on **{self.result.capitalize()}**... You lost **{sym} {self.bet_amount:,}**."
                self.money_processed = True
                if interaction.guild and interaction.user:
                    await grant_minigame_xp(interaction.guild, interaction.user, interaction.channel, 5)

        self.clear_items()
        
        btn_heads = discord.ui.Button(label=f"Play Again: Heads ({self.bet_amount:,})", style=discord.ButtonStyle.primary, custom_id="play_heads")
        async def _heads_cb(inter: discord.Interaction):
            if inter.user.id != self.player.id:
                return await inter.response.send_message("This is not your game!", ephemeral=True)
            await inter.response.defer()
            new_view = CoinflipView(self.guild_id, self.player, self.bet_amount, "heads")
            await new_view.flip(inter)
        btn_heads.callback = _heads_cb
        self.add_item(btn_heads)

        btn_tails = discord.ui.Button(label=f"Play Again: Tails ({self.bet_amount:,})", style=discord.ButtonStyle.primary, custom_id="play_tails")
        async def _tails_cb(inter: discord.Interaction):
            if inter.user.id != self.player.id:
                return await inter.response.send_message("This is not your game!", ephemeral=True)
            await inter.response.defer()
            new_view = CoinflipView(self.guild_id, self.player, self.bet_amount, "tails")
            await new_view.flip(inter)
        btn_tails.callback = _tails_cb
        self.add_item(btn_tails)

        # Update message
        from Embeds import get_command_embed
        kwargs = get_command_embed(
            self.guild_id, "coinflip", msg_type="game",
            player=self.player,
            outcome_text=self.outcome_text,
            result=self.result,
            choice=self.choice,
            view=self
        )
        await interaction.edit_original_response(**kwargs)

class CoinflipCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="coinflip", description="Bet money and flip a coin (`/coinflip <bet> <heads/tails>`).")
    @app_commands.describe(
        bet="Amount of money to bet",
        choice="Heads or Tails"
    )
    @app_commands.choices(choice=[
        app_commands.Choice(name="Heads", value="heads"),
        app_commands.Choice(name="Tails", value="tails")
    ])
    async def coinflip_cmd(self, ctx: commands.Context, bet: int, choice: app_commands.Choice[str]):
        await ctx.defer()
        
        if not ctx.guild:
            return await ctx.send("This command must be run inside a server.")

        if bet < 1:
            return await ctx.send("Bet amount must be at least 1.")

        cfg = load_economy_config(ctx.guild.id)
        sym = cfg.get("currency_symbol", "🪙")

        if cfg.get("bet_limit_enabled", True):
            max_bet = cfg.get("bet_limit_amount", 10000)
            if bet > max_bet:
                return await ctx.send(f"The maximum bet limit on this server is **{sym} {max_bet:,}**.")

        bal = get_user_balance(ctx.guild.id, ctx.author.id)
        if bal < bet:
            return await ctx.send(f"You don't have enough money! Your balance is **{sym} {bal:,}**.")

        # Create view and simulate first flip
        view = CoinflipView(ctx.guild.id, ctx.author, bet, choice.value)
        
        from Embeds import get_command_embed
        initial_kwargs = get_command_embed(
            ctx.guild.id, "coinflip", msg_type="spin",
            player=ctx.author,
            choice=choice.value,
            bet=bet
        )
        msg = await ctx.send(**initial_kwargs)

        class DummyInteraction:
            def __init__(self, m, u, g, c):
                self.message = m
                self.user = u
                self.guild = g
                self.channel = c
                self.guild_id = g.id
            async def edit_original_response(self, **kwargs):
                await self.message.edit(**kwargs)

        dummy_inter = DummyInteraction(msg, ctx.author, ctx.guild, ctx.channel)
        
        import asyncio
        await asyncio.sleep(1.5)
        await view.flip(dummy_inter)

async def setup(bot):
    await bot.add_cog(CoinflipCommand(bot))
