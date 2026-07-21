import discord
from discord.ext import commands
from Commands.Boost._storage import load_boost_config
import re

def format_boost_string(text: str, member: discord.Member) -> str:
    if not text:
        return ""
    
    count = member.guild.premium_subscription_count or 0
    replacements = {
        "{user}": member.mention,
        "{mention}": member.mention,
        "{username}": member.name,
        "{server}": member.guild.name,
        "{count}": str(count),
        "{id}": str(member.id)
    }
    formatted = str(text)
    for key, val in replacements.items():
        formatted = formatted.replace(key, str(val))
    
    def replace_channel(match):
        name_or_id = match.group(1)
        if name_or_id.isdigit():
            return f"<#{name_or_id}>"
        c_name = name_or_id.lower()
        channel = discord.utils.find(lambda c: c.name.lower() == c_name, member.guild.text_channels)
        if channel:
            return channel.mention
        return f"#{c_name}"
        
    def replace_emoji(match):
        key = match.group(1)
        if key.isdigit():
            em = discord.utils.get(member.guild.emojis, id=int(key))
            if em:
                return str(em)
        else:
            em = discord.utils.get(member.guild.emojis, name=key)
            if em:
                return str(em)
        return f":{key}:"

    formatted = re.sub(r'(?<!<)#([\w-]+)(?!>)', replace_channel, formatted)
    formatted = re.sub(r'(?<!<):([a-zA-Z0-9_-]+):(?![\d>])', replace_emoji, formatted)
    
    return formatted

class BoostListener(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_member_update(self, before: discord.Member, after: discord.Member):
        if before.bot:
            return

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

        msg_mode = config.get("msg_mode", "image")

        if msg_mode == "embed":
            embed_color_hex = config.get("embed_color", "#EB459E")
            try:
                color_val = int(embed_color_hex.replace("#", ""), 16)
            except Exception:
                color_val = 0xEB459E

            embed = discord.Embed(color=discord.Color(color_val))

            title = format_boost_string(config.get("embed_title", ""), after)
            if title:
                embed.title = title

            desc = format_boost_string(config.get("embed_description", ""), after)
            if desc:
                embed.description = desc

            thumb = config.get("embed_thumbnail", "")
            if thumb:
                embed.set_thumbnail(url=thumb)
            elif after.display_avatar:
                embed.set_thumbnail(url=after.display_avatar.url)

            img = config.get("image_url", "")
            if img:
                embed.set_image(url=img)

            footer = format_boost_string(config.get("embed_footer", ""), after)
            footer_icon = config.get("embed_footer_icon", "")
            if footer:
                if footer_icon:
                    embed.set_footer(text=footer, icon_url=footer_icon)
                else:
                    embed.set_footer(text=footer)

            author = format_boost_string(config.get("embed_author", ""), after)
            author_icon = config.get("embed_author_icon", "")
            if author:
                if author_icon:
                    embed.set_author(name=author, icon_url=author_icon)
                else:
                    embed.set_author(name=author)

            fields = config.get("embed_fields", [])
            if isinstance(fields, list):
                for f in fields:
                    if isinstance(f, dict):
                        f_name = format_boost_string(f.get("name", ""), after)
                        f_val = format_boost_string(f.get("value", ""), after)
                        if f_name or f_val:
                            embed.add_field(
                                name=f_name if f_name else "\u200b",
                                value=f_val if f_val else "\u200b",
                                inline=bool(f.get("inline", False))
                            )

            content_text = format_boost_string(config.get("message", ""), after)

            try:
                await channel.send(content=content_text if content_text else None, embed=embed, allowed_mentions=discord.AllowedMentions.none())
            except Exception:
                pass
            return

        # Default Image mode
        formatted = format_boost_string(config.get("message", ""), after)

        from Commands.Boost._image_gen import generate_boost_image
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
