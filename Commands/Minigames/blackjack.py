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

SUITS = ["♠️", "♥️", "♦️", "♣️"]
RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]

class Card:
    def __init__(self, rank: str, suit: str):
        self.rank = rank
        self.suit = suit

    def get_value(self) -> int:
        if self.rank in ["J", "Q", "K"]:
            return 10
        elif self.rank == "A":
            return 11
        else:
            return int(self.rank)

    def __str__(self):
        return f"`{self.rank}{self.suit}`"

def calculate_score(hand: list[Card]) -> int:
    total = sum(c.get_value() for c in hand)
    aces = sum(1 for c in hand if c.rank == "A")
    while total > 21 and aces > 0:
        total -= 10
        aces -= 1
    return total

class BlackjackSession:
    def __init__(self, player: discord.abc.User, bet_amount: int, guild_id: int = 0):
        self.player = player
        self.bet_amount = bet_amount
        self.total_bet = bet_amount
        self.guild_id = guild_id
        self.deck = [Card(r, s) for s in SUITS for r in RANKS]
        random.shuffle(self.deck)
        self.player_hand: list[Card] = []
        self.dealer_hand: list[Card] = []
        self.game_over = False
        self.outcome_text = ""
        self.can_double = True
        self.base_xp = 0
        self.xp_awarded = False
        self.payout_mult = 0.0
        self.money_processed = False

        self.player_hand.append(self.deck.pop())
        self.dealer_hand.append(self.deck.pop())
        self.player_hand.append(self.deck.pop())
        self.dealer_hand.append(self.deck.pop())

        p_score = calculate_score(self.player_hand)
        d_score = calculate_score(self.dealer_hand)

        if p_score == 21 or d_score == 21:
            self.game_over = True
            self.can_double = False
            if p_score == 21 and d_score == 21:
                self.outcome_text = "**Push!** Both you and the dealer hit natural Blackjack (21). It's a draw!"
                self.base_xp = 10
                self.payout_mult = 1.0
            elif p_score == 21:
                self.outcome_text = "**BLACKJACK!** You dealt 21 right out of the gate! You win!"
                self.base_xp = 80
                self.payout_mult = 2.5
            else:
                self.outcome_text = "**Dealer Blackjack!** The dealer opened with 21. Dealer wins!"
                self.base_xp = 0
                self.payout_mult = 0.0

    def hit_player(self):
        self.player_hand.append(self.deck.pop())
        self.can_double = False
        if calculate_score(self.player_hand) > 21:
            self.game_over = True
            self.outcome_text = "**BUST!** Your hand exceeded 21. Dealer wins!"
            self.base_xp = 0
            self.payout_mult = 0.0
        elif calculate_score(self.player_hand) == 21:
            self.stand_player()

    def stand_player(self):
        self.game_over = True
        self.can_double = False
        while calculate_score(self.dealer_hand) < 17:
            self.dealer_hand.append(self.deck.pop())

        p_score = calculate_score(self.player_hand)
        d_score = calculate_score(self.dealer_hand)

        if d_score > 21:
            self.outcome_text = f"**Dealer BUST (`{d_score}`)!** You win the hand!"
            self.base_xp = 40
            self.payout_mult = 2.0
        elif p_score > d_score:
            self.outcome_text = f"**YOU WIN!** Your hand (`{p_score}`) beat the dealer's (`{d_score}`)!"
            self.base_xp = 40
            self.payout_mult = 2.0
        elif d_score > p_score:
            self.outcome_text = f"**DEALER WINS!** Dealer's (`{d_score}`) beat your hand (`{p_score}`)!"
            self.base_xp = 0
            self.payout_mult = 0.0
        else:
            self.outcome_text = f"**PUSH!** Both hands tied at `{p_score}`. It's a draw!"
            self.base_xp = 10
            self.payout_mult = 1.0

    def double_down(self):
        self.player_hand.append(self.deck.pop())
        self.can_double = False
        if calculate_score(self.player_hand) > 21:
            self.game_over = True
            self.outcome_text = "**DOUBLE DOWN BUST!** You drew one card and went over 21. Dealer wins!"
            self.base_xp = 0
            self.payout_mult = 0.0
        else:
            self.stand_player()
            if self.base_xp == 40:
                self.base_xp = 60

