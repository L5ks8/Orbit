import os
import secrets
import json
import asyncio
from aiohttp import web
import aiohttp
import discord
from typing import Dict, Any

from Commands.Welcome._storage import load_welcome_config, save_welcome_config
from Commands.Goodbye._storage import load_goodbye_config, save_goodbye_config
from Commands.AutoMod._storage import load_automod_config, save_automod_config
from Commands.Verify._storage import load_verify_config, save_verify_config
from Commands.AutoResponder._storage import load_responses, save_responses
from Commands.JoinRole._storage import load_join_roles, save_join_roles
from Commands.Log._storage import load_log_config, save_log_config
from Commands.ChannelAutomation._storage import load_automation_config, save_automation_config
from Commands.Boost._storage import load_boost_config, save_boost_config
from Commands.Level._storage import load_level_config, save_level_config
from Commands.ServerStats._storage import load_serverstats_config, save_serverstats_config

SESSIONS: Dict[str, Any] = {}

class WebDashboard:
    def __init__(self, bot: discord.ext.commands.Bot):
        self.bot = bot
        self.client_id = os.environ.get("DISCORD_CLIENT_ID", "")
        self.client_secret = os.environ.get("DISCORD_CLIENT_SECRET", "")
        
    def get_redirect_uri(self, request: web.Request) -> str:
        scheme = request.headers.get("X-Forwarded-Proto", "http")
        return f"{scheme}://{request.host}/auth/callback"

    async def get_user_session(self, request: web.Request) -> Dict[str, Any]:
        session_id = request.cookies.get("orbit_session")
        if not session_id or session_id not in SESSIONS:
            return None
        return SESSIONS[session_id]

    async def handle_index(self, request: web.Request):
        try:
            with open("Web/index.html", "r", encoding="utf-8") as f:
                content = f.read()
            return web.Response(text=content, content_type="text/html")
        except Exception as e:
            print(f"Index HTML Error: {e}")
            return web.Response(text="Orbit Dashboard: Error loading index.html", status=500)

    async def handle_login(self, request: web.Request):
        if not self.client_id:
            return web.Response(text="OAuth2 is not configured. Missing DISCORD_CLIENT_ID.", status=500)
            
        redirect_uri = self.get_redirect_uri(request)
        discord_login_url = (
            f"https://discord.com/api/oauth2/authorize?client_id={self.client_id}"
            f"&redirect_uri={redirect_uri}&response_type=code&scope=identify%20guilds"
        )
        raise web.HTTPFound(discord_login_url)

    async def handle_callback(self, request: web.Request):
        code = request.query.get("code")
        if not code:
            return web.Response(text="Missing code", status=400)
            
        redirect_uri = self.get_redirect_uri(request)
        
        data = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri
        }
        
        async with aiohttp.ClientSession() as session:
            
            async with session.post("https://discord.com/api/oauth2/token", data=data) as resp:
                if resp.status != 200:
                    err = await resp.text()
                    return web.Response(text=f"Failed to exchange code: {err}", status=400)
                token_info = await resp.json()
                access_token = token_info["access_token"]

            headers = {"Authorization": f"Bearer {access_token}"}
            async with session.get("https://discord.com/api/users/@me", headers=headers) as resp:
                if resp.status != 200:
                    return web.Response(text="Failed to fetch user info", status=400)
                user_info = await resp.json()

        session_id = secrets.token_urlsafe(32)
        SESSIONS[session_id] = {
            "id": user_info["id"],
            "username": user_info["username"],
            "avatar": user_info.get("avatar"),
            "access_token": access_token
        }
        
        response = web.HTTPFound("/")
        response.set_cookie("orbit_session", session_id, max_age=86400 * 7, httponly=True)
        return response

    async def handle_logout(self, request: web.Request):
        session_id = request.cookies.get("orbit_session")
        if session_id in SESSIONS:
            del SESSIONS[session_id]
        response = web.HTTPFound("/")
        response.del_cookie("orbit_session")
        return response

    async def api_user(self, request: web.Request):
        user = await self.get_user_session(request)
        if not user:
            return web.json_response({"error": "Unauthorized"}, status=401)
        return web.json_response({
            "id": user["id"],
            "username": user["username"],
            "avatar": user["avatar"]
        })

    async def api_stats(self, request: web.Request):
        return web.json_response({
            "servers": len(self.bot.guilds),
            "users": len(self.bot.users),
            "ping": round(self.bot.latency * 1000)
        })

    async def api_guilds(self, request: web.Request):
        user = await self.get_user_session(request)
        if not user:
            return web.json_response({"error": "Unauthorized"}, status=401)
            
        headers = {"Authorization": f"Bearer {user['access_token']}"}
        async with aiohttp.ClientSession() as session:
            async with session.get("https://discord.com/api/users/@me/guilds", headers=headers) as resp:
                if resp.status != 200:
                    return web.json_response({"error": "Failed to fetch guilds"}, status=400)
                user_guilds = await resp.json()
                
        from Commands.WebDashboard._storage import load_settings_config
        manageable_guilds = []
        for g in user_guilds:
            
            perms = int(g["permissions"])
            is_admin = (perms & 0x8) == 0x8
            manage_guild = (perms & 0x20) == 0x20
            manage_roles = (perms & 0x10000000) == 0x10000000
            manage_channels = (perms & 0x10) == 0x10
            manage_messages = (perms & 0x2000) == 0x2000
            
            bot_guild = self.bot.get_guild(int(g["id"]))
            if bot_guild:
                has_perms = is_admin or manage_guild or manage_roles or manage_channels or manage_messages
                
                if not has_perms:
                    settings_cfg = load_settings_config(int(g["id"]))
                    manager_roles = settings_cfg.get("manager_roles", [])
                    if manager_roles:
                        member = bot_guild.get_member(int(user["id"]))
                        if member and any(str(r.id) in manager_roles for r in member.roles):
                            has_perms = True

                if has_perms:
                    manageable_guilds.append({
                        "id": g["id"],
                        "name": g["name"],
                        "icon": g.get("icon")
                    })
                    
        return web.json_response(manageable_guilds)

    async def _check_guild_access(self, request: web.Request, guild_id: int):
        user = await self.get_user_session(request)
        if not user:
            return None, None
            
        bot_guild = self.bot.get_guild(guild_id)
        if not bot_guild:
            return None, None
            
        member = bot_guild.get_member(int(user["id"]))
        if not member:
            return None, None
            
        perms = member.guild_permissions
        is_admin = perms.administrator or perms.manage_guild
        
        if not is_admin:
            from Commands.WebDashboard._storage import load_settings_config
            settings_cfg = load_settings_config(guild_id)
            manager_roles = settings_cfg.get("manager_roles", [])
            if any(str(r.id) in manager_roles for r in member.roles):
                is_admin = True
        
        user_perms = {
            "is_admin": is_admin,
            "can_roles": is_admin or perms.manage_roles,
            "can_channels": is_admin or perms.manage_channels,
            "can_messages": is_admin or perms.manage_messages
        }
        
        if not any(user_perms.values()):
            return None, None
            
        return bot_guild, user_perms

    async def api_get_config(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        if not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild ID"}, status=400)
        guild_id = int(guild_id_str)
        
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild:
            return web.json_response({"error": "Unauthorized or not found"}, status=403)

        channels = [{"id": str(c.id), "name": c.name} for c in guild.text_channels]
        voice_channels = [{"id": str(c.id), "name": c.name} for c in guild.voice_channels]
        categories = [{"id": str(c.id), "name": c.name} for c in guild.categories]
        roles = [{"id": str(r.id), "name": r.name, "color": str(r.color) if str(r.color) != "#000000" else "#b9bbbe"} for r in guild.roles if not r.is_default()]

        welcome_cfg = load_welcome_config(guild_id)
        automod_cfg = load_automod_config(guild_id)
        verify_cfg = load_verify_config(guild_id)
        goodbye_cfg = load_goodbye_config(guild_id)
        boost_cfg = load_boost_config(guild_id)
        autoresponder_cfg = load_responses(guild_id)
        joinroles_cfg = load_join_roles(guild_id)
        
        from Commands.Ticket._storage import load_ticket_config
        ticket_cfg = load_ticket_config(guild_id)
        logs_cfg = load_log_config(guild_id)
        automation_cfg = load_automation_config(guild_id)
        
        from Commands.JoinToCreate._storage import load_jtc_config
        tempvoice_cfg = load_jtc_config(guild_id)
        level_cfg = load_level_config(guild_id)
        serverstats_cfg = load_serverstats_config(guild_id)

        from Commands.WebDashboard._storage import load_settings_config
        settings_cfg = load_settings_config(guild_id)

        config_data = {
            "settings": settings_cfg,
            "welcome": {
                "enabled": welcome_cfg.get("enabled", False),
                "channel_id": str(welcome_cfg.get("channel_id")) if welcome_cfg.get("channel_id") else "",
                "message": welcome_cfg.get("message", ""),
                "image_url": welcome_cfg.get("image_url", ""),
                "msg_mode": welcome_cfg.get("msg_mode", "image"),
                "embed_color": welcome_cfg.get("embed_color", "#5865F2"),
                "embed_title": welcome_cfg.get("embed_title", ""),
                "embed_description": welcome_cfg.get("embed_description", ""),
                "embed_thumbnail": welcome_cfg.get("embed_thumbnail", ""),
                "embed_footer": welcome_cfg.get("embed_footer", ""),
                "embed_author": welcome_cfg.get("embed_author", ""),
                "embed_author_icon": welcome_cfg.get("embed_author_icon", ""),
                "embed_footer_icon": welcome_cfg.get("embed_footer_icon", ""),
                "embed_fields": welcome_cfg.get("embed_fields", [])
            },
            "goodbye": {
                "enabled": goodbye_cfg.get("enabled", False),
                "channel_id": str(goodbye_cfg.get("channel_id")) if goodbye_cfg.get("channel_id") else "",
                "message": goodbye_cfg.get("message", ""),
                "image_url": goodbye_cfg.get("image_url", ""),
                "msg_mode": goodbye_cfg.get("msg_mode", "image"),
                "embed_color": goodbye_cfg.get("embed_color", "#ED4245"),
                "embed_title": goodbye_cfg.get("embed_title", ""),
                "embed_description": goodbye_cfg.get("embed_description", ""),
                "embed_thumbnail": goodbye_cfg.get("embed_thumbnail", ""),
                "embed_footer": goodbye_cfg.get("embed_footer", ""),
                "embed_author": goodbye_cfg.get("embed_author", ""),
                "embed_author_icon": goodbye_cfg.get("embed_author_icon", ""),
                "embed_footer_icon": goodbye_cfg.get("embed_footer_icon", ""),
                "embed_fields": goodbye_cfg.get("embed_fields", [])
            },
            "boost": {
                "enabled": boost_cfg.get("enabled", False),
                "channel_id": str(boost_cfg.get("channel_id")) if boost_cfg.get("channel_id") else "",
                "message": boost_cfg.get("message", ""),
                "image_url": boost_cfg.get("image_url", ""),
                "msg_mode": boost_cfg.get("msg_mode", "image"),
                "embed_color": boost_cfg.get("embed_color", "#EB459E"),
                "embed_title": boost_cfg.get("embed_title", ""),
                "embed_description": boost_cfg.get("embed_description", ""),
                "embed_thumbnail": boost_cfg.get("embed_thumbnail", ""),
                "embed_footer": boost_cfg.get("embed_footer", ""),
                "embed_author": boost_cfg.get("embed_author", ""),
                "embed_author_icon": boost_cfg.get("embed_author_icon", ""),
                "embed_footer_icon": boost_cfg.get("embed_footer_icon", ""),
                "embed_fields": boost_cfg.get("embed_fields", [])
            },
            "automod": {
                "enabled": automod_cfg.get("enabled", False),
                "exempt_channels": automod_cfg.get("exempt_channels", []),
                "exempt_roles": automod_cfg.get("exempt_roles", []),
                "banned_words": {
                    "enabled": automod_cfg.get("banned_words", {}).get("enabled", False),
                    "action": automod_cfg.get("banned_words", {}).get("action", "warn"),
                    "timeout_duration_min": automod_cfg.get("banned_words", {}).get("timeout_duration_min", 5),
                    "words": automod_cfg.get("banned_words", {}).get("words", []),
                    "exempt_channels": automod_cfg.get("banned_words", {}).get("exempt_channels", []),
                    "exempt_roles": automod_cfg.get("banned_words", {}).get("exempt_roles", [])
                },
                "anti_spam": {
                    "enabled": automod_cfg.get("anti_spam", {}).get("enabled", False),
                    "max_messages": automod_cfg.get("anti_spam", {}).get("max_messages", 5),
                    "time_window_sec": automod_cfg.get("anti_spam", {}).get("time_window_sec", 3),
                    "action": automod_cfg.get("anti_spam", {}).get("action", "warn"),
                    "timeout_duration_min": automod_cfg.get("anti_spam", {}).get("timeout_duration_min", 5),
                    "exempt_channels": automod_cfg.get("anti_spam", {}).get("exempt_channels", []),
                    "exempt_roles": automod_cfg.get("anti_spam", {}).get("exempt_roles", [])
                },
                "anti_invites": {
                    "enabled": automod_cfg.get("anti_invites", {}).get("enabled", False),
                    "action": automod_cfg.get("anti_invites", {}).get("action", "warn"),
                    "timeout_duration_min": automod_cfg.get("anti_invites", {}).get("timeout_duration_min", 5),
                    "exempt_channels": automod_cfg.get("anti_invites", {}).get("exempt_channels", []),
                    "exempt_roles": automod_cfg.get("anti_invites", {}).get("exempt_roles", [])
                },
                "anti_link": {
                    "enabled": automod_cfg.get("anti_link", {}).get("enabled", False),
                    "action": automod_cfg.get("anti_link", {}).get("action", "warn"),
                    "timeout_duration_min": automod_cfg.get("anti_link", {}).get("timeout_duration_min", 5),
                    "blocked_domains": automod_cfg.get("anti_link", {}).get("blocked_domains", ["discord.gg/", "discord.com/invite/"]),
                    "exempt_channels": automod_cfg.get("anti_link", {}).get("exempt_channels", []),
                    "exempt_roles": automod_cfg.get("anti_link", {}).get("exempt_roles", [])
                },
                "anti_caps": {
                    "enabled": automod_cfg.get("anti_caps", {}).get("enabled", False),
                    "action": automod_cfg.get("anti_caps", {}).get("action", "warn"),
                    "timeout_duration_min": automod_cfg.get("anti_caps", {}).get("timeout_duration_min", 5),
                    "exempt_channels": automod_cfg.get("anti_caps", {}).get("exempt_channels", []),
                    "exempt_roles": automod_cfg.get("anti_caps", {}).get("exempt_roles", [])
                },
                "mention_spam": {
                    "enabled": automod_cfg.get("mention_spam", {}).get("enabled", False),
                    "max_mentions": automod_cfg.get("mention_spam", {}).get("max_mentions", 4),
                    "action": automod_cfg.get("mention_spam", {}).get("action", "warn"),
                    "timeout_duration_min": automod_cfg.get("mention_spam", {}).get("timeout_duration_min", 5),
                    "exempt_channels": automod_cfg.get("mention_spam", {}).get("exempt_channels", []),
                    "exempt_roles": automod_cfg.get("mention_spam", {}).get("exempt_roles", [])
                },
                "anti_scam": {
                    "enabled": automod_cfg.get("anti_scam", {}).get("enabled", False),
                    "action": automod_cfg.get("anti_scam", {}).get("action", "warn"),
                    "timeout_duration_min": automod_cfg.get("anti_scam", {}).get("timeout_duration_min", 5)
                },
                "anti_alt": {
                    "enabled": automod_cfg.get("anti_alt", {}).get("enabled", False),
                    "min_age_days": automod_cfg.get("anti_alt", {}).get("min_age_days", 3),
                    "action": automod_cfg.get("anti_alt", {}).get("action", "kick")
                }
            },
            "verify": {
                "enabled": verify_cfg.get("enabled", False),
                "role_id": str(verify_cfg.get("role_id")) if verify_cfg.get("role_id") else "",
                "remove_role_id": str(verify_cfg.get("remove_role_id")) if verify_cfg.get("remove_role_id") else "",
                "verification_type": verify_cfg.get("verification_type", "captcha")
            },
            "autoresponder": autoresponder_cfg,
            "joinroles": {
                "enabled": joinroles_cfg.get("enabled", False),
                "user_roles": [str(r) for r in joinroles_cfg.get("user_roles", [])],
                "bot_roles": [str(r) for r in joinroles_cfg.get("bot_roles", [])]
            },
            "ticket": {
                "enabled": ticket_cfg.get("enabled", False),
                "panel_title": ticket_cfg.get("panel_title", ""),
                "panel_description": ticket_cfg.get("panel_description", ""),
                "panel_instructions": ticket_cfg.get("panel_instructions", ""),
                "panel_channel_id": str(ticket_cfg.get("panel_channel_id")) if ticket_cfg.get("panel_channel_id") else "",
                "log_channel_id": str(ticket_cfg.get("log_channel_id")) if ticket_cfg.get("log_channel_id") else "",
                "options_slots": [
                    {
                        "name": slot.get("name", ""),
                        "role_id": str(slot.get("role_id")) if slot.get("role_id") else "",
                        "category_id": str(slot.get("category_id")) if slot.get("category_id") else ""
                    }
                    for slot in ticket_cfg.get("options_slots", []) if isinstance(slot, dict)
                ]
            },
            "logs": logs_cfg,
            "automation": automation_cfg,
            "tempvoice": tempvoice_cfg,
            "level": level_cfg,
            "serverstats": serverstats_cfg
        }

        if "channels" in logs_cfg and isinstance(logs_cfg["channels"], dict):
            for k, v in logs_cfg["channels"].items():
                if v: logs_cfg["channels"][k] = str(v)
        if "roles" in logs_cfg and isinstance(logs_cfg["roles"], dict):
            for k, v in logs_cfg["roles"].items():
                if v: logs_cfg["roles"][k] = str(v)
                
        if "hubs" in tempvoice_cfg and isinstance(tempvoice_cfg["hubs"], list):
            for hub in tempvoice_cfg["hubs"]:
                if hub.get("hub_channel_id"): hub["hub_channel_id"] = str(hub["hub_channel_id"])
                if hub.get("category_id"): hub["category_id"] = str(hub["category_id"])
        
        return web.json_response({
            "permissions": user_perms,
            "channels": channels,
            "voice_channels": voice_channels,
            "categories": categories,
            "roles": roles,
            "config": config_data
        })

    async def api_guild_stats(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        if not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild ID"}, status=400)
        guild_id = int(guild_id_str)
        
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild:
            return web.json_response({"error": "Unauthorized or not found"}, status=403)
            
        try:
            days = int(request.query.get("days", "7"))
        except ValueError:
            days = 7
            
        from Database.mongodb import get_db
        db = get_db()
        
        from datetime import datetime, timedelta, timezone
        today = datetime.now(timezone.utc)
        
        stats = []
        if db is not None:
            for i in range(days - 1, -1, -1):
                d = today - timedelta(days=i)
                date_str = d.strftime("%Y-%m-%d")
                doc_id = f"{guild_id}_{date_str}"
                
                doc = db["GuildStats"].find_one({"_id": doc_id})
                if doc:
                    stats.append({
                        "date": date_str,
                        "joins": doc.get("joins", 0),
                        "leaves": doc.get("leaves", 0),
                        "messages": doc.get("messages", 0)
                    })
                else:
                    stats.append({
                        "date": date_str,
                        "joins": 0,
                        "leaves": 0,
                        "messages": 0
                    })
        
        today_str = today.strftime("%Y-%m-%d")
        today_doc = db["GuildStats"].find_one({"_id": f"{guild_id}_{today_str}"}) if db is not None else None
        
        return web.json_response({
            "total_members": guild.member_count,
            "today_joins": today_doc.get("joins", 0) if today_doc else 0,
            "today_leaves": today_doc.get("leaves", 0) if today_doc else 0,
            "today_messages": today_doc.get("messages", 0) if today_doc else 0,
            "history": stats
        })

    async def api_post_config(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        if not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild ID"}, status=400)
        guild_id = int(guild_id_str)
        
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild:
            return web.json_response({"error": "Unauthorized or not found"}, status=403)
            
        try:
            data = await request.json()

            if user_perms.get("is_admin") and "settings" in data:
                from Commands.WebDashboard._storage import save_settings_config
                save_settings_config(guild_id, data["settings"])

            if user_perms.get("can_channels") and "serverstats" in data:
                s_data = data.get("serverstats", {})
                ss_cfg = load_serverstats_config(guild_id)
                ss_cfg["category_id"] = str(s_data.get("category_id", "") or "")
                ss_cfg["category_name"] = str(s_data.get("category_name", "📊 Server Stats") or "📊 Server Stats")
                ss_cfg["users_enabled"] = bool(s_data.get("users_enabled"))
                ss_cfg["users_name"] = str(s_data.get("users_name", "Users: {count}") or "Users: {count}")
                ss_cfg["boosts_enabled"] = bool(s_data.get("boosts_enabled"))
                ss_cfg["boosts_name"] = str(s_data.get("boosts_name", "Boosts: {count}") or "Boosts: {count}")
                ss_cfg["bots_enabled"] = bool(s_data.get("bots_enabled"))
                ss_cfg["bots_name"] = str(s_data.get("bots_name", "Bots: {count}") or "Bots: {count}")
                ss_cfg["roles_enabled"] = bool(s_data.get("roles_enabled"))
                ss_cfg["roles_name"] = str(s_data.get("roles_name", "Roles: {count}") or "Roles: {count}")
                save_serverstats_config(guild_id, ss_cfg)

            def _clean_cloudinary(old_url: str, new_url: str):
                if old_url and old_url != new_url and "res.cloudinary.com" in old_url:
                    from Database.cloudinary_storage import delete_image_by_url
                    import asyncio
                    asyncio.create_task(asyncio.to_thread(delete_image_by_url, old_url))

            if user_perms.get("can_channels") and "welcome" in data:
                welcome_cfg = load_welcome_config(guild_id)
                w_data = data.get("welcome", {})
                
                _clean_cloudinary(welcome_cfg.get("image_url", ""), w_data.get("image_url", ""))
                _clean_cloudinary(welcome_cfg.get("embed_image", ""), w_data.get("embed_image", ""))
                _clean_cloudinary(welcome_cfg.get("embed_thumbnail", ""), w_data.get("embed_thumbnail", ""))
                _clean_cloudinary(welcome_cfg.get("embed_author_icon", ""), w_data.get("embed_author_icon", ""))
                _clean_cloudinary(welcome_cfg.get("embed_footer_icon", ""), w_data.get("embed_footer_icon", ""))

                welcome_cfg["enabled"] = bool(w_data.get("enabled"))
                cid = w_data.get("channel_id")
                welcome_cfg["channel_id"] = int(cid) if cid else None
                welcome_cfg["message"] = w_data.get("message", "")
                welcome_cfg["msg_mode"] = w_data.get("msg_mode", "image")
                welcome_cfg["image_url"] = w_data.get("image_url", "")
                welcome_cfg["embed_image"] = w_data.get("embed_image", "")
                welcome_cfg["embed_color"] = w_data.get("embed_color", "#5865F2")
                welcome_cfg["embed_title"] = w_data.get("embed_title", "")
                welcome_cfg["embed_description"] = w_data.get("embed_description", "")
                welcome_cfg["embed_thumbnail"] = w_data.get("embed_thumbnail", "")
                welcome_cfg["embed_footer"] = w_data.get("embed_footer", "")
                welcome_cfg["embed_author"] = w_data.get("embed_author", "")
                welcome_cfg["embed_author_icon"] = w_data.get("embed_author_icon", "")
                welcome_cfg["embed_footer_icon"] = w_data.get("embed_footer_icon", "")
                welcome_cfg["embed_fields"] = w_data.get("embed_fields", [])
                
                save_welcome_config(guild_id, welcome_cfg)

            if user_perms.get("can_channels") and "goodbye" in data:
                goodbye_cfg = load_goodbye_config(guild_id)
                g_data = data.get("goodbye", {})

                _clean_cloudinary(goodbye_cfg.get("image_url", ""), g_data.get("image_url", ""))
                _clean_cloudinary(goodbye_cfg.get("embed_image", ""), g_data.get("embed_image", ""))
                _clean_cloudinary(goodbye_cfg.get("embed_thumbnail", ""), g_data.get("embed_thumbnail", ""))
                _clean_cloudinary(goodbye_cfg.get("embed_author_icon", ""), g_data.get("embed_author_icon", ""))
                _clean_cloudinary(goodbye_cfg.get("embed_footer_icon", ""), g_data.get("embed_footer_icon", ""))

                goodbye_cfg["enabled"] = bool(g_data.get("enabled"))
                cid = g_data.get("channel_id")
                goodbye_cfg["channel_id"] = int(cid) if cid else None
                goodbye_cfg["message"] = g_data.get("message", "")
                goodbye_cfg["msg_mode"] = g_data.get("msg_mode", "image")
                goodbye_cfg["image_url"] = g_data.get("image_url", "")
                goodbye_cfg["embed_image"] = g_data.get("embed_image", "")
                goodbye_cfg["embed_color"] = g_data.get("embed_color", "#ED4245")
                goodbye_cfg["embed_title"] = g_data.get("embed_title", "")
                goodbye_cfg["embed_description"] = g_data.get("embed_description", "")
                goodbye_cfg["embed_thumbnail"] = g_data.get("embed_thumbnail", "")
                goodbye_cfg["embed_footer"] = g_data.get("embed_footer", "")
                goodbye_cfg["embed_author"] = g_data.get("embed_author", "")
                goodbye_cfg["embed_author_icon"] = g_data.get("embed_author_icon", "")
                goodbye_cfg["embed_footer_icon"] = g_data.get("embed_footer_icon", "")
                goodbye_cfg["embed_fields"] = g_data.get("embed_fields", [])
                    
                save_goodbye_config(guild_id, goodbye_cfg)

            if user_perms.get("can_channels") and "boost" in data:
                boost_cfg = load_boost_config(guild_id)
                b_data = data.get("boost", {})

                _clean_cloudinary(boost_cfg.get("image_url", ""), b_data.get("image_url", ""))
                _clean_cloudinary(boost_cfg.get("embed_image", ""), b_data.get("embed_image", ""))
                _clean_cloudinary(boost_cfg.get("embed_thumbnail", ""), b_data.get("embed_thumbnail", ""))
                _clean_cloudinary(boost_cfg.get("embed_author_icon", ""), b_data.get("embed_author_icon", ""))
                _clean_cloudinary(boost_cfg.get("embed_footer_icon", ""), b_data.get("embed_footer_icon", ""))

                boost_cfg["enabled"] = bool(b_data.get("enabled"))
                cid = b_data.get("channel_id")
                boost_cfg["channel_id"] = int(cid) if cid else None
                boost_cfg["message"] = b_data.get("message", "")
                boost_cfg["msg_mode"] = b_data.get("msg_mode", "image")
                boost_cfg["image_url"] = b_data.get("image_url", "")
                boost_cfg["embed_image"] = b_data.get("embed_image", "")
                boost_cfg["embed_color"] = b_data.get("embed_color", "#EB459E")
                boost_cfg["embed_title"] = b_data.get("embed_title", "")
                boost_cfg["embed_description"] = b_data.get("embed_description", "")
                boost_cfg["embed_thumbnail"] = b_data.get("embed_thumbnail", "")
                boost_cfg["embed_footer"] = b_data.get("embed_footer", "")
                boost_cfg["embed_author"] = b_data.get("embed_author", "")
                boost_cfg["embed_author_icon"] = b_data.get("embed_author_icon", "")
                boost_cfg["embed_footer_icon"] = b_data.get("embed_footer_icon", "")
                boost_cfg["embed_fields"] = b_data.get("embed_fields", [])
                    
                save_boost_config(guild_id, boost_cfg)

            if user_perms.get("can_messages") and "automod" in data:
                automod_cfg = load_automod_config(guild_id)
                am = data.get("automod", {})
                automod_cfg["enabled"] = bool(am.get("enabled"))
                
                gec = am.get("exempt_channels", [])
                ger = am.get("exempt_roles", [])
                if "global_exempt_channels" in automod_cfg:
                    del automod_cfg["global_exempt_channels"]
                if "global_exempt_roles" in automod_cfg:
                    del automod_cfg["global_exempt_roles"]
                
                automod_cfg["exempt_channels"] = [str(c) for c in gec] if isinstance(gec, list) else []
                automod_cfg["exempt_roles"] = [str(r) for r in ger] if isinstance(ger, list) else []

                def save_submodule(key: str, defaults: dict, extra_fields: list = None):
                    if key not in automod_cfg:
                        automod_cfg[key] = {}
                    src = am.get(key, {})
                    automod_cfg[key]["enabled"] = bool(src.get("enabled"))
                    automod_cfg[key]["action"] = src.get("action", defaults.get("action", "warn"))
                    automod_cfg[key]["timeout_duration_min"] = int(src.get("timeout_duration_min", defaults.get("timeout_duration_min", 5)))
                    
                    ec = src.get("exempt_channels", [])
                    er = src.get("exempt_roles", [])
                    automod_cfg[key]["exempt_channels"] = [str(c) for c in ec] if isinstance(ec, list) else []
                    automod_cfg[key]["exempt_roles"] = [str(r) for r in er] if isinstance(er, list) else []

                    if extra_fields:
                        for ef in extra_fields:
                            field_name = ef["name"]
                            if ef["type"] == int:
                                automod_cfg[key][field_name] = int(src.get(field_name, ef["default"]))
                            elif ef["type"] == list:
                                raw = src.get(field_name, ef["default"])
                                if isinstance(raw, str):
                                    automod_cfg[key][field_name] = [x.strip() for x in raw.split(",") if x.strip()]
                                else:
                                    automod_cfg[key][field_name] = raw

                save_submodule("banned_words", {}, [{"name": "words", "type": list, "default": []}])
                save_submodule("anti_spam", {}, [
                    {"name": "max_messages", "type": int, "default": 5},
                    {"name": "time_window_sec", "type": int, "default": 3}
                ])
                save_submodule("anti_invites", {}, [])
                save_submodule("anti_link", {}, [{"name": "blocked_domains", "type": list, "default": []}])
                save_submodule("anti_caps", {}, [])
                save_submodule("mention_spam", {}, [{"name": "max_mentions", "type": int, "default": 4}])

                if "anti_alt" not in automod_cfg:
                    automod_cfg["anti_alt"] = {}
                aalt = am.get("anti_alt", {})
                automod_cfg["anti_alt"]["enabled"] = bool(aalt.get("enabled"))
                automod_cfg["anti_alt"]["min_age_days"] = int(aalt.get("min_age_days", 3))
                automod_cfg["anti_alt"]["action"] = aalt.get("action", "kick")

                save_automod_config(guild_id, automod_cfg)

            if user_perms.get("can_roles") and "verify" in data:
                verify_cfg = load_verify_config(guild_id)
                verify_cfg["enabled"] = bool(data.get("verify", {}).get("enabled"))
                rid = data.get("verify", {}).get("role_id")
                verify_cfg["role_id"] = int(rid) if rid else None
                rrid = data.get("verify", {}).get("remove_role_id")
                verify_cfg["remove_role_id"] = int(rrid) if rrid else None
                verify_cfg["verification_type"] = data.get("verify", {}).get("verification_type", "captcha")
                verify_cfg["timeout_action"] = data.get("verify", {}).get("timeout_action", "none")
                try:
                    verify_cfg["timeout_minutes"] = int(data.get("verify", {}).get("timeout_minutes", 0))
                except (ValueError, TypeError):
                    verify_cfg["timeout_minutes"] = 0
                save_verify_config(guild_id, verify_cfg)

            if user_perms.get("can_messages") and "autoresponder" in data:
                save_responses(guild_id, data["autoresponder"])

            if user_perms.get("can_roles") and "joinroles" in data:
                jr_data = data["joinroles"]
                save_join_roles(guild_id, {
                    "enabled": bool(jr_data.get("enabled", False)),
                    "user_roles": [int(r) for r in jr_data.get("user_roles", []) if r],
                    "bot_roles": [int(r) for r in jr_data.get("bot_roles", []) if r]
                })

            if user_perms.get("can_channels") and "ticket" in data:
                from Commands.Ticket._storage import load_ticket_config, save_ticket_config
                ticket_cfg = load_ticket_config(guild_id)
                ticket_cfg["enabled"] = bool(data["ticket"].get("enabled"))
                
                title = data["ticket"].get("panel_title", "").strip()
                if title:
                    ticket_cfg["panel_title"] = title
                desc = data["ticket"].get("panel_description", "").strip()
                if desc:
                    ticket_cfg["panel_description"] = desc
                instr = data["ticket"].get("panel_instructions", "").strip()
                if instr:
                    ticket_cfg["panel_instructions"] = instr
                
                tid = data["ticket"].get("panel_channel_id")
                ticket_cfg["panel_channel_id"] = int(tid) if tid else None
                
                tlid = data["ticket"].get("log_channel_id")
                ticket_cfg["log_channel_id"] = int(tlid) if tlid else None
                
                if "options_slots" in data["ticket"]:
                    parsed_slots = []
                    for slot in data["ticket"]["options_slots"]:
                        rid = slot.get("role_id")
                        cid = slot.get("category_id")
                        parsed_slots.append({
                            "name": slot.get("name", "Option"),
                            "role_id": int(rid) if rid else None,
                            "category_id": int(cid) if cid else None
                        })
                    ticket_cfg["options_slots"] = parsed_slots
                    
                    ticket_cfg["options"] = [s.get("name", "Option") for s in parsed_slots]
                
                save_ticket_config(guild_id, ticket_cfg)

            if user_perms.get("can_channels") and "automation" in data:
                from Commands.ChannelAutomation._storage import load_automation_config, save_automation_config
                current_auto = load_automation_config(guild_id)
                new_auto = data["automation"]
                if isinstance(new_auto, dict) and "counting" in new_auto:
                    c_data = new_auto["counting"]
                    if not c_data.get("reset_count_requested"):
                        curr_cnt = current_auto.get("counting", {})
                        c_data["current_count"] = curr_cnt.get("current_count", 0)
                        c_data["last_user_id"] = curr_cnt.get("last_user_id", None)
                    else:
                        c_data["current_count"] = 0
                        c_data["last_user_id"] = None
                        if "reset_count_requested" in c_data:
                            del c_data["reset_count_requested"]
                save_automation_config(guild_id, new_auto)

            if user_perms.get("can_channels") and "logs" in data:
                l_cfg = load_log_config(guild_id)
                l_data = data["logs"]
                
                l_cfg["enabled"] = bool(l_data.get("enabled", False))
                l_cfg["executor_in_logs"] = bool(l_data.get("executor_in_logs", False))
                
                gec = l_data.get("global_exempt_channels", [])
                ger = l_data.get("global_exempt_roles", [])
                l_cfg["global_exempt_channels"] = [str(c) for c in gec] if isinstance(gec, list) else []
                l_cfg["global_exempt_roles"] = [str(r) for r in ger] if isinstance(ger, list) else []
                
                from Commands.Log._storage import DEFAULT_CATEGORIES
                if "channels" in l_data and isinstance(l_data["channels"], dict):
                    for k in DEFAULT_CATEGORIES:
                        c = l_data["channels"].get(k)
                        l_cfg["channels"][k] = str(c) if c else None
                
                if "roles" in l_data and isinstance(l_data["roles"], dict):
                    for k in DEFAULT_CATEGORIES:
                        r = l_data["roles"].get(k)
                        l_cfg["roles"][k] = str(r) if r else None
                
                if "categories" in l_data and isinstance(l_data["categories"], dict):
                    for k in DEFAULT_CATEGORIES:
                        l_cfg["categories"][k] = bool(l_data["categories"].get(k, False))
                
                save_log_config(guild_id, l_cfg)

            if user_perms.get("can_channels") and "tempvoice" in data:
                from Commands.JoinToCreate._storage import load_jtc_config, save_jtc_config
                jtc_cfg = load_jtc_config(guild_id)
                jtc_data = data["tempvoice"]
                
                jtc_cfg["enabled"] = bool(jtc_data.get("enabled", False))
                parsed_hubs = []
                for hub in jtc_data.get("hubs", []):
                    hid = hub.get("hub_channel_id")
                    cid = hub.get("category_id")
                    limit = hub.get("default_user_limit", 0)
                    if hid:
                        parsed_hubs.append({
                            "hub_channel_id": int(hid) if str(hid).isdigit() else None,
                            "category_id": int(cid) if cid and str(cid).isdigit() else None,
                            "default_user_limit": int(limit) if str(limit).isdigit() else 0
                        })
                jtc_cfg["hubs"] = [h for h in parsed_hubs if h["hub_channel_id"]]
                save_jtc_config(guild_id, jtc_cfg)

            if "level" in data:
                level_cfg = load_level_config(guild_id)
                ld = data["level"]
                level_cfg["enabled"] = bool(ld.get("enabled", False))
                level_cfg["msg_xp_enabled"] = bool(ld.get("msg_xp_enabled", True))
                level_cfg["msg_xp_amount"] = int(ld.get("msg_xp_amount", 20))
                level_cfg["msg_xp_cooldown"] = int(ld.get("msg_xp_cooldown", 60))
                level_cfg["voice_xp_enabled"] = bool(ld.get("voice_xp_enabled", False))
                level_cfg["voice_xp_ignore_muted"] = bool(ld.get("voice_xp_ignore_muted", True))
                level_cfg["voice_xp_ignore_solo"] = bool(ld.get("voice_xp_ignore_solo", False))
                level_cfg["voice_xp_amount"] = int(ld.get("voice_xp_amount", 6))
                level_cfg["cmd_xp_enabled"] = bool(ld.get("cmd_xp_enabled", True))
                level_cfg["cmd_xp_amount"] = int(ld.get("cmd_xp_amount", 15))
                level_cfg["cmd_xp_cooldown"] = int(ld.get("cmd_xp_cooldown", 60))
                level_cfg["react_xp_enabled"] = bool(ld.get("react_xp_enabled", True))
                level_cfg["react_xp_amount"] = int(ld.get("react_xp_amount", 15))
                level_cfg["react_xp_cooldown"] = int(ld.get("react_xp_cooldown", 300))
                level_cfg["reset_on_leave"] = bool(ld.get("reset_on_leave", False))
                level_cfg["reset_on_ban"] = bool(ld.get("reset_on_ban", False))
                level_cfg["vote_boost"] = bool(ld.get("vote_boost", True))
                try:
                    level_cfg["xp_multiplier"] = float(ld.get("xp_multiplier", 1.0))
                except (ValueError, TypeError):
                    level_cfg["xp_multiplier"] = 1.0
                level_cfg["channel_mode"] = ld.get("channel_mode", "blacklist")
                level_cfg["role_mode"] = ld.get("role_mode", "blacklist")
                level_cfg["blocked_channels"] = ld.get("blocked_channels", [])
                level_cfg["blocked_roles"] = ld.get("blocked_roles", [])
                level_cfg["levelup_channel"] = ld.get("levelup_channel", "current")
                level_cfg["leaderboard_url"] = ld.get("leaderboard_url", "")
                level_cfg["leaderboard_channel"] = ld.get("leaderboard_channel", "")
                level_cfg["leaderboard_color"] = ld.get("leaderboard_color", "#3B82F6")
                level_cfg["levelup_conditional"] = ld.get("levelup_conditional", "")
                level_cfg["levelup_show_avatar"] = bool(ld.get("levelup_show_avatar", True))
                level_cfg["levelup_message_content"] = ld.get("levelup_message_content", "{user_mention}")
                level_cfg["levelup_embed_author"] = ld.get("levelup_embed_author", "")
                level_cfg["levelup_embed_title"] = ld.get("levelup_embed_title", "🎉 Level Up!")
                level_cfg["levelup_embed_description"] = ld.get("levelup_embed_description", "")
                level_cfg["levelup_embed_image"] = ld.get("levelup_embed_image", "")
                level_cfg["levelup_embed_footer"] = ld.get("levelup_embed_footer", "")
                level_cfg["level_roles_stack"] = bool(ld.get("level_roles_stack", False))
                level_cfg["level_roles_rejoin"] = bool(ld.get("level_roles_rejoin", False))
                level_cfg["level_roles"] = ld.get("level_roles", [])
                level_cfg["stat_roles_msg_stack"] = bool(ld.get("stat_roles_msg_stack", False))
                level_cfg["stat_roles_msg_cooldown"] = int(ld.get("stat_roles_msg_cooldown", 5))
                level_cfg["stat_roles_msg"] = ld.get("stat_roles_msg", [])
                level_cfg["stat_roles_voice_stack"] = bool(ld.get("stat_roles_voice_stack", False))
                level_cfg["stat_roles_voice_cooldown"] = int(ld.get("stat_roles_voice_cooldown", 5))
                level_cfg["stat_roles_voice"] = ld.get("stat_roles_voice", [])
                level_cfg["stat_roles_react_stack"] = bool(ld.get("stat_roles_react_stack", False))
                level_cfg["stat_roles_react_cooldown"] = int(ld.get("stat_roles_react_cooldown", 5))
                level_cfg["stat_roles_react"] = ld.get("stat_roles_react", [])
                level_cfg["role_boosters_stack"] = bool(ld.get("role_boosters_stack", True))
                level_cfg["role_boosters"] = ld.get("role_boosters", [])
                level_cfg["channel_boosters"] = ld.get("channel_boosters", [])
                save_level_config(guild_id, level_cfg)

                pid = ticket_cfg.get("panel_channel_id")
                mid = ticket_cfg.get("panel_message_id")
                if pid and mid:
                    ch = guild.get_channel(pid)
                    if ch:
                        try:
                            msg = await ch.fetch_message(mid)
                            from Commands.Ticket._views import PersistentTicketPanelLayout
                            view = PersistentTicketPanelLayout(
                                title=ticket_cfg.get("panel_title", "Support Ticket Desk"),
                                description=ticket_cfg.get("panel_description", "Click the button below to open a direct support channel with our team."),
                                instructions=ticket_cfg.get("panel_instructions", "> Select your desired inquiry category in the dropdown menu below, then click **Create Ticket** to open your private channel."),
                                options_slots=ticket_cfg.get("options_slots", [])
                            )
                            from Embeds import get_command_embed
                            kwargs = get_command_embed(guild_id, "ticket", msg_type="panel", title=view.panel_title, description=view.panel_desc, instructions=view.panel_instructions, components=view.children)
                            await msg.edit(**kwargs, allowed_mentions=discord.AllowedMentions.none())
                        except Exception:
                            pass
            
            return web.json_response({"success": True})
        except Exception as e:
            return web.json_response({"error": str(e)}, status=400)

    async def api_action_send_verify(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        if not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild ID"}, status=400)
        guild_id = int(guild_id_str)
        
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild or not user_perms.get("can_roles"):
            return web.json_response({"error": "Unauthorized or missing Manage Roles permission"}, status=403)
            
        try:
            data = await request.json()
            channel_id = data.get("channel_id")
            if not channel_id:
                return web.json_response({"error": "No channel_id provided"}, status=400)
                
            channel = guild.get_channel(int(channel_id))
            if not channel:
                return web.json_response({"error": "Channel not found"}, status=400)
                
            from Embeds import get_command_embed
            kwargs = get_command_embed(guild_id, "verify", msg_type="panel")
            await channel.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())

            verify_cfg = load_verify_config(guild_id)
            verify_cfg["channel_id"] = channel.id
            save_verify_config(guild_id, verify_cfg)
            
            return web.json_response({"success": True})
        except Exception as e:
            return web.json_response({"error": str(e)}, status=400)

    async def api_action_send_ticket(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        if not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild ID"}, status=400)
        guild_id = int(guild_id_str)
        
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild or not user_perms.get("can_channels"):
            return web.json_response({"error": "Unauthorized or missing Manage Channels permission"}, status=403)
            
        try:
            data = await request.json()
            channel_id = data.get("channel_id")
            if not channel_id:
                return web.json_response({"error": "No channel_id provided"}, status=400)
                
            channel = guild.get_channel(int(channel_id))
            if not channel:
                return web.json_response({"error": "Channel not found"}, status=400)
                
            from Commands.Ticket._views import PersistentTicketPanelLayout
            from Commands.Ticket._storage import load_ticket_config, save_ticket_config
            from Embeds import get_command_embed
            
            ticket_cfg = load_ticket_config(guild_id)
            view = PersistentTicketPanelLayout(
                title=ticket_cfg.get("panel_title", "Support Ticket Desk"),
                description=ticket_cfg.get("panel_description", "Click the button below to open a direct support channel with our team."),
                instructions=ticket_cfg.get("panel_instructions", "> Select your desired inquiry category in the dropdown menu below, then click **Create Ticket** to open your private channel."),
                options_slots=ticket_cfg.get("options_slots", [])
            )
            kwargs = get_command_embed(guild_id, "ticket", msg_type="panel", title=view.panel_title, description=view.panel_desc, instructions=view.panel_instructions, components=view.children)
            msg = await channel.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())

            ticket_cfg["panel_channel_id"] = channel.id
            ticket_cfg["panel_message_id"] = msg.id
            save_ticket_config(guild_id, ticket_cfg)
            
            return web.json_response({"success": True})
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)


    async def api_action_send_embed(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        if not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild ID"}, status=400)
        guild_id = int(guild_id_str)
        
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild or not user_perms.get("can_channels"):
            return web.json_response({"error": "Unauthorized or missing Manage Channels permission"}, status=403)
            
        try:
            data = await request.json()
            channel_id = data.get("channel_id")
            if not channel_id:
                return web.json_response({"error": "No channel_id provided"}, status=400)
                
            channel = guild.get_channel(int(channel_id))
            if not channel:
                return web.json_response({"error": "Channel not found"}, status=400)
                
            mode = data.get("mode", "normal")
            components = data.get("components", [])
            content_text = data.get("content", "").strip()
            
            title = data.get("title", "").strip()
            desc = data.get("description", "").strip()
            url = data.get("url", "").strip()
            color = data.get("color", "")
            author_name = data.get("author_name", "").strip()
            author_icon = data.get("author_icon", "").strip()
            image = data.get("image", "").strip()
            thumbnail = data.get("thumbnail", "").strip()
            footer_text = data.get("footer_text", "").strip()
            footer_icon = data.get("footer_icon", "").strip()
            fields = data.get("fields", [])
            
            member_count = guild.member_count or len(guild.members)
            server_name = guild.name
            
            def replace_vars(text: str) -> str:
                if not text: return text
                text = text.replace("{count}", str(member_count))
                text = text.replace("{server}", server_name)
                # Note: {user} and {username} are not replaced because this command is triggered from dashboard, not by a joining user.
                return text

            content_text = replace_vars(content_text)
            title = replace_vars(title)
            desc = replace_vars(desc)
            author_name = replace_vars(author_name)
            footer_text = replace_vars(footer_text)
            
            for f in fields:
                if "name" in f: f["name"] = replace_vars(f["name"])
                if "value" in f: f["value"] = replace_vars(f["value"])
            
            msg_kwargs = {}
            if content_text:
                msg_kwargs["content"] = content_text

            if mode == "components":
                from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button
                view = LayoutView(timeout=None)
                elements = []
                
                if author_name:
                    elements.append(TextDisplay(content=f"**{author_name}**"))
                if title:
                    elements.append(TextDisplay(content=f"### {title}"))
                if desc:
                    elements.append(TextDisplay(content=desc))
                    
                if fields:
                    if elements: elements.append(Separator(spacing=discord.SeparatorSpacing.small))
                    for f in fields:
                        fname = f.get("name", "").strip() or "​"
                        fvalue = f.get("value", "").strip() or "​"
                        elements.append(TextDisplay(content=f"**{fname}**\\n{fvalue}"))
                        
                if footer_text:
                    if elements: elements.append(Separator(spacing=discord.SeparatorSpacing.small))
                    elements.append(TextDisplay(content=f"-# {footer_text}"))
                    
                if elements:
                    view.add_item(Container(*elements))
                    
                if components:
                    for comp in components:
                        if comp.get("style") == 5: # URL Button
                            url_str = comp.get("url")
                            label = comp.get("label", "Link")
                            if url_str and url_str.startswith("http"):
                                view.add_item(ActionRow(Button(style=discord.ButtonStyle.link, url=url_str, label=label)))
                                
                if len(view.children) > 0:
                    msg_kwargs["view"] = view
                    
                if not content_text and not elements:
                    return web.json_response({"error": "Message cannot be completely empty"}, status=400)
                    
                await channel.send(**msg_kwargs)
                return web.json_response({"success": True})
            else:
                embed = discord.Embed()
                if title: embed.title = title
                if desc: embed.description = desc
                if url: embed.url = url
                if color:
                    try: embed.color = discord.Color(int(color.replace("#", ""), 16))
                    except Exception: pass
                if author_name:
                    kwargs = {"name": author_name}
                    if author_icon: kwargs["icon_url"] = author_icon
                    embed.set_author(**kwargs)
                if image: embed.set_image(url=image)
                if thumbnail: embed.set_thumbnail(url=thumbnail)
                if footer_text:
                    kwargs = {"text": footer_text}
                    if footer_icon: kwargs["icon_url"] = footer_icon
                    embed.set_footer(**kwargs)
                for f in fields:
                    fname = f.get("name", "").strip() or "​"
                    fvalue = f.get("value", "").strip() or "​"
                    finline = f.get("inline", False)
                    embed.add_field(name=fname, value=fvalue, inline=finline)
                    
                if embed.title or embed.description or embed.author or embed.image or embed.footer or embed.fields:
                    msg_kwargs["embed"] = embed
                    
                if components:
                    view = discord.ui.View(timeout=None)
                    for comp in components:
                        if comp.get("style") == 5:
                            url_str = comp.get("url")
                            label = comp.get("label", "Link")
                            if url_str and url_str.startswith("http"):
                                view.add_item(discord.ui.Button(style=discord.ButtonStyle.link, url=url_str, label=label))
                    if len(view.children) > 0:
                        msg_kwargs["view"] = view
                        
                if not content_text and "embed" not in msg_kwargs:
                    return web.json_response({"error": "Message cannot be completely empty"}, status=400)
                    
                await channel.send(**msg_kwargs)
                return web.json_response({"success": True})
        except discord.Forbidden:
            return web.json_response({"error": "Bot missing permissions to send message in that channel"}, status=403)
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    async def api_action_test_levelup(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        if not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild ID"}, status=400)
        guild_id = int(guild_id_str)
        
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild or not user_perms.get("can_channels"):
            return web.json_response({"error": "Unauthorized or missing Manage Channels permission"}, status=403)
            
        try:
            data = await request.json()
            channel_id = data.get("channel_id")
            
            target_ch = None
            if channel_id and channel_id != "current":
                target_ch = guild.get_channel(int(channel_id))
            
            # If no channel selected or 'current', try to find a valid text channel
            if not target_ch:
                target_ch = next((ch for ch in guild.text_channels if ch.permissions_for(guild.me).send_messages), None)
                
            if not target_ch:
                return web.json_response({"error": "No valid channel found to send the test message"}, status=400)
                
            import discord
            import re
            
            member = guild.me
            
            content = data.get("message", "{user_mention}")
            title = data.get("embed_title", "🎉 Level Up!")
            desc = data.get("embed_description", "")
            author = data.get("embed_author", "")
            footer = data.get("embed_footer", "")
            image = data.get("embed_image", "")
            show_avatar = data.get("show_avatar", True)
            
            def replace_vars(text):
                text = text.replace("{user_mention}", member.mention)
                text = text.replace("{user_globalname}", member.global_name or member.display_name)
                text = text.replace("{level}", "99")
                text = text.replace("{roles}", "None")
                return text
                
            content = replace_vars(content)
            title = replace_vars(title)
            desc = replace_vars(desc)
            
            embed = discord.Embed(title=title, description=desc, color=0x3B82F6)
            if author:
                embed.set_author(name=replace_vars(author))
            if footer:
                embed.set_footer(text=replace_vars(footer))
            if image:
                embed.set_image(url=image)
            if show_avatar:
                embed.set_thumbnail(url=member.display_avatar.url)
                
            await target_ch.send(content=content if content else None, embed=embed)
            return web.json_response({"success": True})
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    
    async def api_get_messages(self, request: web.Request):
        user = await self.get_user_session(request)
        if not user: return web.json_response({"error": "Unauthorized"}, status=401)
        guild_id = int(request.match_info['id'])
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild:
            return web.json_response({"error": "Forbidden"}, status=403)
            
        from Database.mongodb import get_db
        db = get_db()
        cursor = db["CustomMessages"].find({"guild_id": str(guild_id)}, {"_id": 0})
        messages = list(cursor)
        return web.json_response(messages)
        
    async def api_action_send_honeypot(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        if not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild ID"}, status=400)
        guild_id = int(guild_id_str)
        
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild or not user_perms.get("can_channels"):
            return web.json_response({"error": "Unauthorized or missing Manage Channels permission"}, status=403)
            
        try:
            data = await request.json()
            channel_id = data.get("channel_id")
            if not channel_id:
                return web.json_response({"error": "No channel_id provided"}, status=400)
                
            channel = guild.get_channel(int(channel_id))
            if not channel:
                return web.json_response({"error": "Channel not found in this guild"}, status=404)
                
            message_template = data.get("message", "")
            if not message_template:
                return web.json_response({"error": "No message provided"}, status=400)
                
            from Commands.ChannelAutomation._storage import load_automation_config, save_automation_config
            config = load_automation_config(guild_id)
            auto_ban_cfg = config.get("auto_ban", {})
            ban_count = auto_ban_cfg.get("ban_count", 0)
            
            text = message_template.replace("{count}", str(ban_count))
            msg = await channel.send(content=text)
            
            auto_ban_cfg["message_id"] = str(msg.id)
            config["auto_ban"] = auto_ban_cfg
            save_automation_config(guild_id, config)
            
            return web.json_response({"success": True})
        except discord.Forbidden:
            return web.json_response({"error": "Bot lacks permission to send messages in that channel"}, status=403)
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    async def api_save_message(self, request: web.Request):
        user = await self.get_user_session(request)
        if not user: return web.json_response({"error": "Unauthorized"}, status=401)
        guild_id = int(request.match_info['id'])
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild:
            return web.json_response({"error": "Forbidden"}, status=403)
            
        try:
            data = await request.json()
            import uuid
            msg_id = data.get("id")
            if not msg_id:
                msg_id = str(uuid.uuid4())
                data["id"] = msg_id
                
            data["guild_id"] = str(guild_id)
            # Default name if missing
            if not data.get("name"):
                data["name"] = "Untitled Message"
            
            from Database.mongodb import get_db
            db = get_db()
            db["CustomMessages"].replace_one({"id": msg_id, "guild_id": str(guild_id)}, data, upsert=True)
            return web.json_response({"success": True, "id": msg_id})
        except Exception as e:
            return web.json_response({"error": str(e)}, status=400)
            
    async def api_delete_message(self, request: web.Request):
        user = await self.get_user_session(request)
        if not user: return web.json_response({"error": "Unauthorized"}, status=401)
        guild_id = int(request.match_info['id'])
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild:
            return web.json_response({"error": "Forbidden"}, status=403)
            
        msg_id = request.match_info['msg_id']
        from Database.mongodb import get_db
        db = get_db()
        db["CustomMessages"].delete_one({"id": msg_id, "guild_id": str(guild_id)})
        return web.json_response({"success": True})

    async def api_upload_image(self, request: web.Request):
        user = await self.get_user_session(request)
        if not user:
            return web.json_response({"error": "Unauthorized"}, status=401)

        try:
            import uuid, pathlib, mimetypes
            reader = await request.multipart()
            field = await reader.next()
            if not field or field.name != "file":
                return web.json_response({"error": "No file field"}, status=400)

            content_type = field.headers.get("Content-Type", "image/png")
            ext = mimetypes.guess_extension(content_type) or ".png"
            if ext == ".jpe":
                ext = ".jpg"

            file_bytes = b""
            while True:
                chunk = await field.read_chunk(8192)
                if not chunk:
                    break
                file_bytes += chunk

            from Database.cloudinary_storage import upload_image_bytes
            import asyncio
            url = await asyncio.to_thread(upload_image_bytes, file_bytes, "Orbit")
            
            if url:
                return web.json_response({"success": True, "url": url})
            else:
                return web.json_response({"error": "Upload failed"}, status=500)
        except Exception as e:
            return web.json_response({"error": str(e)}, status=400)

    async def api_action_setup_serverstats(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        if not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild ID"}, status=400)
        guild_id = int(guild_id_str)
        
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild:
            return web.json_response({"error": "Unauthorized or not found"}, status=403)
            
        try:
            cog = self.bot.get_cog("ServerStats")
            if not cog:
                from Commands.ServerStats.serverstats import ServerStats
                cog = ServerStats(self.bot)
            
            updated_config = await cog.sync_guild_stats(guild)
            return web.json_response({"success": True, "config": updated_config})
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    async def api_support_invite(self, request: web.Request):
        SUPPORT_GUILD_ID = 1525603130358759575
        guild = self.bot.get_guild(SUPPORT_GUILD_ID)
        if not guild:
            return web.json_response({"error": "Support guild not found"}, status=404)
        try:
            
            for channel in guild.text_channels:
                try:
                    invite = await channel.create_invite(max_age=86400, max_uses=1, unique=True, reason="Website support invite")
                    return web.json_response({"url": invite.url})
                except Exception:
                    continue
            return web.json_response({"error": "No suitable channel found"}, status=500)
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

def setup_web_app(bot: discord.ext.commands.Bot) -> web.Application:
    dashboard = WebDashboard(bot)
    app = web.Application(client_max_size=10 * 1024 * 1024)  
    
    app.router.add_get("/", dashboard.handle_index)
    app.router.add_static("/static", "Web/static")
    
    app.router.add_get("/auth/login", dashboard.handle_login)
    app.router.add_get("/auth/callback", dashboard.handle_callback)
    app.router.add_get("/auth/logout", dashboard.handle_logout)
    
    app.router.add_get("/api/user", dashboard.api_user)
    app.router.add_get("/api/stats", dashboard.api_stats)
    app.router.add_get("/api/guilds", dashboard.api_guilds)
    app.router.add_get("/api/config/{id}", dashboard.api_get_config)
    app.router.add_get("/api/guild_stats/{id}", dashboard.api_guild_stats)
    app.router.add_post("/api/config/{id}", dashboard.api_post_config)
    app.router.add_post("/api/action/{id}/setup_serverstats", dashboard.api_action_setup_serverstats)
    app.router.add_post("/api/action/{id}/send_verify_panel", dashboard.api_action_send_verify)
    app.router.add_post("/api/action/{id}/send_ticket_panel", dashboard.api_action_send_ticket)
    app.router.add_post("/api/action/{id}/send_embed", dashboard.api_action_send_embed)
    app.router.add_post("/api/action/{id}/send_honeypot", dashboard.api_action_send_honeypot)
    app.router.add_get("/api/messages/{id}", dashboard.api_get_messages)
    app.router.add_post("/api/messages/{id}", dashboard.api_save_message)
    app.router.add_delete("/api/messages/{id}/{msg_id}", dashboard.api_delete_message)
    app.router.add_post("/api/server/{id}/test-levelup", dashboard.api_action_test_levelup)
    app.router.add_post("/api/upload/image", dashboard.api_upload_image)
    app.router.add_get("/api/support-invite", dashboard.api_support_invite)
    
    return app

