import discord
from discord.ext import commands
from Commands.Goodbye._storage import load_goodbye_config
from Commands.Goodbye._views import format_goodbye_string

class GoodbyeListener(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_member_remove(self, member: discord.Member):
        if member.bot:
            return

        config = load_goodbye_config(member.guild.id)
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

        formatted = format_goodbye_string(config.get("message", ""), member)
        
        from Commands.Goodbye.image_gen import generate_goodbye_image
        import discord
        import aiohttp
        import pathlib

        # Download avatar bytes
        avatar_bytes = b""
        if member.display_avatar:
            try:
                avatar_bytes = await member.display_avatar.read()
            except Exception:
                pass
                
        bg_path = pathlib.Path("nonexistent.png")
        
        # If config has an image_url, resolve it
        image_url = config.get("image_url", "")
        if image_url:
            if image_url.startswith("/static/"):
                bg_path = pathlib.Path("Web") / image_url.lstrip("/")
            elif image_url.startswith("/api/uploads/"):
                filename = image_url.split("/")[-1]
                bg_path = pathlib.Path("Storage/uploads") / filename
            elif image_url.startswith("http"):
                import tempfile
                try:
                    async with aiohttp.ClientSession() as session:
                        async with session.get(image_url) as resp:
                            if resp.status == 200:
                                bg_bytes = await resp.read()
                                temp_path = pathlib.Path(tempfile.gettempdir()) / f"goodbye_{member.guild.id}.png"
                                with open(temp_path, "wb") as f:
                                    f.write(bg_bytes)
                                bg_path = temp_path
                except Exception:
                    pass
        
        # Run image generation in a separate thread to prevent blocking
        import asyncio
        img_buffer = await asyncio.to_thread(generate_goodbye_image, avatar_bytes, bg_path, member.name)
        file = discord.File(fp=img_buffer, filename="goodbye.png")

        try:
            await channel.send(content=formatted, file=file, allowed_mentions=discord.AllowedMentions.none())
        except Exception:
            pass

async def setup(bot: commands.Bot):
    await bot.add_cog(GoodbyeListener(bot))