class BlackjackLayoutView(discord.ui.View):
    def __init__(self, session: BlackjackSession, guild_id: int = 0):
        super().__init__(timeout=300)
        self.session = session
        self.guild_id = guild_id or session.guild_id

    async def process_payout_and_xp(self, interaction: discord.Interaction):
        if not self.session.game_over:
            return

        gid = interaction.guild_id or self.guild_id
        cfg = load_economy_config(gid)
        sym = cfg.get("currency_symbol", "🪙")

        if not self.session.money_processed:
            self.session.money_processed = True
            payout = int(self.session.total_bet * self.session.payout_mult) if self.session.payout_mult != 2.5 else int(2.5 * self.session.bet_amount)
            if payout > 0:
                add_user_balance(gid, interaction.user.id, payout)

            net = payout - self.session.total_bet
            if net > 0:
                self.session.outcome_text += f"\n💰 **Won:** {sym} {payout:,} *(Net: +{sym} {net:,})*"
            elif net == 0 and payout > 0:
                self.session.outcome_text += f"\n💰 **Returned:** {sym} {payout:,}"
            else:
                self.session.outcome_text += f"\n💸 **Lost:** {sym} {self.session.total_bet:,}"

        if self.session.base_xp > 0 and not self.session.xp_awarded:
            self.session.xp_awarded = True
            if interaction.guild and interaction.user:
                from Commands.Level._storage import grant_minigame_xp
                earned = await grant_minigame_xp(interaction.guild, interaction.user, interaction.channel, self.session.base_xp)
                if earned > 0:
                    self.session.outcome_text += f" *(✨ +{earned} XP)*"

    def get_kwargs(self):
        p_score = calculate_score(self.session.player_hand)
        d_score = calculate_score(self.session.dealer_hand)

        p_cards_str = " ".join(str(c) for c in self.session.player_hand)
        if not self.session.game_over:
            d_cards_str = f"{self.session.dealer_hand[0]} `[ ? ]`"
            d_visible_score = self.session.dealer_hand[0].get_value()
            d_info = f"**Dealer Hand (`Score: {d_visible_score}+?`):**\n> {d_cards_str}"
            status_text = f"**Your Turn!** Bet: `{self.session.total_bet:,}`. Choose Hit, Stand, or Double Down below."
        else:
            d_cards_str = " ".join(str(c) for c in self.session.dealer_hand)
            d_info = f"**Dealer Hand (`Final Score: {d_score}`):**\n> {d_cards_str}"
            status_text = self.session.outcome_text

        p_info = f"**Your Hand (`Score: {p_score}`):**\n> {p_cards_str}"

        btn_hit = discord.ui.Button(label="Hit", style=discord.ButtonStyle.primary, disabled=self.session.game_over)
        btn_stand = discord.ui.Button(label="Stand", style=discord.ButtonStyle.secondary, disabled=self.session.game_over)
        btn_double = discord.ui.Button(label=f"Double Down ({self.session.bet_amount:,})", style=discord.ButtonStyle.success, disabled=(self.session.game_over or not self.session.can_double))
        btn_new = discord.ui.Button(label=f"Play Again ({self.session.bet_amount:,})", style=discord.ButtonStyle.primary, disabled=not self.session.game_over)

        async def _hit_cb(interaction: discord.Interaction):
            if interaction.user.id != self.session.player.id:
                return await interaction.response.send_message("This is not your blackjack hand! Use `/blackjack` to start your own game.", ephemeral=True)
            self.session.hit_player()
            await self.process_payout_and_xp(interaction)
            await interaction.response.edit_message(**self.get_kwargs())

        async def _stand_cb(interaction: discord.Interaction):
            if interaction.user.id != self.session.player.id:
                return await interaction.response.send_message("This is not your blackjack hand! Use `/blackjack` to start your own game.", ephemeral=True)
            self.session.stand_player()
            await self.process_payout_and_xp(interaction)
            await interaction.response.edit_message(**self.get_kwargs())

        async def _double_cb(interaction: discord.Interaction):
            if interaction.user.id != self.session.player.id:
                return await interaction.response.send_message("This is not your blackjack hand! Use `/blackjack` to start your own game.", ephemeral=True)

            gid = interaction.guild_id or self.guild_id
            cfg = load_economy_config(gid)
            sym = cfg.get("currency_symbol", "🪙")

            bal = get_user_balance(gid, interaction.user.id)
            if bal < self.session.bet_amount:
                return await interaction.response.send_message(f"You don't have enough money to double down! Balance: **{sym} {bal:,}**", ephemeral=True)

            remove_user_balance(gid, interaction.user.id, self.session.bet_amount)
            self.session.total_bet += self.session.bet_amount
            self.session.double_down()
            await self.process_payout_and_xp(interaction)
            await interaction.response.edit_message(**self.get_kwargs())

        async def _new_cb(interaction: discord.Interaction):
            if interaction.user.id != self.session.player.id:
                return await interaction.response.send_message("This is not your blackjack hand! Use `/blackjack` to start your own game.", ephemeral=True)

            gid = interaction.guild_id or self.guild_id
            cfg = load_economy_config(gid)
            sym = cfg.get("currency_symbol", "🪙")

            bal = get_user_balance(gid, interaction.user.id)
            if bal < self.session.bet_amount:
                return await interaction.response.send_message(f"You don't have enough money for this bet! Balance: **{sym} {bal:,}**", ephemeral=True)

            remove_user_balance(gid, interaction.user.id, self.session.bet_amount)
            self.session = BlackjackSession(self.session.player, bet_amount=self.session.bet_amount, guild_id=self.guild_id)
            await self.process_payout_and_xp(interaction)
            await interaction.response.edit_message(**self.get_kwargs())

        btn_hit.callback = _hit_cb
        btn_stand.callback = _stand_cb
        btn_double.callback = _double_cb
        btn_new.callback = _new_cb

        components = [btn_hit, btn_stand, btn_double] if not self.session.game_over else [btn_new]

        from Embeds import get_command_embed
        return get_command_embed(
            self.guild_id, "blackjack", msg_type="game",
            player=self.session.player, d_info=d_info, p_info=p_info,
            status_text=status_text, components=components
        )

class BlackjackCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="blackjack", description="Bet money and play an interactive V2 Blackjack game (`/blackjack <bet>`).")
    @app_commands.describe(bet="Amount of money to bet (e.g. 50)")
    async def blackjack_cmd(self, ctx: commands.Context, bet: int = 10):
        if not ctx.guild:
            return await ctx.send("This command must be run inside a server.", ephemeral=True)

        if bet < 1:
            return await ctx.send("Bet amount must be at least 1.", ephemeral=True)

        cfg = load_economy_config(ctx.guild.id)
        sym = cfg.get("currency_symbol", "🪙")

        if cfg.get("bet_limit_enabled", True):
            max_bet = cfg.get("bet_limit_amount", 10000)
            if bet > max_bet:
                return await ctx.send(f"The maximum bet limit on this server is **{sym} {max_bet:,}**.", ephemeral=True)

        bal = get_user_balance(ctx.guild.id, ctx.author.id)
        if bal < bet:
            return await ctx.send(f"You don't have enough money! Your balance is **{sym} {bal:,}**.", ephemeral=True)

        remove_user_balance(ctx.guild.id, ctx.author.id, bet)

        session = BlackjackSession(ctx.author, bet_amount=bet, guild_id=ctx.guild.id)

        view = BlackjackLayoutView(session, guild_id=ctx.guild.id)
        if session.game_over:
            await view.process_payout_and_xp(ctx.interaction if ctx.interaction else ctx)

        await ctx.send(**view.get_kwargs(), allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    await bot.add_cog(BlackjackCommand(bot))


