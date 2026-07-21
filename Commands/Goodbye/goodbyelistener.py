import discord
from discord.ext import commands
from Commands.Goodbye._storage import load_goodbye_config
from Commands.Goodbye._views import format_goodbye_string
import re

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

        def replace_channel(match):
            name_or_id = match.group(1)
            if name_or_id.isdigit():
                return f"<#{name_or_id}>"
            c_name = name_or_id.lower()
            ch = discord.utils.find(lambda c: c.name.lower() == c_name, member.guild.text_channels)
            if ch:
                return ch.mention
            return f"#{c_name}"

        def fmt_text(text: str) -> str:
            if not text:
                return ""
            formatted = format_goodbye_string(text, member)
            return re.sub(r'(?<!<)#([\w-]+)(?!>)', replace_channel, formatted)

        msg_mode = config.get("msg_mode", "image")

        if msg_mode == "embed":
            embed_color_hex = config.get("embed_color", "#ED4245")
            try:
                color_val = int(embed_color_hex.replace("#", ""), 16)
            except Exception:
                color_val = 0xED4245

            embed = discord.Embed(color=discord.Color(color_val))

            title = fmt_text(config.get("embed_title", ""))
            if title:
                embed.title = title

            desc = fmt_text(config.get("embed_description", ""))
            if desc:
                embed.description = desc

            thumb = config.get("embed_thumbnail", "")
            if thumb:
                embed.set_thumbnail(url=thumb)
            elif member.display_avatar:
                embed.set_thumbnail(url=member.display_avatar.url)

            img = config.get("image_url", "")
            if img:
                embed.set_image(url=img)

            footer = fmt_text(config.get("embed_footer", ""))
            footer_icon = config.get("embed_footer_icon", "")
            if footer:
                if footer_icon:
                    embed.set_footer(text=footer, icon_url=footer_icon)
                else:
                    embed.set_footer(text=footer)

            author = fmt_text(config.get("embed_author", ""))
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
                        f_name = fmt_text(f.get("name", ""))
                        f_val = fmt_text(f.get("value", ""))
                        if f_name or f_val:
                            embed.add_field(
                                name=f_name if f_name else "\u200b",
                                value=f_val if f_val else "\u200b",
                                inline=bool(f.get("inline", False))
                            )

            content_text = fmt_text(config.get("message", ""))

            try:
                await channel.send(content=content_text if content_text else None, embed=embed, allowed_mentions=discord.AllowedMentions.none())
            except Exception:
                pass
            return

        # Default Image mode
        formatted = fmt_text(config.get("message", ""))

        from Commands.Goodbye.image_gen import generate_goodbye_image
        import aiohttp
        import pathlib

        avatar_bytes = b""
        if member.display_avatar:
            try:
                avatar_bytes = await member.display_avatar.read()
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
                                temp_path = pathlib.Path(tempfile.gettempdir()) / f"goodbye_{member.guild.id}.png"
                                with open(temp_path, "wb") as f:
                                    f.write(bg_bytes)
                                bg_path = temp_path
                except Exception:
                    pass

        import asyncio
        img_buffer = await asyncio.to_thread(generate_goodbye_image, avatar_bytes, bg_path, member.name)
        file = discord.File(fp=img_buffer, filename="goodbye.png")

        try:
            await channel.send(content=formatted, file=file, allowed_mentions=discord.AllowedMentions.none())
        except Exception:
            pass

async def setup(bot: commands.Bot):
    await bot.add_cog(GoodbyeListener(bot))
