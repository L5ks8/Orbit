import discord
from discord.ext import commands
from discord.ui import Container, TextDisplay, Separator
from Commands.Afk._storage import set_afk, get_afk



class AfkCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="afk", description="Sets your AFK status with an optional reason.")
    async def afk(self, ctx: commands.Context, *, reason: str = "AFK"):
        if not ctx.guild:
            return await ctx.send("This command can only be used inside a server.", ephemeral=True)

        set_afk(ctx.guild.id, ctx.author.id, reason)
        from Embeds import get_command_embed
        kwargs = get_command_embed(ctx.guild.id, "afk", msg_type="set", author=ctx.author, reason=reason)
        await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())

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
                from Embeds import get_command_embed
                kwargs = get_command_embed(message.guild.id, "afk", msg_type="notice", target=user, reason=reason, timestamp=ts)
                try:
                    await message.reply(**kwargs, mention_author=False, allowed_mentions=discord.AllowedMentions.none())
                except Exception as e:
                    print(f"Failed to reply AFK notice: {e}")

async def setup(bot: commands.Bot):
    await bot.add_cog(AfkCommand(bot))

