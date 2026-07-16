import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Database.storagehandler import set_afk, get_afk

class AfkSetLayout(LayoutView):
    def __init__(self, author: discord.Member | discord.User, reason: str):
        super().__init__()
        self.container = Container(
            TextDisplay(content=f"### AFK Status Enabled\n**User:** {author.mention} (`{author.id}`)"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Reason:** {reason}")
        )
        self.add_item(self.container)


class AfkNoticeLayout(LayoutView):
    def __init__(self, target: discord.User | discord.Member, reason: str, timestamp: int):
        super().__init__()
        since_text = f"\n**Since:** <t:{timestamp}:R>" if timestamp else ""
        self.container = Container(
            TextDisplay(content=f"### AFK Notice\n**User:** {target.mention} is currently AFK."),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Reason:** {reason}{since_text}")
        )
        self.add_item(self.container)


class AfkCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="afk", description="Sets your AFK status with an optional reason.")
    async def afk(self, ctx: commands.Context, *, reason: str = "AFK"):
        if not ctx.guild:
            return await ctx.send("This command can only be used inside a server.", ephemeral=True)

        await set_afk(ctx.guild.id, ctx.author.id, reason)
        view = AfkSetLayout(ctx.author, reason)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

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

            afk_data = await get_afk(message.guild.id, user.id)
            if afk_data:
                reason = afk_data.get("reason", "AFK")
                ts = afk_data.get("timestamp", 0)
                view = AfkNoticeLayout(user, reason, ts)
                try:
                    await message.reply(view=view, mention_author=False, allowed_mentions=discord.AllowedMentions.none())
                except Exception as e:
                    print(f"Failed to reply AFK notice: {e}")

async def setup(bot: commands.Bot):
    await bot.add_cog(AfkCommand(bot))
