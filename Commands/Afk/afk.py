import discord
from discord.ext import commands
from Commands.Afk._storage import set_afk, get_afk
from Commands._utils import make_embed



class AfkCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="afk", description="Sets your AFK status with an optional reason.")
    async def afk(self, ctx: commands.Context, *, reason: str = "AFK"):
        if not ctx.guild:
            return await ctx.send(embed=make_embed("This command can only be used inside a server.", discord.Color.red()), ephemeral=True)

        set_afk(ctx.guild.id, ctx.author.id, reason)
        embed = discord.Embed(title="AFK Status Enabled", color=discord.Color.green())
        embed.add_field(name="User", value=f"{ctx.author.mention} (`{ctx.author.id}`)", inline=False)
        embed.add_field(name="Reason", value=reason, inline=False)
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

    @commands.Cog.listener()
    async def on_message(self, message: discord.Message):
        if message.author.bot or not message.guild:
            return

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
                embed = discord.Embed(title="AFK Notice", description=f"{user.mention} is currently AFK.", color=discord.Color.orange())
                embed.add_field(name="Reason", value=reason, inline=False)
                if ts:
                    embed.add_field(name="Since", value=f"<t:{ts}:R>", inline=False)
                try:
                    await message.reply(embed=embed, mention_author=False, allowed_mentions=discord.AllowedMentions.none())
                except Exception as e:
                    print(f"Failed to reply AFK notice: {e}")

async def setup(bot: commands.Bot):
    await bot.add_cog(AfkCommand(bot))
