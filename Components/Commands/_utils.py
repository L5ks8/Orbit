import discord
from discord.ext import commands
import os
from typing import Optional

ORBIT_COLOR = discord.Color(0x5865F2)

try:
    from discord.ui import Button, Container, TextDisplay, ActionRow, LayoutView, Separator
    HAS_V2 = True
    print("[V2] Discord Components V2 is available and enabled!", flush=True)
except (ImportError, AttributeError) as e:
    HAS_V2 = False
    LayoutView = discord.ui.View
    Container = None
    TextDisplay = None
    ActionRow = None
    Separator = None
    print(f"[V2] Discord Components V2 is not available: {e}", flush=True)

def make_embed(description: str, color: discord.Color = None, title: str = None) -> discord.Embed:
    actual_color = ORBIT_COLOR if color is None else color
    embed = discord.Embed(description=description, color=actual_color)
    if title:
        embed.title = title
    return embed

def make_v2_card(body: str, *components, color: discord.Color = ORBIT_COLOR, footer: str = None):
    if not HAS_V2:
        return None
    view = LayoutView(timeout=None)
    items = [TextDisplay(content=body)]
    for comp in components:
        if isinstance(comp, ActionRow):
            items.append(comp)
        elif isinstance(comp, (list, tuple)):
            items.append(ActionRow(*comp))
        elif comp is not None:
            items.append(comp)
    if footer:
        items.append(TextDisplay(content=f"-# {footer}"))
    
    actual_color = color
    if isinstance(actual_color, int):
        actual_color = discord.Color(actual_color)
    container = Container(*items, accent_color=actual_color)
    view.add_item(container)
    return view

def embed_to_v2_card(embed: discord.Embed) -> Optional[LayoutView]:
    if not HAS_V2 or not embed:
        return None

    # Don't convert embeds that rely on attachment:// images, since Components V2 TextDisplay cannot render them
    if embed.image and embed.image.url and embed.image.url.startswith("attachment://"):
        return None
    if embed.thumbnail and embed.thumbnail.url and embed.thumbnail.url.startswith("attachment://"):
        return None

    parts = []
    title = embed.title
    if not title and embed.author and embed.author.name:
        title = embed.author.name

    if title:
        clean_title = title.lstrip("#").strip()
        parts.append(f"# {clean_title}")

    if embed.description:
        parts.append(str(embed.description))

    for field in embed.fields:
        if field.name and field.name != "\u200b":
            parts.append(f"**{field.name}**\n{field.value}")
        elif field.value and field.value != "\u200b":
            parts.append(str(field.value))

    # Append web image link if present
    if embed.image and embed.image.url and not embed.image.url.startswith("attachment://"):
        parts.append(f"[Image]({embed.image.url})")

    body = "\n\n".join(parts).strip()
    if not body:
        return None

    if len(body) > 3900:
        body = body[:3890] + "..."

    footer_parts = []
    if embed.footer and embed.footer.text:
        footer_parts.append(embed.footer.text)
    if embed.timestamp:
        footer_parts.append(f"<t:{int(embed.timestamp.timestamp())}:R>")

    footer = " • ".join(footer_parts) if footer_parts else None
    color = embed.color if embed.color is not None else ORBIT_COLOR

    return make_v2_card(body, color=color, footer=footer)

class InteractionContext:
    def __init__(self, interaction: discord.Interaction):
        self.interaction = interaction
        self.bot = interaction.client
        self.client = interaction.client
        self.guild = interaction.guild
        self.channel = interaction.channel
        self.author = interaction.user
        self.user = interaction.user
        self.me = interaction.guild.me if interaction.guild else interaction.client.user
        self.message = None
        self.command = getattr(interaction, "command", None)
        self.invoked_with = interaction.command.name if getattr(interaction, "command", None) else ""
        self.invoked_subcommand = None

    async def defer(self, *, ephemeral: bool = False, thinking: bool = True):
        if not self.interaction.response.is_done():
            await self.interaction.response.defer(ephemeral=ephemeral, thinking=thinking)

    async def send(self, *args, **kwargs):
        delete_after = kwargs.pop("delete_after", None)
        if HAS_V2 and "view" not in kwargs:
            target_embed = None
            if "embed" in kwargs and kwargs["embed"]:
                target_embed = kwargs["embed"]
            elif "embeds" in kwargs and kwargs["embeds"] and len(kwargs["embeds"]) == 1:
                target_embed = kwargs["embeds"][0]

            if target_embed:
                card = embed_to_v2_card(target_embed)
                if card:
                    kwargs.pop("embed", None)
                    kwargs.pop("embeds", None)
                    kwargs["view"] = card
                    if "allowed_mentions" not in kwargs:
                        kwargs["allowed_mentions"] = discord.AllowedMentions.none()
        if self.interaction.response.is_done():
            msg = await self.interaction.followup.send(*args, **kwargs)
        else:
            await self.interaction.response.send_message(*args, **kwargs)
            try:
                msg = await self.interaction.original_response()
            except Exception:
                msg = None
        if delete_after and msg and hasattr(msg, "delete"):
            import asyncio
            async def _auto_del():
                try:
                    await asyncio.sleep(delete_after)
                    await msg.delete()
                except Exception:
                    pass
            asyncio.create_task(_auto_del())
        return msg

