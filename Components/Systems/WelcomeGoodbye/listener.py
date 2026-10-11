import discord
from discord.ext import commands
from Components.Systems.WelcomeGoodbye._storage import load_welcome_config, load_goodbye_config
from Components.Systems.WelcomeGoodbye._views import format_welcome_string, format_goodbye_string
from Components.Systems.WelcomeGoodbye.image_gen import generate_welcome_image, generate_goodbye_image
import re
import aiohttp
import pathlib
import tempfile
import asyncio

def _parse_channel_and_emoji(text: str, guild: discord.Guild) -> str:
    if not text or not guild:
        return text or ""

    def replace_channel(match):
        name_or_id = match.group(1)
        if name_or_id.isdigit():
            return f"<#{name_or_id}>"
        c_name = name_or_id.lower()
        ch = discord.utils.find(lambda c: c.name.lower() == c_name, guild.text_channels)
        if ch:
            return ch.mention
        return f"#{c_name}"

    def replace_emoji(match):
        token = match.group(0)
        m_no_name = re.match(r'<(a?):(\d+)>', token)
        if m_no_name:
            is_anim = m_no_name.group(1) == 'a'
            eid = int(m_no_name.group(2))
            em = discord.utils.get(guild.emojis, id=eid)
            if em:
                return str(em)
            prefix = "a" if is_anim else ""
            return f"<{prefix}:e:{eid}>"

        m_colon = re.match(r':([a-zA-Z0-9_-]+):', token)
        if m_colon:
            key = m_colon.group(1)
            if key.isdigit():
                em = discord.utils.get(guild.emojis, id=int(key))
                if em:
                    return str(em)
                return f"<:e:{key}>"
            else:
                em = discord.utils.get(guild.emojis, name=key)
                if em:
                    return str(em)
        return token

    formatted = re.sub(r'(?<!<)#([\w-]+)(?!>)', replace_channel, text)
    formatted = re.sub(r'<a?:(\d+)>|(?<!<):([a-zA-Z0-9_-]+):(?![\d>])', replace_emoji, formatted)
    return formatted


def _resolve_url(val: str, member: discord.Member, guild: discord.Guild) -> str | None:
    if not val:
        return None
    val = val.strip()
    if "{user.avatar}" in val:
        return member.display_avatar.url if getattr(member, "display_avatar", None) else None
    if "{server.icon}" in val:
        return guild.icon.url if (guild and guild.icon) else None
    if val.startswith("http://") or val.startswith("https://"):
        return val
    return None


