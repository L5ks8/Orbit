import random
import discord
from discord import app_commands
from discord.ext import commands
from Components.Commands.Minigames.minigames import minigames_group
from Components.Commands.Economy._storage import (
    load_economy_config,
    get_user_balance,
    add_user_balance,
    remove_user_balance
)
from Components.Systems.Level._storage import grant_minigame_xp

# Unicode dice faces
DICE_FACES = {
    1: "⚀", 2: "⚁", 3: "⚂", 4: "⚃", 5: "⚄", 6: "⚅"
}

class DiceView(discord.ui.View):
    def __init__(self, guild_id: int, player: discord.abc.User, bet_amount: int):
        super().__init__(timeout=60)
        self.guild_id = guild_id
        self.player = player
        self.bet_amount = bet_amount
        self.outcome_text = ""
        self.result_dice = (1, 1)
        self.game_over = False
        self.money_processed = False

    async def roll(self, interaction: discord.Interaction):
        if not self.game_over:
            # Deduct the bet
            remove_user_balance(self.guild_id, self.player.id, self.bet_amount)

            # Roll two dice
            d1 = random.randint(1, 6)
            d2 = random.randint(1, 6)
            self.result_dice = (d1, d2)
            self.game_over = True

            cfg = load_economy_config(self.guild_id)
            sym = cfg.get("currency_symbol", "")
            
            dice_sum = d1 + d2
            is_doubles = (d1 == d2)

            if is_doubles:
                payout = self.bet_amount * 3
                add_user_balance(self.guild_id, self.player.id, payout)
                self.outcome_text = f"You rolled **Doubles**! You won **{sym} {payout:,}**."
                self.money_processed = True
                if interaction.guild and interaction.user:
                    xp_earned = await grant_minigame_xp(interaction.guild, interaction.user, interaction.channel, 30)
                    if xp_earned > 0:
                        self.outcome_text += f" *( +{xp_earned} XP)*"
                        
            elif dice_sum > 7:
                payout = int(self.bet_amount * 1.5)
                add_user_balance(self.guild_id, self.player.id, payout)
                self.outcome_text = f"You rolled a **{dice_sum}**! You won **{sym} {payout:,}**."
                self.money_processed = True
                if interaction.guild and interaction.user:
                    xp_earned = await grant_minigame_xp(interaction.guild, interaction.user, interaction.channel, 15)
                    if xp_earned > 0:
                        self.outcome_text += f" *( +{xp_earned} XP)*"
                        
            else:
                self.outcome_text = f"You rolled a **{dice_sum}**... You lost **{sym} {self.bet_amount:,}**."
                self.money_processed = True
                if interaction.guild and interaction.user:
                    await grant_minigame_xp(interaction.guild, interaction.user, interaction.channel, 5)

        self.clear_items()
        
        btn_roll = discord.ui.Button(label=f"Roll Again ({self.bet_amount:,})", style=discord.ButtonStyle.primary, custom_id="play_again")
        async def _roll_cb(inter: discord.Interaction):
            if inter.user.id != self.player.id:
                return await inter.response.send_message(embed=make_embed("This is not your game!", discord.Color.red()), ephemeral=True)
            await inter.response.defer()
            new_view = DiceView(self.guild_id, self.player, self.bet_amount)
            await new_view.roll(inter)
        btn_roll.callback = _roll_cb
        self.add_item(btn_roll)

        # Update message
        d1, d2 = self.result_dice
        dice_str = f"{DICE_FACES[d1]} {DICE_FACES[d2]}"
        embed = discord.Embed(title="Orbit Casino: Dice Roll", description=self.outcome_text, color=discord.Color.blue())
        embed.add_field(name="Result", value=f"{dice_str} ({d1 + d2})", inline=True)
        embed.add_field(name="Player", value=self.player.mention, inline=False)
        await interaction.edit_original_response(embed=embed, view=self)



async def minigame_check(ctx):
    if not ctx.guild:
        return True
    from Components.Commands.Economy._storage import load_economy_config
    config = load_economy_config(ctx.guild.id)
    if not config.get("enabled", True):
        await ctx.send(embed=make_embed("The Money system isn't Configured on this server"), ephemeral=True)
        return False
    return True


@commands.check(minigame_check)
@minigames_group.command(name="dice", description="Bet money and roll two dice (`/dice <bet>`).")
@app_commands.describe(bet="Amount of money to bet")
async def dice_cmd(ctx: commands.Context, bet: int):
    await ctx.defer()
    
    if not ctx.guild:
        return await ctx.send(embed=make_embed("This command must be run inside a server.", discord.Color.red()))

    if bet < 1:
        return await ctx.send(embed=make_embed("Bet amount must be at least 1.", discord.Color.red()))

    cfg = load_economy_config(ctx.guild.id)
    sym = cfg.get("currency_symbol", "")

    if cfg.get("bet_limit_enabled", True):
        max_bet = cfg.get("bet_limit_amount", 10000)
        if bet > max_bet:
            return await ctx.send(embed=make_embed(f"The maximum bet limit on this server is **{sym} {max_bet:,}**."))

    bal = get_user_balance(ctx.guild.id, ctx.author.id)
    if bal < bet:
        return await ctx.send(embed=make_embed(f"You don't have enough money! Your balance is **{sym} {bal:,}**."))

    # Create view and simulate first roll
    view = DiceView(ctx.guild.id, ctx.author, bet)
    
    embed = discord.Embed(title="Orbit Casino: Dice Roll", description=f"Rolling the dice... \n**Bet:** {bet:,}", color=discord.Color.blue())
    embed.add_field(name="Player", value=ctx.author.mention, inline=False)
    msg = await ctx.send(embed=embed)

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
    from Components.Commands._utils import make_embed
    await asyncio.sleep(1.5)
    await view.roll(dummy_inter)


async def setup(bot):
    pass