class ModuleDisabledView(discord.ui.View):
    def __init__(self, guild_id: int, module_name: str):
        super().__init__()
        tab_name = module_name.lower()
        if tab_name == "leveling":
            tab_name = "level"
        base_url = os.environ.get("BASE_URL", "http://localhost:3000").rstrip("/")
        self.add_item(discord.ui.Button(label="Activate Module", style=discord.ButtonStyle.link, url=f"{base_url}/dashboard/{guild_id}/modules/{tab_name}"))

def get_module_disabled_embed(module_name: str) -> discord.Embed:
    from Components.emojis import Emojis
    return discord.Embed(
        description=f"The {module_name} module must be activated to use this command.",
        color=discord.Color.red()
    )

def format_usage(command: str, *args: str) -> str:
    cmd_name = command.lstrip("/-")
    usage = f"Usage: /{cmd_name}"
    if args:
        usage += " " + " ".join(args)
    return usage

class MemberOrIDConverter(commands.Converter):
    async def convert(self, ctx: commands.Context, argument: str) -> discord.Member | discord.User:
        if isinstance(argument, (discord.Member, discord.User)):
            return argument
        arg_str = str(argument).strip()
        try:
            return await commands.MemberConverter().convert(ctx, arg_str)
        except commands.BadArgument:
            pass

        try:
            return await commands.UserConverter().convert(ctx, arg_str)
        except commands.BadArgument:
            pass

        cleaned = arg_str.strip("<@!>")
        if cleaned.isdigit():
            try:
                user = await ctx.bot.fetch_user(int(cleaned))
                if user:
                    if ctx.guild:
                        member = ctx.guild.get_member(user.id)
                        if member:
                            return member
                    return user
            except Exception:
                pass

        raise commands.BadArgument(f"Could not find member or user '{argument}'. Please provide a valid @mention or user ID.")

class UserOrIDConverter(commands.Converter):
    async def convert(self, ctx: commands.Context, argument: str) -> discord.User:
        if isinstance(argument, discord.User):
            return argument
        arg_str = str(argument).strip()
        try:
            return await commands.UserConverter().convert(ctx, arg_str)
        except commands.BadArgument:
            pass

        cleaned = arg_str.strip("<@!>")
        if cleaned.isdigit():
            try:
                user = await ctx.bot.fetch_user(int(cleaned))
                if user:
                    return user
            except Exception:
                pass

        raise commands.BadArgument(f"Could not find user '{argument}'. Please provide a valid @mention or user ID.")

