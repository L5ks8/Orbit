import os
import discord
from aiohttp import web
from typing import Dict, Any, Optional

from Website.backend.api.auth import AuthMixin
from Website.backend.api.config import ConfigMixin
from Website.backend.api.guilds import GuildsMixin
from Website.backend.api.actions import ActionsMixin

class WebDashboard(AuthMixin, ConfigMixin, GuildsMixin, ActionsMixin):
    def __init__(self, bot):
        self.bot = bot
        self.client_id = os.environ.get("DISCORD_CLIENT_ID", "")
        self.client_secret = os.environ.get("DISCORD_CLIENT_SECRET", "")
        self.sessions: Dict[str, Any] = {}
        
    async def get_user_session(self, request: web.Request) -> Optional[Dict[str, Any]]:
        session_id = request.cookies.get("orbit_session")
        if not session_id:
            auth_header = request.headers.get("Authorization", "")
            if auth_header.startswith("Bearer "):
                session_id = auth_header[7:].strip()
                
        if not session_id:
            return None

        if session_id in self.sessions:
            return self.sessions[session_id]

        try:
            from Components.Database.mongodb import get_db
            db = get_db()
            sess = db["WebSessions"].find_one({"_id": session_id})
            if sess and "user" in sess:
                u = sess["user"]
                sess_data = {
                    "id": str(u.get("id")),
                    "username": u.get("username", "User"),
                    "global_name": u.get("global_name") or u.get("username"),
                    "avatar": u.get("avatar"),
                    "access_token": sess.get("access_token")
                }
                self.sessions[session_id] = sess_data
                return sess_data
        except Exception:
            pass

        return None

    async def handle_spa(self, request: web.Request):
        import os
        path = request.match_info.get("tail", "").lstrip("/")
        
        if path.startswith("api/") or path.startswith("auth/"):
            return web.Response(text="Not Found", status=404)
            
        static_dir = os.path.join("Website", "static")
        file_path = os.path.join(static_dir, path)
        if path and os.path.exists(file_path) and os.path.isfile(file_path):
            if path == "index.html":
                pass
            else:
                return web.FileResponse(file_path)
            
        index_path = os.path.join(static_dir, "index.html")
        if os.path.exists(index_path):
            with open(index_path, "r", encoding="utf-8") as f:
                html = f.read()
            base_url = os.environ.get("BASE_URL", "")
            if base_url:
                html = html.replace("%VITE_BASE_URL%", base_url)
            return web.Response(text=html, content_type="text/html")
            
        return web.Response(text="Orbit Static Files Not Found in Website/static", status=404)

    async def _check_guild_access(self, request: web.Request, guild_id: int):
        user = await self.get_user_session(request)
        if not user:
            return None, None
            
        bot_guild = self.bot.get_guild(guild_id)
        if not bot_guild:
            return None, None
            
        member = bot_guild.get_member(int(user["id"]))
        if not member:
            try:
                member = await bot_guild.fetch_member(int(user["id"]))
            except Exception:
                pass
                
        if not member:
            return None, None
            
        perms = member.guild_permissions
        is_admin = perms.administrator or perms.manage_guild
        
        if not is_admin:
            from Components.Systems.WebDashboard._storage import load_settings_config
            settings_cfg = load_settings_config(guild_id)
            manager_roles = [str(r) for r in settings_cfg.get("manager_roles", [])]
            manager_users = [str(u) for u in settings_cfg.get("manager_users", [])]
            for item in settings_cfg.get("dashboard_access", []):
                if isinstance(item, dict):
                    if item.get("type") == "role" and item.get("id"):
                        manager_roles.append(str(item.get("id")))
                    elif item.get("type") == "user" and item.get("id"):
                        manager_users.append(str(item.get("id")))
            if str(user["id"]) in manager_users or any(str(r.id) in manager_roles for r in member.roles):
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


