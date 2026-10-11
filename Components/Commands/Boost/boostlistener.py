import discord
from discord.ext import commands
from Components.Commands.Boost._storage import load_boost_config
from Components.Commands.Boost._image_gen import generate_boost_image
import re
import time
import pathlib
import tempfile
import asyncio
import aiohttp

def format_boost_string(text: str, member: discord.Member | discord.User, guild: discord.Guild) -> str:
    if not text:
        return ""
    
    count = getattr(guild, 'premium_subscription_count', 0) or 0
    tier = getattr(guild, 'premium_tier', 0) or 0
    server_name = guild.name if guild else "Server"
    server_id = str(guild.id) if guild else "0"
    user_mention = getattr(member, 'mention', f"@{getattr(member, 'name', 'User')}")
    username = getattr(member, 'name', 'User')
    user_id = str(getattr(member, 'id', '0'))

    replacements = {
        "{user}": user_mention,
        "{mention}": user_mention,
        "{username}": username,
        "{user.name}": username,
        "{user.id}": user_id,
        "{server}": server_name,
        "{server.name}": server_name,
        "{server.id}": server_id,
        "{count}": str(count),
        "{boostcount}": str(count),
        "{tier}": str(tier),
        "{level}": str(tier),
        "{id}": user_id
    }
    formatted = str(text)
    for key, val in replacements.items():
        formatted = formatted.replace(key, str(val))
    
    def replace_channel(match):
        name_or_id = match.group(1)
        if name_or_id.isdigit():
            return f"<#{name_or_id}>"
        c_name = name_or_id.lower()
        channel = discord.utils.find(lambda c: c.name.lower() == c_name, guild.text_channels)
        if channel:
            return channel.mention
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

    formatted = re.sub(r'(?<!<)#([\w-]+)(?!>)', replace_channel, formatted)
    formatted = re.sub(r'<a?:(\d+)>|(?<!<):([a-zA-Z0-9_-]+):(?![\d>])', replace_emoji, formatted)
    
    return formatted