async def send_moderation_dm(user: discord.Member | discord.User, guild_name: str, action: str, reason: str, duration: str = None, guild_id: int = None, case_id: Any = None, moderator: Any = None, warning_count: Any = None):
    try:
        slot_map = {
            "warned": "moderation.warn_dm",
            "warn": "moderation.warn_dm",
            "timed out": "moderation.timeout_dm",
            "timeout": "moderation.timeout_dm",
            "muted": "moderation.timeout_dm",
            "voice muted": "moderation.timeout_dm",
            "kicked": "moderation.kick_dm",
            "kick": "moderation.kick_dm",
            "banned": "moderation.ban_dm",
            "ban": "moderation.ban_dm",
            "voice banned": "moderation.ban_dm"
        }
        notif_key_map = {
            "warned": "warn_dm",
            "warn": "warn_dm",
            "timed out": "timeout_dm",
            "timeout": "timeout_dm",
            "muted": "timeout_dm",
            "voice muted": "timeout_dm",
            "kicked": "kick_dm",
            "kick": "kick_dm",
            "banned": "ban_dm",
            "ban": "ban_dm",
            "voice banned": "ban_dm"
        }

        slot_key = slot_map.get(action.lower(), "moderation.warn_dm")
        notif_key = notif_key_map.get(action.lower(), "warn_dm")

        automod_cfg = {}
        if guild_id:
            try:
                from Components.Systems.Automoderation._storage import load_automod_config
                automod_cfg = load_automod_config(guild_id)
            except Exception:
                automod_cfg = {}

        dm_notifs = automod_cfg.get("dm_notifications", {})
        if dm_notifs.get(notif_key) is False:
            return

        dm_templates = automod_cfg.get("dm_templates", {})
        tpl = dm_templates.get(slot_key)

        moderator_str = "Moderator"
        if moderator:
            moderator_str = getattr(moderator, "display_name", str(moderator))

        sample_vars = {
            "{server.name}": guild_name,
            "{server}": guild_name,
            "{user.name}": getattr(user, "display_name", getattr(user, "name", "User")),
            "{user.mention}": getattr(user, "mention", f"<@{getattr(user, 'id', '')}>"),
            "{user}": getattr(user, "mention", f"<@{getattr(user, 'id', '')}>"),
            "{case.id}": str(case_id or "—"),
            "{case.reason}": str(reason or "No reason provided"),
            "{case.moderator}": f"@{moderator_str}" if not str(moderator_str).startswith("@") else str(moderator_str),
            "{case.warning_count}": str(warning_count or "1"),
            "{case.duration}": str(duration or "—")
        }

        def apply_vars(txt):
            if not txt or not isinstance(txt, str):
                return txt or ""
            res = txt
            for k, v in sample_vars.items():
                res = res.replace(k, v)
            return res

        send_kwargs = {}
        if tpl and isinstance(tpl, dict):
            content_text = apply_vars(tpl.get("content", ""))
            if content_text:
                send_kwargs["content"] = content_text

            if tpl.get("has_embed", True):
                title_text = apply_vars(tpl.get("title", ""))
                desc_text = apply_vars(tpl.get("description", ""))
                color_hex = tpl.get("color", "#5865F2")
                try:
                    color_int = int(str(color_hex).replace("#", ""), 16)
                except Exception:
                    color_int = 0x5865F2

                embed = discord.Embed(
                    title=title_text[:256] if title_text else None,
                    description=desc_text[:4096] if desc_text else None,
                    color=discord.Color(color_int)
                )

                if tpl.get("author_name"):
                    embed.set_author(
                        name=apply_vars(tpl.get("author_name"))[:256],
                        icon_url=tpl.get("author_icon") or None,
                        url=tpl.get("author_url") or None
                    )

                thumb = tpl.get("thumbnail")
                if (thumb == "server_icon" or thumb == "server" or thumb is True) and guild_id:
                    try:
                        from discord.ext import commands
                        # bot can fetch guild icon
                        pass
                    except Exception:
                        pass
                elif thumb and isinstance(thumb, str) and thumb.startswith("http"):
                    embed.set_thumbnail(url=thumb)

                if tpl.get("image") and isinstance(tpl["image"], str) and tpl["image"].startswith("http"):
                    embed.set_image(url=tpl["image"])

                footer_text = apply_vars(tpl.get("footer_text", ""))
                if footer_text or tpl.get("footer_icon"):
                    embed.set_footer(
                        text=footer_text[:2048] if footer_text else None,
                        icon_url=tpl.get("footer_icon") or None
                    )

                if tpl.get("timestamp"):
                    embed.timestamp = discord.utils.utcnow()

                fields = tpl.get("fields", [])
                if isinstance(fields, list):
                    for f in fields[:25]:
                        if isinstance(f, dict):
                            fn = apply_vars(f.get("name", ""))[:256] or "\u200b"
                            fv = apply_vars(f.get("value", ""))[:1024] or "\u200b"
                            embed.add_field(name=fn, value=fv, inline=bool(f.get("inline", False)))

                send_kwargs["embed"] = embed

        if not send_kwargs:
            desc = f"You were {action} in {guild_name}{f' for {duration}' if duration else ''}. | {reason}"
            if guild_id:
                try:
                    from Components.Systems.BanAppeals._storage import load_appeals_config
                    appeals_cfg = load_appeals_config(guild_id)
                    if appeals_cfg.get("enabled"):
                        allowed = appeals_cfg.get("allowed_punishments", [])
                        p_map = {"banned": "ban", "voice banned": "ban", "timed out": "timeout", "muted": "timeout", "voice muted": "timeout", "kicked": "kick", "warned": "warn"}
                        if p_map.get(action) in allowed:
                            custom_url = appeals_cfg.get("custom_url", "orbit")
                            import urllib.parse
                            encoded_url = urllib.parse.quote(custom_url)
                            base_url = os.environ.get("BASE_URL")
                            desc += f"\n\n**Appeals:** You can appeal this punishment at: {base_url}/appeal/{encoded_url}"
                except Exception:
                    pass

            send_kwargs["embed"] = discord.Embed(description=desc, color=discord.Color.red())

        await user.send(**send_kwargs)
    except Exception:
        pass