def setup_web_app(bot) -> web.Application:
    dashboard = WebDashboard(bot)
    app = web.Application(client_max_size=10 * 1024 * 1024)  
    
    app.router.add_get("/auth/login", dashboard.handle_login)
    app.router.add_get("/auth/callback", dashboard.handle_callback)
    app.router.add_get("/auth/logout", dashboard.handle_logout)
    app.router.add_post("/api/auth/session", dashboard.api_create_session)
    
    app.router.add_get("/api/captcha/{token}", dashboard.handle_api_captcha)
    app.router.add_post("/api/verify/{token}", dashboard.handle_api_verify)
    
    app.router.add_get("/api/user", dashboard.api_user)
    app.router.add_get("/api/user/{id}", dashboard.api_resolve_user)
    app.router.add_get("/api/notifications", dashboard.api_notifications)
    app.router.add_get("/api/public_leaderboard/{id}", dashboard.api_public_leaderboard)
    app.router.add_get("/api/stats", dashboard.api_stats)
    app.router.add_get("/api/uptime", dashboard.api_uptime)
    app.router.add_get("/api/guilds", dashboard.api_guilds)
    app.router.add_get("/api/config/{id}", dashboard.api_get_config)
    app.router.add_get("/api/guild_stats/{id}", dashboard.api_guild_stats)
    app.router.add_get("/api/guild_stats_live/{id}", dashboard.api_guild_stats_live)
    app.router.add_get("/api/guild_analytics/{id}", dashboard.api_guild_analytics)
    app.router.add_get("/api/botprofile/{id}", dashboard.api_get_botprofile)
    app.router.add_post("/api/botprofile/{id}", dashboard.api_post_botprofile)
    app.router.add_get("/api/mod_activity/{id}", dashboard.api_mod_activity)
    app.router.add_get("/api/warns/{id}/{user_id}", dashboard.api_get_user_warns)
    app.router.add_post("/api/config/{id}", dashboard.api_post_config)
    app.router.add_post("/api/action/{id}/setup_serverstats", dashboard.api_action_setup_serverstats)
    app.router.add_post("/api/action/{id}/send_verify_panel", dashboard.api_action_send_verify)
    app.router.add_post("/api/action/{id}/send_ticket_panel", dashboard.api_action_send_ticket)
    app.router.add_post("/api/action/{id}/send_embed", dashboard.api_action_send_embed)
    app.router.add_post("/api/action/send_custom_embed/{id}", dashboard.api_action_send_custom_embed)
    app.router.add_post("/api/action/{id}/send_honeypot", dashboard.api_action_send_honeypot)
    app.router.add_get("/api/action/saved_embeds/{id}", dashboard.api_action_get_saved_embeds)
    app.router.add_post("/api/action/saved_embeds/{id}", dashboard.api_action_save_embed)
    app.router.add_delete("/api/action/saved_embeds/{id}/{embed_id}", dashboard.api_action_delete_saved_embed)
    app.router.add_get("/api/messages/{id}", dashboard.api_get_messages)
    app.router.add_post("/api/messages/{id}", dashboard.api_save_message)
    app.router.add_delete("/api/messages/{id}/{msg_id}", dashboard.api_delete_message)
    app.router.add_post("/api/server/{id}/test-levelup", dashboard.api_action_test_levelup)
    app.router.add_post("/api/server/{id}/test-dm", dashboard.api_action_test_dm)
    app.router.add_post("/api/server/{id}/test-welcome", dashboard.api_action_test_welcome)
    app.router.add_post("/api/upload/image", dashboard.api_upload_image)
    app.router.add_get("/api/reactionroles/{id}", dashboard.api_get_reactionroles)
    app.router.add_post("/api/reactionroles/{id}", dashboard.api_save_reactionrole)
    app.router.add_delete("/api/reactionroles/{id}/{msg_id}", dashboard.api_delete_reactionrole)
    app.router.add_post("/api/action/{id}/send_reactionrole", dashboard.api_action_send_reactionrole)
    app.router.add_get("/api/appeal_info/{custom_url}", dashboard.api_appeal_info)
    app.router.add_post("/api/submit_appeal/{custom_url}", dashboard.api_submit_appeal)
    
    app.router.add_get("/api/server/{id}/appeals", dashboard.api_get_recent_appeals)
    app.router.add_post("/api/server/{id}/appeals/resolve", dashboard.api_resolve_appeal)
    app.router.add_get("/api/channels/{id}", dashboard.api_channels)
    app.router.add_get("/api/roles/{id}", dashboard.api_roles)

    app.router.add_get("/{tail:.*}", dashboard.handle_spa)

    return app

