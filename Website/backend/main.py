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
        if not session_id or session_id not in self.sessions:
            return None
        return self.sessions[session_id]

    async def handle_spa(self, request: web.Request):
        import os
        path = request.match_info.get("tail", "").lstrip("/")
        
        # Prevent intercepting API routes (though aiohttp routes them first anyway)
        if path.startswith("api/") or path.startswith("auth/"):
            return web.Response(text="Not Found", status=404)
            
        dist_dir = os.path.join("Website", "frontend", "dist")
        file_path = os.path.join(dist_dir, path)
        if path and os.path.exists(file_path) and os.path.isfile(file_path):
            return web.FileResponse(file_path)
            
        # Fallback to index.html for SPA
        index_path = os.path.join(dist_dir, "index.html")
        if os.path.exists(index_path):
            return web.FileResponse(index_path)
            
        return web.Response(text="React Build Not Found. Run npm run build in Website/frontend", status=404)

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


def setup_web_app(bot) -> web.Application:
    dashboard = WebDashboard(bot)
    app = web.Application(client_max_size=10 * 1024 * 1024)  
    
    app.router.add_get("/auth/login", dashboard.handle_login)
    app.router.add_get("/auth/callback", dashboard.handle_callback)
    app.router.add_get("/auth/logout", dashboard.handle_logout)
    
    app.router.add_get("/api/captcha/{token}", dashboard.handle_api_captcha)
    app.router.add_post("/api/verify/{token}", dashboard.handle_api_verify)
    
    app.router.add_get("/api/user", dashboard.api_user)
    app.router.add_get("/api/user/{id}", dashboard.api_resolve_user)
    app.router.add_get("/api/public_leaderboard/{id}", dashboard.api_public_leaderboard)
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
    app.router.add_get("/api/reactionroles/{id}", dashboard.api_get_reactionroles)
    app.router.add_post("/api/reactionroles/{id}", dashboard.api_save_reactionrole)
    app.router.add_delete("/api/reactionroles/{id}/{msg_id}", dashboard.api_delete_reactionrole)
    app.router.add_post("/api/action/{id}/send_reactionrole", dashboard.api_action_send_reactionrole)
    app.router.add_get("/api/appeal_info/{custom_url}", dashboard.api_appeal_info)
    app.router.add_post("/api/submit_appeal/{custom_url}", dashboard.api_submit_appeal)

    # SPA Catch-all Route must be added LAST
    app.router.add_get("/{tail:.*}", dashboard.handle_spa)

    return app