def is_immune(guild_id: int, target: discord.User | discord.Member | int | str) -> bool:
    from Components.Systems.WebDashboard._storage import load_settings_config
    settings_cfg = load_settings_config(guild_id)
    
    target_id = str(target.id if hasattr(target, "id") else target)
    
    immune_users = settings_cfg.get("immune_users", [])
    for u in immune_users:
        uid = str(u.get("id") if isinstance(u, dict) else u)
        if uid == target_id:
            return True
        
    if isinstance(target, discord.Member):
        immune_roles = [str(r.get("id") if isinstance(r, dict) else r) for r in settings_cfg.get("immune_roles", [])]
        for role in target.roles:
            if str(role.id) in immune_roles:
                return True
                
    try:
        from Components.Commands.Whitelist._storage import is_whitelisted
        if is_whitelisted(guild_id, int(target_id)):
            return True
    except Exception:
        pass
        
    return False

def build_embed(guild: discord.Guild | None, title: str = None, description: str = None, color: discord.Color = ORBIT_COLOR, **kwargs) -> discord.Embed:
    from Components.Database.mongodb import get_config
    settings = get_config("Settings", guild.id) if guild else {}
    style = settings.get("embed_style", "normal")
    
    if style == "v2":
        embed = discord.Embed(description=description, color=color, **kwargs)
        if title:
            embed.set_author(name=title, icon_url=guild.icon.url if guild and guild.icon else None)
        if guild:
            embed.set_footer(text=f"{guild.name} • Orbit")
        return embed
    else:
        embed = discord.Embed(title=title, description=description, color=color, **kwargs)
        return embed

import re

def parse_duration(duration_input: str | int | float | None, default_unit: str = "m") -> int | None:
    """
    Parses human duration formats into integer seconds.
    Supports:
      - '1s', '30s', '10sec', 'seconds'
      - '1m', '10m', '15min', 'minutes'
      - '1h', '2h', '24hours'
      - '1d', '7d', '3days'
      - '1w', '2weeks'
      - Compound: '1d 2h', '1h 30m', '1d12h30m'
      - Raw digits: '60' -> uses default_unit ('s', 'm', 'h', 'd')
    Returns total seconds as int, or None if invalid or <= 0.
    """
    if duration_input is None:
        return None
    if isinstance(duration_input, (int, float)):
        val = int(duration_input)
        if val <= 0:
            return 0
        if default_unit == "s":
            return val
        elif default_unit == "m":
            return val * 60
        elif default_unit == "h":
            return val * 3600
        elif default_unit == "d":
            return val * 86400
        return val * 60

    s = str(duration_input).strip().lower()
    if not s:
        return None

    if s.isdigit():
        val = int(s)
        if val == 0:
            return 0
        if default_unit == "s":
            return val
        elif default_unit == "m":
            return val * 60
        elif default_unit == "h":
            return val * 3600
        elif default_unit == "d":
            return val * 86400
        return val * 60

    pattern = re.compile(r'(\d+)\s*([a-zA-Z]+)')
    matches = pattern.findall(s)
    if not matches:
        return None

    total_seconds = 0
    unit_map = {
        's': 1, 'sec': 1, 'secs': 1, 'second': 1, 'seconds': 1,
        'm': 60, 'min': 60, 'mins': 60, 'minute': 60, 'minutes': 60,
        'h': 3600, 'hr': 3600, 'hrs': 3600, 'hour': 3600, 'hours': 3600,
        'd': 86400, 'day': 86400, 'days': 86400,
        'w': 604800, 'wk': 604800, 'wks': 604800, 'week': 604800, 'weeks': 604800,
    }

    found_any = False
    for value_str, unit_str in matches:
        unit_key = unit_str.lower()
        mult = None
        if unit_key in unit_map:
            mult = unit_map[unit_key]
        elif unit_key.startswith('s'):
            mult = 1
        elif unit_key.startswith('m'):
            mult = 60
        elif unit_key.startswith('h'):
            mult = 3600
        elif unit_key.startswith('d'):
            mult = 86400
        elif unit_key.startswith('w'):
            mult = 604800

        if mult is not None:
            found_any = True
            total_seconds += int(value_str) * mult

    if not found_any:
        return None
    return total_seconds

def format_duration(seconds: int) -> str:
    """Formats seconds into human friendly duration like '1d 2h 30m'."""
    if seconds <= 0:
        return "0s"
    parts = []
    days, rem = divmod(seconds, 86400)
    hours, rem = divmod(rem, 3600)
    minutes, secs = divmod(rem, 60)
    if days > 0:
        parts.append(f"{days}d")
    if hours > 0:
        parts.append(f"{hours}h")
    if minutes > 0:
        parts.append(f"{minutes}m")
    if secs > 0 and len(parts) < 2:
        parts.append(f"{secs}s")
    return " ".join(parts) if parts else f"{seconds}s"