class WelcomeListener(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    async def send_welcome(self, member: discord.Member, config: dict = None, force_test: bool = False) -> tuple[bool, str]:
        if not member:
            return False, "Invalid member provided."

        guild = getattr(member, "guild", None)
        if not guild:
            return False, "Member is not in a valid guild."

        if getattr(member, "bot", False) and not force_test:
            return False, "Member is a bot."

        if config is None:
            config = load_welcome_config(guild.id)

        if not force_test and not config.get("enabled"):
            return False, "Welcome module is disabled."

        cid = config.get("channel_id")
        if not cid:
            return False, "No welcome channel is configured."

        try:
            ch_id = int(cid)
        except (ValueError, TypeError):
            return False, f"Invalid welcome channel ID: {cid}"

        channel = guild.get_channel(ch_id)
        if not channel:
            try:
                channel = await guild.fetch_channel(ch_id)
            except Exception as e:
                return False, f"Could not access channel with ID {ch_id}: {e}"

        if not channel:
            return False, f"Welcome channel with ID {ch_id} not found."

        # Permission verification
        me = guild.me or (guild.get_member(self.bot.user.id) if self.bot.user else None)
        if me:
            perms = channel.permissions_for(me)
            if not perms.view_channel:
                return False, f"Bot is missing 'View Channel' permission in #{channel.name}."
            if not perms.send_messages:
                return False, f"Bot is missing 'Send Messages' permission in #{channel.name}."

        def fmt_text(text: str) -> str:
            if not text:
                return ""
            raw = format_welcome_string(text, member)
            return _parse_channel_and_emoji(raw, guild)

        # Handle DM on Join (only for real joins, skipped in tests)
        if not force_test and config.get("dm_enabled") and config.get("dm_message"):
            dm_text = fmt_text(config.get("dm_message"))
            if dm_text:
                try:
                    await member.send(dm_text)
                except Exception as e:
                    print(f"[Welcome] Could not DM new member {member}: {e}")

        msg_mode = config.get("msg_mode", "image")
        allowed = discord.AllowedMentions(users=True, roles=False, everyone=False)

        # 1. TEXT MODE
        if msg_mode == "text":
            raw_msg = config.get("message", "")
            content_text = fmt_text(raw_msg) or f"Welcome to **{guild.name}**, {member.mention}!"
            try:
                await channel.send(content=content_text, allowed_mentions=allowed)
                return True, f"Welcome text sent to #{channel.name}"
            except Exception as e:
                return False, f"Failed to send text message in #{channel.name}: {e}"

        # 2. EMBED MODE
        if msg_mode == "embed":
            embed_color_hex = config.get("embed_color", "#5865F2")
            try:
                color_val = int(embed_color_hex.replace("#", ""), 16)
            except Exception:
                color_val = 0x5865F2

            embed = discord.Embed(color=discord.Color(color_val))

            title = fmt_text(config.get("embed_title", ""))
            if title:
                embed.title = title

            desc = fmt_text(config.get("embed_description", ""))
            if desc:
                embed.description = desc

            # Safely resolve thumbnail
            thumb_url = _resolve_url(config.get("embed_thumbnail", ""), member, guild)
            if not thumb_url and not config.get("embed_thumbnail") and getattr(member, "display_avatar", None):
                thumb_url = member.display_avatar.url
            if thumb_url:
                embed.set_thumbnail(url=thumb_url)

            # Safely resolve main embed image
            img_url = _resolve_url(config.get("embed_image", ""), member, guild)
            if img_url:
                embed.set_image(url=img_url)

            # Footer
            footer = fmt_text(config.get("embed_footer", ""))
            f_icon = _resolve_url(config.get("embed_footer_icon", ""), member, guild)
            if footer:
                if f_icon:
                    embed.set_footer(text=footer, icon_url=f_icon)
                else:
                    embed.set_footer(text=footer)

            # Author
            author = fmt_text(config.get("embed_author", ""))
            a_icon = _resolve_url(config.get("embed_author_icon", ""), member, guild)
            if author:
                if a_icon:
                    embed.set_author(name=author, icon_url=a_icon)
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
                await channel.send(content=content_text if content_text else None, embed=embed, allowed_mentions=allowed)
                return True, f"Welcome embed sent to #{channel.name}"
            except discord.Forbidden:
                fallback_msg = content_text or desc or f"Welcome to **{guild.name}**, {member.mention}!"
                try:
                    await channel.send(content=fallback_msg, allowed_mentions=allowed)
                    return True, f"Welcome sent as text fallback (bot missing Embed Links in #{channel.name})"
                except Exception as e:
                    return False, f"Missing permissions in #{channel.name}: {e}"
            except Exception as e:
                return False, f"Failed to send welcome embed: {e}"

        # 3. IMAGE CARD MODE (Default)
        raw_msg = config.get("message", "")
        formatted = fmt_text(raw_msg) or f"Welcome to **{guild.name}**, {member.mention}!"

        avatar_bytes = b""
        if getattr(member, "display_avatar", None):
            try:
                avatar_bytes = await member.display_avatar.read()
            except Exception as e:
                print(f"[Welcome] Could not read avatar bytes: {e}")

        bg_path = pathlib.Path("nonexistent.png")
        image_url = config.get("image_url", "")
        if image_url:
            if image_url.startswith("/static/"):
                bg_path = pathlib.Path("Web") / image_url.lstrip("/")
            elif image_url.startswith("/api/uploads/"):
                filename = image_url.split("/")[-1]
                bg_path = pathlib.Path("Storage/uploads") / filename
            elif image_url.startswith("http"):
                try:
                    async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=4.0)) as session:
                        async with session.get(image_url) as resp:
                            if resp.status == 200:
                                bg_bytes = await resp.read()
                                temp_path = pathlib.Path(tempfile.gettempdir()) / f"welcome_{guild.id}.png"
                                with open(temp_path, "wb") as f:
                                    f.write(bg_bytes)
                                bg_path = temp_path
                except Exception as e:
                    print(f"[Welcome] Could not fetch custom background image: {e}")

        file = None
        try:
            img_buffer = await asyncio.to_thread(generate_welcome_image, avatar_bytes, bg_path, member.name)
            file = discord.File(fp=img_buffer, filename="welcome.png")
        except Exception as e:
            print(f"[Welcome] Error generating welcome image: {e}")

        has_attach = me.guild_permissions.attach_files if me else True
        if channel and me:
            has_attach = channel.permissions_for(me).attach_files

        if file and has_attach:
            try:
                await channel.send(content=formatted, file=file, allowed_mentions=allowed)
                return True, f"Welcome image card sent to #{channel.name}"
            except Exception as e:
                print(f"[Welcome] Failed to send image file: {e}")

        # Fallback to embed
        try:
            embed = discord.Embed(
                title="Welcome!",
                description=formatted,
                color=discord.Color.from_rgb(88, 101, 242)
            )
            if getattr(member, "display_avatar", None):
                embed.set_thumbnail(url=member.display_avatar.url)
            await channel.send(embed=embed, allowed_mentions=allowed)
            return True, f"Welcome sent as embed fallback in #{channel.name}"
        except Exception:
            # Fallback to plain text
            try:
                await channel.send(content=formatted, allowed_mentions=allowed)
                return True, f"Welcome sent as plain text in #{channel.name}"
            except Exception as e:
                return False, f"Failed to send welcome message in #{channel.name}: {e}"

    @commands.Cog.listener()
    async def on_member_join(self, member: discord.Member, override_config=None, force_test=False):
        try:
            success, msg = await self.send_welcome(member, config=override_config, force_test=force_test)
            if not success:
                print(f"[Welcome] on_member_join notice: {msg}")
        except Exception as e:
            print(f"[Welcome] Error in on_member_join: {e}")


