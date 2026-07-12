import discord
from discord.ext import commands
from Commands.Welcome._storage import load_welcome_config
from Commands.Welcome._views import format_welcome_string, WelcomeCardLayout

class WelcomeListener(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_member_join(self, member: discord.Member):
        if member.bot:
            return

        config = load_welcome_config(member.guild.id)
        if not config.get("enabled") or not config.get("channel_id"):
            return

        channel = member.guild.get_channel(config["channel_id"])
        if not channel:
            try:
                channel = await member.guild.fetch_channel(config["channel_id"])
            except Exception:
                return

        if not channel:
            return

        formatted = format_welcome_string(config.get("message", ""), member)
        view = WelcomeCardLayout(member, formatted)

        try:
            await channel.send(view=view, allowed_mentions=discord.AllowedMentions.none())
        except Exception:
            pass

async def setup(bot: commands.Bot):
    await bot.add_cog(WelcomeListener(bot))
