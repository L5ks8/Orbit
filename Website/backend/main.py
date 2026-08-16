

SESSIONS: Dict[str, Any] = {}

from Website.backend.api.auth import AuthMixin
from Website.backend.api.config import ConfigMixin
from Website.backend.api.guilds import GuildsMixin
from Website.backend.api.actions import ActionsMixin

class WebDashboard(AuthMixin, ConfigMixin, GuildsMixin, ActionsMixin):
    def __init__(self, bot: discord.ext.commands.Bot):
        self.bot = bot
        self.client_id = os.environ.get("DISCORD_CLIENT_ID", "")
        self.client_secret = os.environ.get("DISCORD_CLIENT_SECRET", "")
        
    async def get_user_session(self, request: web.Request) -> Dict[str, Any]:
        session_id = request.cookies.get("orbit_session")
        if not session_id or session_id not in SESSIONS:
            return None
        return SESSIONS[session_id]

    async def handle_spa(self, request: web.Request):
        import os
        path = request.match_info.get("tail", "").lstrip("/")
        
        # Prevent intercepting API routes (though aiohttp routes them first anyway)
        if path.startswith("api/") or path.startswith("auth/"):
            return web.Response(text="Not Found", status=404)
            
        dist_dir = os.path.join("Website", "frontend", "dist")
        file_path = os.path.join(dist_dir, path)
        
        # Check if the requested file exists
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