class GoodbyeListener(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    async def send_goodbye(self, member: discord.Member, config: dict = None, force_test: bool = False) -> tuple[bool, str]:
        if not member:
            return False, "Invalid member provided."

        guild = getattr(member, "guild", None)
        if not guild:
            return False, "Member is not in a valid guild."

        if getattr(member, "bot", False) and not force_test:
            return False, "Member is a bot."

        if config is None:
            config = load_goodbye_config(guild.id)

        if not force_test and not config.get("enabled"):
            return False, "Goodbye module is disabled."

        cid = config.get("channel_id")
        if not cid:
            return False, "No goodbye channel is configured."

        try:
            ch_id = int(cid)
        except (ValueError, TypeError):
            return False, f"Invalid goodbye channel ID: {cid}"

        channel = guild.get_channel(ch_id)
        if not channel:
            try:
                channel = await guild.fetch_channel(ch_id)
            except Exception as e:
                return False, f"Could not access channel with ID {ch_id}: {e}"

        if not channel:
            return False, f"Goodbye channel with ID {ch_id} not found."

        # Permission verification
        me = guild.me or (guild.get_member(self.bot.user.id) if self.bot.user else None)
        if me:
            perms = channel.permissions_for(me)
            if not perms.view_channel:
                return False, f"Bot is missing 'View Channel' permission in #{channel.name}."
            if not perms.send_messages:
                return False, f"Bot is missing 'Send Messages' permission in #{channel.name}."

        def fmt_text(text: str) -> str:
            if not text:
                return ""
            raw = format_goodbye_string(text, member)
            return _parse_channel_and_emoji(raw, guild)

        # Handle DM on Leave
        if not force_test and config.get("dm_enabled") and config.get("dm_message"):
            dm_text = fmt_text(config.get("dm_message"))
            if dm_text:
                try:
                    await member.send(dm_text)
                except Exception as e:
                    print(f"[Goodbye] Could not DM departing member {member}: {e}")

        msg_mode = config.get("msg_mode", "image")
        allowed = discord.AllowedMentions(users=True, roles=False, everyone=False)

        # 1. TEXT MODE
        if msg_mode == "text":
            raw_msg = config.get("message", "")
            content_text = fmt_text(raw_msg) or f"**{member.name}** left {guild.name}."
            try:
                await channel.send(content=content_text, allowed_mentions=allowed)
                return True, f"Goodbye text sent to #{channel.name}"
            except Exception as e:
                return False, f"Failed to send text message in #{channel.name}: {e}"

        # 2. EMBED MODE
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

            # Safely resolve thumbnail
            thumb_url = _resolve_url(config.get("embed_thumbnail", ""), member, guild)
            if not thumb_url and not config.get("embed_thumbnail") and getattr(member, "display_avatar", None):
                thumb_url = member.display_avatar.url
            if thumb_url:
                embed.set_thumbnail(url=thumb_url)

            # Safely resolve main embed image
            img_url = _resolve_url(config.get("embed_image", ""), member, guild)
            if img_url:
                embed.set_image(url=img_url)

            # Footer
            footer = fmt_text(config.get("embed_footer", ""))
            f_icon = _resolve_url(config.get("embed_footer_icon", ""), member, guild)
            if footer:
                if f_icon:
                    embed.set_footer(text=footer, icon_url=f_icon)
                else:
                    embed.set_footer(text=footer)

            # Author
            author = fmt_text(config.get("embed_author", ""))
            a_icon = _resolve_url(config.get("embed_author_icon", ""), member, guild)
            if author:
                if a_icon:
                    embed.set_author(name=author, icon_url=a_icon)
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
                await channel.send(content=content_text if content_text else None, embed=embed, allowed_mentions=allowed)
                return True, f"Goodbye embed sent to #{channel.name}"
            except discord.Forbidden:
                fallback_msg = content_text or desc or f"**{member.name}** left {guild.name}."
                try:
                    await channel.send(content=fallback_msg, allowed_mentions=allowed)
                    return True, f"Goodbye sent as text fallback (bot missing Embed Links in #{channel.name})"
                except Exception as e:
                    return False, f"Missing permissions in #{channel.name}: {e}"
            except Exception as e:
                return False, f"Failed to send goodbye embed: {e}"

        # 3. IMAGE CARD MODE (Default)
        raw_msg = config.get("message", "")
        formatted = fmt_text(raw_msg) or f"**{member.name}** left {guild.name}."

        avatar_bytes = b""
        if getattr(member, "display_avatar", None):
            try:
                avatar_bytes = await member.display_avatar.read()
            except Exception as e:
                print(f"[Goodbye] Could not read avatar bytes: {e}")

        bg_path = pathlib.Path("nonexistent.png")
        image_url = config.get("image_url", "")
        if image_url:
            if image_url.startswith("/static/"):
                bg_path = pathlib.Path("Web") / image_url.lstrip("/")
            elif image_url.startswith("/api/uploads/"):
                filename = image_url.split("/")[-1]
                bg_path = pathlib.Path("Storage/uploads") / filename
            elif image_url.startswith("http"):
                try:
                    async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=4.0)) as session:
                        async with session.get(image_url) as resp:
                            if resp.status == 200:
                                bg_bytes = await resp.read()
                                temp_path = pathlib.Path(tempfile.gettempdir()) / f"goodbye_{guild.id}.png"
                                with open(temp_path, "wb") as f:
                                    f.write(bg_bytes)
                                bg_path = temp_path
                except Exception as e:
                    print(f"[Goodbye] Could not fetch custom background image: {e}")

        file = None
        try:
            img_buffer = await asyncio.to_thread(generate_goodbye_image, avatar_bytes, bg_path, member.name)
            file = discord.File(fp=img_buffer, filename="goodbye.png")
        except Exception as e:
            print(f"[Goodbye] Error generating goodbye image: {e}")

        has_attach = me.guild_permissions.attach_files if me else True
        if channel and me:
            has_attach = channel.permissions_for(me).attach_files

        if file and has_attach:
            try:
                await channel.send(content=formatted, file=file, allowed_mentions=allowed)
                return True, f"Goodbye image card sent to #{channel.name}"
            except Exception as e:
                print(f"[Goodbye] Failed to send image file: {e}")

        # Fallback to embed
        try:
            embed = discord.Embed(
                title="Goodbye!",
                description=formatted,
                color=discord.Color.from_rgb(237, 66, 69)
            )
            if getattr(member, "display_avatar", None):
                embed.set_thumbnail(url=member.display_avatar.url)
            await channel.send(embed=embed, allowed_mentions=allowed)
            return True, f"Goodbye sent as embed fallback in #{channel.name}"
        except Exception:
            # Fallback to plain text
            try:
                await channel.send(content=formatted, allowed_mentions=allowed)
                return True, f"Goodbye sent as plain text in #{channel.name}"
            except Exception as e:
                return False, f"Failed to send goodbye message in #{channel.name}: {e}"

    @commands.Cog.listener()
    async def on_member_remove(self, member: discord.Member, override_config=None, force_test=False):
        try:
            success, msg = await self.send_goodbye(member, config=override_config, force_test=force_test)
            if not success:
                print(f"[Goodbye] on_member_remove notice: {msg}")
        except Exception as e:
            print(f"[Goodbye] Error in on_member_remove: {e}")


async def setup(bot: commands.Bot):
    await bot.add_cog(WelcomeListener(bot))
    await bot.add_cog(GoodbyeListener(bot))