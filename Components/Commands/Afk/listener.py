import discord
from discord.ext import commands
from .storage import get_afk, remove_afk
from Components.Commands._utils import make_embed, make_v2_card, ORBIT_COLOR

class AfkListener(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_message(self, message: discord.Message):
        if message.author.bot or not message.guild:
            return

        if get_afk(message.guild.id, message.author.id):
            remove_afk(message.guild.id, message.author.id)
            card = make_v2_card(f"# AFK Removed\n\nWelcome back, {message.author.mention}! I've removed your AFK status.", color=ORBIT_COLOR)
            try:
                if card:
                    await message.reply(view=card, mention_author=False, delete_after=10, allowed_mentions=discord.AllowedMentions.none())
                else:
                    embed = discord.Embed(
                        title="AFK Removed", 
                        description=f"Welcome back, {message.author.mention}! I've removed your AFK status.", 
                        color=ORBIT_COLOR
                    )
                    await message.reply(embed=embed, mention_author=False, delete_after=10, allowed_mentions=discord.AllowedMentions.none())
            except Exception:
                pass

        targets = set(message.mentions)
        if message.reference and isinstance(message.reference.resolved, discord.Message):
            targets.add(message.reference.resolved.author)

        for user in targets:
            if user.id == message.author.id or user.bot:
                continue

            afk_data = get_afk(message.guild.id, user.id)
            if afk_data:
                reason = afk_data.get("reason", "AFK")
                ts = afk_data.get("timestamp", 0)
                since_text = f"\n**Since:** <t:{ts}:R>" if ts else ""
                card = make_v2_card(f"# AFK Notice\n\n{user.mention} is currently AFK.\n\n**Reason:** {reason}{since_text}", color=ORBIT_COLOR)
                try:
                    if card:
                        await message.reply(view=card, mention_author=False, allowed_mentions=discord.AllowedMentions.none())
                    else:
                        embed = discord.Embed(title="AFK Notice", description=f"{user.mention} is currently AFK.", color=ORBIT_COLOR)
                        embed.add_field(name="Reason", value=reason, inline=False)
                        if ts:
                            embed.add_field(name="Since", value=f"<t:{ts}:R>", inline=False)
                        await message.reply(embed=embed, mention_author=False, allowed_mentions=discord.AllowedMentions.none())
                except Exception as e:
                    print(f"Failed to reply AFK notice: {e}")

async def setup(bot: commands.Bot):
    await bot.add_cog(AfkListener(bot))
