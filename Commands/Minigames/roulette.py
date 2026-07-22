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

class RouletteView(discord.ui.View):
    def __init__(self, guild_id: int, player: discord.abc.User, bet_amount: int, choice: str):
        super().__init__(timeout=60)
        self.guild_id = guild_id
        self.player = player
        self.bet_amount = bet_amount
        self.choice = choice.lower()
        self.outcome_text = ""
        self.result_color = ""
        self.game_over = False
        self.money_processed = False

    async def spin(self, interaction: discord.Interaction):
        if not self.game_over:
            # Deduct the bet
            remove_user_balance(self.guild_id, self.player.id, self.bet_amount)

            # Spin roulette (0-36)
            # 18 Red, 18 Black, 1 Green (0)
            roll = random.randint(0, 36)
            if roll == 0:
                self.result_color = "green"
            elif roll % 2 == 0:
                self.result_color = "black"
            else:
                self.result_color = "red"

            self.game_over = True

            cfg = load_economy_config(self.guild_id)
            sym = cfg.get("currency_symbol", "🪙")

            if self.result_color == self.choice:
                if self.choice == "green":
                    payout = self.bet_amount * 14
                else:
                    payout = self.bet_amount * 2
                
                add_user_balance(self.guild_id, self.player.id, payout)
                self.outcome_text = f"The wheel landed on **{self.result_color.capitalize()}**! You won **{sym} {payout:,}**."
                self.money_processed = True
                
                if interaction.guild and interaction.user:
                    xp_earned = await grant_minigame_xp(interaction.guild, interaction.user, interaction.channel, 25)
                    if xp_earned > 0:
                        self.outcome_text += f" *(✨ +{xp_earned} XP)*"
            else:
                self.outcome_text = f"The wheel landed on **{self.result_color.capitalize()}**... You lost **{sym} {self.bet_amount:,}**."
                self.money_processed = True
                if interaction.guild and interaction.user:
                    await grant_minigame_xp(interaction.guild, interaction.user, interaction.channel, 5)

        self.clear_items()
        
        btn_red = discord.ui.Button(label=f"Bet Red ({self.bet_amount:,})", style=discord.ButtonStyle.danger, custom_id="play_red")
        async def _red_cb(inter: discord.Interaction):
            if inter.user.id != self.player.id:
                return await inter.response.send_message("This is not your game!", ephemeral=True)
            await inter.response.defer()
            new_view = RouletteView(self.guild_id, self.player, self.bet_amount, "red")
            await new_view.spin(inter)
        btn_red.callback = _red_cb
        self.add_item(btn_red)

        btn_black = discord.ui.Button(label=f"Bet Black ({self.bet_amount:,})", style=discord.ButtonStyle.secondary, custom_id="play_black")
        async def _black_cb(inter: discord.Interaction):
            if inter.user.id != self.player.id:
                return await inter.response.send_message("This is not your game!", ephemeral=True)
            await inter.response.defer()
            new_view = RouletteView(self.guild_id, self.player, self.bet_amount, "black")
            await new_view.spin(inter)
        btn_black.callback = _black_cb
        self.add_item(btn_black)

        btn_green = discord.ui.Button(label=f"Bet Green ({self.bet_amount:,})", style=discord.ButtonStyle.success, custom_id="play_green")
        async def _green_cb(inter: discord.Interaction):
            if inter.user.id != self.player.id:
                return await inter.response.send_message("This is not your game!", ephemeral=True)
            await inter.response.defer()
            new_view = RouletteView(self.guild_id, self.player, self.bet_amount, "green")
            await new_view.spin(inter)
        btn_green.callback = _green_cb
        self.add_item(btn_green)

        # Update message
        from Embeds import get_command_embed
        kwargs = get_command_embed(
            self.guild_id, "roulette", msg_type="game",
            player=self.player,
            outcome_text=self.outcome_text,
            result=self.result_color,
            choice=self.choice,
            view=self
        )
        await interaction.edit_original_response(**kwargs)

class RouletteCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="roulette", description="Bet money and spin the roulette wheel (`/roulette <bet> <color>`).")
    @app_commands.describe(
        bet="Amount of money to bet",
        choice="Red, Black, or Green"
    )
    @app_commands.choices(choice=[
        app_commands.Choice(name="Red (2x)", value="red"),
        app_commands.Choice(name="Black (2x)", value="black"),
        app_commands.Choice(name="Green (14x)", value="green")
    ])
    async def roulette_cmd(self, ctx: commands.Context, bet: int, choice: str):
        await ctx.defer()
        
        choice_val = getattr(choice, "value", choice).lower()
        if choice_val not in ["red", "black", "green"]:
            return await ctx.send("Choice must be Red, Black, or Green.")

        
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

        # Create view and simulate first spin
        view = RouletteView(ctx.guild.id, ctx.author, bet, choice_val)
        
        from Embeds import get_command_embed
        initial_kwargs = get_command_embed(
            ctx.guild.id, "roulette", msg_type="spin",
            player=ctx.author,
            choice=choice_val,
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
        await asyncio.sleep(2.0)
        await view.spin(dummy_inter)

async def setup(bot):
    await bot.add_cog(RouletteCommand(bot))
