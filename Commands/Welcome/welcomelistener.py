import discord
from discord.ext import commands
from Database.storagehandler import load_welcome_config
from Commands.Welcome._views import format_welcome_string, WelcomeCardLayout

class WelcomeListener(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_member_join(self, member: discord.Member):
        if member.bot:
            return

        config = await load_welcome_config(member.guild.id)
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
        
        from Database.storagehandler import get_welcome_bg_path
        from Commands.Welcome.image_gen import generate_welcome_image
        import discord

        # Download avatar bytes
        avatar_bytes = b""
        if member.display_avatar:
            try:
                avatar_bytes = await member.display_avatar.read()
            except Exception:
                pass
                
        bg_path = get_welcome_bg_path(member.guild.id)
        
        # Run image generation in a separate thread to prevent blocking
        import asyncio
        img_buffer = await asyncio.to_thread(generate_welcome_image, avatar_bytes, bg_path, member.name)
        file = discord.File(fp=img_buffer, filename="welcome.png")

        try:
            await channel.send(content=formatted, file=file, allowed_mentions=discord.AllowedMentions.none())
        except Exception:
            pass

async def setup(bot: commands.Bot):
    await bot.add_cog(WelcomeListener(bot))
