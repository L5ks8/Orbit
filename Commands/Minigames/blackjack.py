import random
import discord
from discord.ext import commands


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
    def __init__(self, player: discord.abc.User, guild_id: int = 0):
        self.player = player
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
            elif p_score == 21:
                self.outcome_text = "**BLACKJACK!** You dealt 21 right out of the gate! You win!"
                self.base_xp = 80
            else:
                self.outcome_text = "**Dealer Blackjack!** The dealer opened with 21. Dealer wins!"
                self.base_xp = 0

    def hit_player(self):
        self.player_hand.append(self.deck.pop())
        self.can_double = False
        if calculate_score(self.player_hand) > 21:
            self.game_over = True
            self.outcome_text = "**BUST!** Your hand exceeded 21. Dealer wins!"
            self.base_xp = 0
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
        elif p_score > d_score:
            self.outcome_text = f"**YOU WIN!** Your hand (`{p_score}`) beat the dealer's (`{d_score}`)!"
            self.base_xp = 40
        elif d_score > p_score:
            self.outcome_text = f"**DEALER WINS!** Dealer's (`{d_score}`) beat your hand (`{p_score}`)!"
            self.base_xp = 0
        else:
            self.outcome_text = f"**PUSH!** Both hands tied at `{p_score}`. It's a draw!"
            self.base_xp = 10

    def double_down(self):
        self.player_hand.append(self.deck.pop())
        self.can_double = False
        if calculate_score(self.player_hand) > 21:
            self.game_over = True
            self.outcome_text = "**DOUBLE DOWN BUST!** You drew one card and went over 21. Dealer wins!"
            self.base_xp = 0
        else:
            self.stand_player()
            if self.base_xp == 40:
                self.base_xp = 60

class BlackjackLayoutView(discord.ui.View):
    def __init__(self, session: BlackjackSession, guild_id: int = 0):
        super().__init__(timeout=300)
        self.session = session
        self.guild_id = guild_id or session.guild_id

    async def process_xp(self, interaction: discord.Interaction):
        if self.session.game_over and self.session.base_xp > 0 and not self.session.xp_awarded:
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
            status_text = "**Your Turn!** Choose whether to Hit, Stand, or Double Down below."
        else:
            d_cards_str = " ".join(str(c) for c in self.session.dealer_hand)
            d_info = f"**Dealer Hand (`Final Score: {d_score}`):**\n> {d_cards_str}"
            status_text = self.session.outcome_text

        p_info = f"**Your Hand (`Score: {p_score}`):**\n> {p_cards_str}"

        btn_hit = discord.ui.Button(label="Hit", style=discord.ButtonStyle.primary, disabled=self.session.game_over)
        btn_stand = discord.ui.Button(label="Stand", style=discord.ButtonStyle.secondary, disabled=self.session.game_over)
        btn_double = discord.ui.Button(label="Double Down", style=discord.ButtonStyle.success, disabled=(self.session.game_over or not self.session.can_double))
        btn_new = discord.ui.Button(label="Play Again", style=discord.ButtonStyle.primary, disabled=not self.session.game_over)

        async def _hit_cb(interaction: discord.Interaction):
            if interaction.user.id != self.session.player.id:
                return await interaction.response.send_message("This is not your blackjack hand! Use `/blackjack` to start your own game.", ephemeral=True)
            self.session.hit_player()
            await self.process_xp(interaction)
            await interaction.response.edit_message(**self.get_kwargs())

        async def _stand_cb(interaction: discord.Interaction):
            if interaction.user.id != self.session.player.id:
                return await interaction.response.send_message("This is not your blackjack hand! Use `/blackjack` to start your own game.", ephemeral=True)
            self.session.stand_player()
            await self.process_xp(interaction)
            await interaction.response.edit_message(**self.get_kwargs())

        async def _double_cb(interaction: discord.Interaction):
            if interaction.user.id != self.session.player.id:
                return await interaction.response.send_message("This is not your blackjack hand! Use `/blackjack` to start your own game.", ephemeral=True)
            self.session.double_down()
            await self.process_xp(interaction)
            await interaction.response.edit_message(**self.get_kwargs())

        async def _new_cb(interaction: discord.Interaction):
            if interaction.user.id != self.session.player.id:
                return await interaction.response.send_message("This is not your blackjack hand! Use `/blackjack` to start your own game.", ephemeral=True)
            self.session = BlackjackSession(self.session.player, guild_id=self.guild_id)
            await self.process_xp(interaction)
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

    @commands.hybrid_command(name="blackjack", description="Play an interactive V2 Blackjack game (`/blackjack`).")
    async def blackjack_cmd(self, ctx: commands.Context):
        guild_id = ctx.guild.id if ctx.guild else 0
        session = BlackjackSession(ctx.author, guild_id=guild_id)
        if session.game_over and session.base_xp > 0 and not session.xp_awarded and ctx.guild and ctx.author:
            session.xp_awarded = True
            from Commands.Level._storage import grant_minigame_xp
            earned = await grant_minigame_xp(ctx.guild, ctx.author, ctx.channel, session.base_xp)
            if earned > 0:
                session.outcome_text += f" *(✨ +{earned} XP)*"
        view = BlackjackLayoutView(session, guild_id=guild_id)
        await ctx.send(**view.get_kwargs(), allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    await bot.add_cog(BlackjackCommand(bot))

