import discord
from discord.ext import commands
from Commands.Boost._storage import load_boost_config
import re

def format_boost_string(text: str, member: discord.Member) -> str:
    if not text:
        return ""
    
    formatted = text
    formatted = formatted.replace("{user}", member.mention)
    formatted = formatted.replace("{server}", member.guild.name)
    formatted = formatted.replace("{count}", str(member.guild.premium_subscription_count))
    
    def replace_channel(match):
        name_or_id = match.group(1)
        if name_or_id.isdigit():
            return f"<#{name_or_id}>"
        c_name = name_or_id.lower()
        channel = discord.utils.find(lambda c: c.name.lower() == c_name, member.guild.text_channels)
        if channel:
            return channel.mention
        return f"#{c_name}"
        
    formatted = re.sub(r'(?<!<)#([\w-]+)(?!>)', replace_channel, formatted)
    
    return formatted

class BoostListener(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_member_update(self, before: discord.Member, after: discord.Member):
        if before.bot:
            return

        # Check if the member started boosting the server
        # premium_since is None if not boosting, and a datetime object if boosting
        if before.premium_since is not None or after.premium_since is None:
            return

        config = load_boost_config(after.guild.id)
        if not config.get("enabled") or not config.get("channel_id"):
            return

        channel = after.guild.get_channel(config["channel_id"])
        if not channel:
            try:
                channel = await after.guild.fetch_channel(config["channel_id"])
            except Exception:
                return

        if not channel:
            return

        msg_content = config.get("message") or "Thank you for boosting the server, {user}!"
        formatted = format_boost_string(msg_content, after)
        
        from Commands.Boost._image_gen import generate_boost_image
        import discord
        import aiohttp
        import pathlib
        import asyncio

        avatar_bytes = b""
        if after.display_avatar:
            try:
                avatar_bytes = await after.display_avatar.read()
            except Exception:
                pass
                
        bg_path = pathlib.Path("nonexistent.png")

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
                                temp_path = pathlib.Path(tempfile.gettempdir()) / f"boost_{after.guild.id}.png"
                                with open(temp_path, "wb") as f:
                                    f.write(bg_bytes)
                                bg_path = temp_path
                except Exception:
                    pass

        img_buffer = await asyncio.to_thread(generate_boost_image, avatar_bytes, bg_path, after.name)
        file = discord.File(fp=img_buffer, filename="boost.png")

        try:
            await channel.send(content=formatted, file=file, allowed_mentions=discord.AllowedMentions.none())
        except Exception:
            pass

async def setup(bot: commands.Bot):
    await bot.add_cog(BoostListener(bot))
