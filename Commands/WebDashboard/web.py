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
        except Exception:
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
            # Exchange code
            async with session.post("https://discord.com/api/oauth2/token", data=data) as resp:
                if resp.status != 200:
                    err = await resp.text()
                    return web.Response(text=f"Failed to exchange code: {err}", status=400)
                token_info = await resp.json()
                access_token = token_info["access_token"]
                
            # Get user info
            headers = {"Authorization": f"Bearer {access_token}"}
            async with session.get("https://discord.com/api/users/@me", headers=headers) as resp:
                if resp.status != 200:
                    return web.Response(text="Failed to fetch user info", status=400)
                user_info = await resp.json()
                
        # Create session
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
                
        manageable_guilds = []
        for g in user_guilds:
            # Permissions Check
            perms = int(g["permissions"])
            is_admin = (perms & 0x8) == 0x8
            manage_guild = (perms & 0x20) == 0x20
            manage_roles = (perms & 0x10000000) == 0x10000000
            manage_channels = (perms & 0x10) == 0x10
            manage_messages = (perms & 0x2000) == 0x2000
            
            if is_admin or manage_guild or manage_roles or manage_channels or manage_messages:
                # Check if bot is in guild
                bot_guild = self.bot.get_guild(int(g["id"]))
                if bot_guild:
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
            
        # Get actual channels and roles for dropdowns
        channels = [{"id": str(c.id), "name": c.name} for c in guild.text_channels]
        categories = [{"id": str(c.id), "name": c.name} for c in guild.categories]
        roles = [{"id": str(r.id), "name": r.name, "color": str(r.color) if str(r.color) != "#000000" else "#b9bbbe"} for r in guild.roles if not r.is_default()]
        
        # Load configs
        welcome_cfg = load_welcome_config(guild_id)
        automod_cfg = load_automod_config(guild_id)
        verify_cfg = load_verify_config(guild_id)
        goodbye_cfg = load_goodbye_config(guild_id)
        autoresponder_cfg = load_responses(guild_id)
        joinroles_cfg = load_join_roles(guild_id)
        
        from Commands.Ticket._storage import load_ticket_config
        ticket_cfg = load_ticket_config(guild_id)

        config_data = {
            "welcome": {
                "enabled": welcome_cfg.get("enabled", False),
                "channel_id": str(welcome_cfg.get("channel_id")) if welcome_cfg.get("channel_id") else "",
                "message": welcome_cfg.get("message", ""),
                "image_url": welcome_cfg.get("image_url", "")
            },
            "goodbye": {
                "enabled": goodbye_cfg.get("enabled", False),
                "channel_id": str(goodbye_cfg.get("channel_id")) if goodbye_cfg.get("channel_id") else "",
                "message": goodbye_cfg.get("message", ""),
                "image_url": goodbye_cfg.get("image_url", "")
            },
            "automod": {
                "enabled": automod_cfg.get("enabled", False),
                "anti_link": {
                    "enabled": automod_cfg.get("anti_link", {}).get("enabled", False),
                    "action": automod_cfg.get("anti_link", {}).get("action", "warn"),
                    "timeout_duration_min": automod_cfg.get("anti_link", {}).get("timeout_duration_min", 5),
                    "blocked_domains": automod_cfg.get("anti_link", {}).get("blocked_domains", ["discord.gg/", "discord.com/invite/"])
                },
                "anti_spam": {
                    "enabled": automod_cfg.get("anti_spam", {}).get("enabled", False),
                    "max_messages": automod_cfg.get("anti_spam", {}).get("max_messages", 5),
                    "time_window_sec": automod_cfg.get("anti_spam", {}).get("time_window_sec", 3),
                    "max_mentions": automod_cfg.get("anti_spam", {}).get("max_mentions", 4),
                    "action": automod_cfg.get("anti_spam", {}).get("action", "warn"),
                    "timeout_duration_min": automod_cfg.get("anti_spam", {}).get("timeout_duration_min", 5)
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
            "joinroles": [str(r) for r in joinroles_cfg],
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
            }
        }
        
        return web.json_response({
            "permissions": user_perms,
            "channels": channels,
            "categories": categories,
            "roles": roles,
            "config": config_data
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
            
            # Welcome (Requires can_channels)
            if user_perms.get("can_channels") and "welcome" in data:
                welcome_cfg = load_welcome_config(guild_id)
                welcome_cfg["enabled"] = bool(data.get("welcome", {}).get("enabled"))
                cid = data.get("welcome", {}).get("channel_id")
                welcome_cfg["channel_id"] = int(cid) if cid else None
                msg = data.get("welcome", {}).get("message", "")
                if msg:
                    welcome_cfg["message"] = msg
                img_url = data.get("welcome", {}).get("image_url", "")
                if img_url is not None:
                    welcome_cfg["image_url"] = img_url
                save_welcome_config(guild_id, welcome_cfg)
                
            # Goodbye (Requires can_channels)
            if user_perms.get("can_channels") and "goodbye" in data:
                goodbye_cfg = load_goodbye_config(guild_id)
                goodbye_cfg["enabled"] = bool(data.get("goodbye", {}).get("enabled"))
                cid = data.get("goodbye", {}).get("channel_id")
                goodbye_cfg["channel_id"] = int(cid) if cid else None
                msg = data.get("goodbye", {}).get("message", "")
                if msg:
                    goodbye_cfg["message"] = msg
                img_url = data.get("goodbye", {}).get("image_url", "")
                if img_url is not None:
                    goodbye_cfg["image_url"] = img_url
                save_goodbye_config(guild_id, goodbye_cfg)
            
            # AutoMod (Requires can_messages)
            if user_perms.get("can_messages") and "automod" in data:
                automod_cfg = load_automod_config(guild_id)
                am = data.get("automod", {})
                automod_cfg["enabled"] = bool(am.get("enabled"))

                # Anti-Link
                if "anti_link" not in automod_cfg:
                    automod_cfg["anti_link"] = {}
                al = am.get("anti_link", {})
                automod_cfg["anti_link"]["enabled"] = bool(al.get("enabled"))
                automod_cfg["anti_link"]["action"] = al.get("action", "warn")
                automod_cfg["anti_link"]["timeout_duration_min"] = int(al.get("timeout_duration_min", 5))
                raw_domains = al.get("blocked_domains", "")
                if isinstance(raw_domains, str):
                    automod_cfg["anti_link"]["blocked_domains"] = [d.strip() for d in raw_domains.split(",") if d.strip()]
                elif isinstance(raw_domains, list):
                    automod_cfg["anti_link"]["blocked_domains"] = raw_domains

                # Anti-Spam
                if "anti_spam" not in automod_cfg:
                    automod_cfg["anti_spam"] = {}
                asp = am.get("anti_spam", {})
                automod_cfg["anti_spam"]["enabled"] = bool(asp.get("enabled"))
                automod_cfg["anti_spam"]["max_messages"] = int(asp.get("max_messages", 5))
                automod_cfg["anti_spam"]["time_window_sec"] = int(asp.get("time_window_sec", 3))
                automod_cfg["anti_spam"]["max_mentions"] = int(asp.get("max_mentions", 4))
                automod_cfg["anti_spam"]["action"] = asp.get("action", "warn")
                automod_cfg["anti_spam"]["timeout_duration_min"] = int(asp.get("timeout_duration_min", 5))

                # Anti-Alt
                if "anti_alt" not in automod_cfg:
                    automod_cfg["anti_alt"] = {}
                aalt = am.get("anti_alt", {})
                automod_cfg["anti_alt"]["enabled"] = bool(aalt.get("enabled"))
                automod_cfg["anti_alt"]["min_age_days"] = int(aalt.get("min_age_days", 3))
                automod_cfg["anti_alt"]["action"] = aalt.get("action", "kick")

                save_automod_config(guild_id, automod_cfg)
            
            # Verify (Requires can_roles)
            if user_perms.get("can_roles") and "verify" in data:
                verify_cfg = load_verify_config(guild_id)
                verify_cfg["enabled"] = bool(data.get("verify", {}).get("enabled"))
                rid = data.get("verify", {}).get("role_id")
                verify_cfg["role_id"] = int(rid) if rid else None
                rrid = data.get("verify", {}).get("remove_role_id")
                verify_cfg["remove_role_id"] = int(rrid) if rrid else None
                verify_cfg["verification_type"] = data.get("verify", {}).get("verification_type", "captcha")
                save_verify_config(guild_id, verify_cfg)
            
            # AutoResponder (Requires can_messages)
            if user_perms.get("can_messages") and "autoresponder" in data:
                save_responses(guild_id, data["autoresponder"])
                
            # JoinRoles (Requires can_roles)
            if user_perms.get("can_roles") and "joinroles" in data:
                roles_to_save = []
                for r in data["joinroles"]:
                    if r:
                        roles_to_save.append(int(r))
                save_join_roles(guild_id, roles_to_save)
                
            # Ticket (Requires can_channels)
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
                    # Update 'options' list as well to keep backwards compatibility
                    ticket_cfg["options"] = [s.get("name", "Option") for s in parsed_slots]
                
                save_ticket_config(guild_id, ticket_cfg)
                
                # Attempt to update the existing panel message dynamically
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
                            await msg.edit(view=view, allowed_mentions=discord.AllowedMentions.none())
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
                
            from Commands.Verify._views import PersistentVerifyLayout
            view = PersistentVerifyLayout()
            await channel.send(view=view, allowed_mentions=discord.AllowedMentions.none())
            
            # Update storage to set the panel channel
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
            
            ticket_cfg = load_ticket_config(guild_id)
            view = PersistentTicketPanelLayout(
                title=ticket_cfg.get("panel_title", "Support Ticket Desk"),
                description=ticket_cfg.get("panel_description", "Click the button below to open a direct support channel with our team."),
                instructions=ticket_cfg.get("panel_instructions", "> Select your desired inquiry category in the dropdown menu below, then click **Create Ticket** to open your private channel."),
                options_slots=ticket_cfg.get("options_slots", [])
            )
            
            msg = await channel.send(view=view, allowed_mentions=discord.AllowedMentions.none())
            
            # Update storage
            ticket_cfg["panel_channel_id"] = channel.id
            ticket_cfg["panel_message_id"] = msg.id
            save_ticket_config(guild_id, ticket_cfg)
            
            return web.json_response({"success": True})
        except Exception as e:
            return web.json_response({"error": str(e)}, status=400)

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

            upload_dir = pathlib.Path("Web/static/uploads")
            upload_dir.mkdir(parents=True, exist_ok=True)

            filename = f"{uuid.uuid4().hex}{ext}"
            filepath = upload_dir / filename

            with open(filepath, "wb") as f:
                while True:
                    chunk = await field.read_chunk(8192)
                    if not chunk:
                        break
                    f.write(chunk)

            url = f"/static/uploads/{filename}"
            return web.json_response({"success": True, "url": url})
        except Exception as e:
            return web.json_response({"error": str(e)}, status=400)

    async def api_support_invite(self, request: web.Request):
        SUPPORT_GUILD_ID = 1525603130358759575
        guild = self.bot.get_guild(SUPPORT_GUILD_ID)
        if not guild:
            return web.json_response({"error": "Support guild not found"}, status=404)
        try:
            # Find the first text channel we can create an invite in
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
    app = web.Application(client_max_size=10 * 1024 * 1024)  # 10 MB max upload
    
    app.router.add_get("/", dashboard.handle_index)
    app.router.add_static("/static", "Web/static")
    
    app.router.add_get("/auth/login", dashboard.handle_login)
    app.router.add_get("/auth/callback", dashboard.handle_callback)
    app.router.add_get("/auth/logout", dashboard.handle_logout)
    
    app.router.add_get("/api/user", dashboard.api_user)
    app.router.add_get("/api/stats", dashboard.api_stats)
    app.router.add_get("/api/guilds", dashboard.api_guilds)
    app.router.add_get("/api/config/{id}", dashboard.api_get_config)
    app.router.add_post("/api/config/{id}", dashboard.api_post_config)
    app.router.add_post("/api/action/{id}/send_verify_panel", dashboard.api_action_send_verify)
    app.router.add_post("/api/action/{id}/send_ticket_panel", dashboard.api_action_send_ticket)
    app.router.add_post("/api/upload/image", dashboard.api_upload_image)
    app.router.add_get("/api/support-invite", dashboard.api_support_invite)
    
    return app