class BoostListener(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self._recent_boosts: dict[tuple[int, int], float] = {}

    async def _handle_boost(self, guild: discord.Guild, member: discord.Member | discord.User):
        if not guild or not member:
            return

        now = time.time()
        # Clean old deduplication entries (> 60s)
        self._recent_boosts = {k: v for k, v in self._recent_boosts.items() if now - v < 60}
        dedup_key = (guild.id, member.id)
        if dedup_key in self._recent_boosts and (now - self._recent_boosts[dedup_key]) < 25:
            return
        self._recent_boosts[dedup_key] = now

        # Ensure member is a Member instance if possible
        if not isinstance(member, discord.Member):
            cached = guild.get_member(member.id)
            if cached:
                member = cached
            else:
                try:
                    member = await guild.fetch_member(member.id)
                except Exception:
                    pass

        config = load_boost_config(guild.id)
        
        # Reward Role
        reward_role_id = config.get("reward_role_id")
        if reward_role_id and isinstance(member, discord.Member):
            try:
                role = guild.get_role(int(reward_role_id))
                if role and role not in member.roles:
                    await member.add_roles(role, reason="Boost Reward")
            except Exception:
                pass

        if not config.get("enabled"):
            return

        channel_id_val = config.get("channel_id")
        if not channel_id_val:
            return

        try:
            ch_id = int(channel_id_val)
        except (ValueError, TypeError):
            return

        channel = guild.get_channel(ch_id)
        if not channel:
            try:
                channel = await guild.fetch_channel(ch_id)
            except Exception:
                return

        if not channel:
            return

        allowed = discord.AllowedMentions(users=True, roles=False, everyone=False)
        msg_mode = config.get("msg_mode", "image")

        if msg_mode == "embed":
            embed_color_hex = config.get("embed_color", "#EB459E")
            try:
                color_val = int(embed_color_hex.replace("#", ""), 16)
            except Exception:
                color_val = 0xEB459E

            embed = discord.Embed(color=discord.Color(color_val))

            title = format_boost_string(config.get("embed_title", ""), member, guild)
            if title:
                embed.title = title

            desc = format_boost_string(config.get("embed_description", ""), member, guild)
            if desc:
                embed.description = desc

            thumb = config.get("embed_thumbnail", "")
            if thumb:
                embed.set_thumbnail(url=thumb)
            elif getattr(member, "display_avatar", None):
                embed.set_thumbnail(url=member.display_avatar.url)

            img = config.get("embed_image", "")
            if img:
                embed.set_image(url=img)

            footer = format_boost_string(config.get("embed_footer", ""), member, guild)
            footer_icon = config.get("embed_footer_icon", "")
            if footer:
                if footer_icon:
                    embed.set_footer(text=footer, icon_url=footer_icon)
                else:
                    embed.set_footer(text=footer)

            author = format_boost_string(config.get("embed_author", ""), member, guild)
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
                        f_name = format_boost_string(f.get("name", ""), member, guild)
                        f_val = format_boost_string(f.get("value", ""), member, guild)
                        if f_name or f_val:
                            embed.add_field(
                                name=f_name if f_name else "\u200b",
                                value=f_val if f_val else "\u200b",
                                inline=bool(f.get("inline", False))
                            )

            content_text = format_boost_string(config.get("message", ""), member, guild)

            try:
                await channel.send(content=content_text if content_text else None, embed=embed, allowed_mentions=allowed)
            except discord.Forbidden:
                fallback_msg = content_text or desc or f"Thank you for boosting the server, {member.mention}!"
                try:
                    await channel.send(content=fallback_msg, allowed_mentions=allowed)
                except Exception:
                    pass
            except Exception:
                pass
            return

        # Default Image mode
        formatted = format_boost_string(config.get("message", ""), member, guild)

        avatar_bytes = b""
        if getattr(member, "display_avatar", None):
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
                try:
                    async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=5.0)) as session:
                        async with session.get(image_url) as resp:
                            if resp.status == 200:
                                bg_bytes = await resp.read()
                                temp_path = pathlib.Path(tempfile.gettempdir()) / f"boost_{guild.id}.png"
                                with open(temp_path, "wb") as f:
                                    f.write(bg_bytes)
                                bg_path = temp_path
                except Exception:
                    pass

        try:
            img_buffer = await asyncio.to_thread(generate_boost_image, avatar_bytes, bg_path, member.name)
            file = discord.File(fp=img_buffer, filename="boost.png")
            await channel.send(content=formatted if formatted else None, file=file, allowed_mentions=allowed)
        except Exception:
            # Fallback to embed or plain text if image generation or file attachment fails
            try:
                embed = discord.Embed(
                    title=" Server Boost!",
                    description=formatted or f"**{member.name}** just boosted the server!",
                    color=discord.Color.from_rgb(255, 115, 250)
                )
                if getattr(member, "display_avatar", None):
                    embed.set_thumbnail(url=member.display_avatar.url)
                await channel.send(embed=embed, allowed_mentions=allowed)
            except Exception:
                if formatted:
                    try:
                        await channel.send(content=formatted, allowed_mentions=allowed)
                    except Exception:
                        pass

    @commands.Cog.listener()
    async def on_member_update(self, before: discord.Member, after: discord.Member):
        if getattr(after, "bot", False):
            return

        # Check if member gained premium status or boost status updated
        if (before.premium_since is None and after.premium_since is not None) or (
            before.premium_since is not None and after.premium_since is not None and before.premium_since != after.premium_since
        ):
            await self._handle_boost(after.guild, after)

    @commands.Cog.listener()
    async def on_message(self, message: discord.Message):
        if not message.guild:
            return

        boost_types = (
            discord.MessageType.premium_guild_subscription,
            discord.MessageType.premium_guild_tier_1,
            discord.MessageType.premium_guild_tier_2,
            discord.MessageType.premium_guild_tier_3,
        )
        if message.type in boost_types:
            await self._handle_boost(message.guild, message.author)

async def setup(bot: commands.Bot):
    await bot.add_cog(BoostListener(bot))
