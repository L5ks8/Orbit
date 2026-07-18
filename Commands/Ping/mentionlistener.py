utf-8import discord
from discord.ext import commands

class MentionListener(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_message(self, message: discord.Message):
        if message.author.bot or not message.guild:
            return

        if self.bot.user in message.mentions and not message.mention_everyone:
            ctx = await self.bot.get_context(message)
            if ctx.valid and ctx.command is not None:
                return

            prefix = "-"
            pfx_attr = getattr(self.bot, "command_prefix", "-")
            if isinstance(pfx_attr, str):
                prefix = pfx_attr
            elif isinstance(pfx_attr, (list, tuple)) and len(pfx_attr) > 0:
                prefix = [p for p in pfx_attr if not p.startswith("<@")][0] if any(not p.startswith("<@") for p in pfx_attr) else "-"

            msg_content = f"Hello! My prefix on this server is `{prefix}`. You can view my commands using `{prefix}help` or `/help`!"
            try:
                await message.reply(content=msg_content, mention_author=False)
            except Exception as e:
                print(f"[MENTION ERROR] Could not reply to ping: {e}")

async def setup(bot: commands.Bot):
    await bot.add_cog(MentionListener(bot))
