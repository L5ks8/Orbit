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
from Commands.Verify._storage import load_verify_config, save_verify_config, WEB_VERIFY_SESSIONS, remove_pending_kick
from Commands.AutoResponder._storage import load_responses, save_responses
from Commands.JoinRole._storage import load_join_roles, save_join_roles
from Commands.Log._storage import load_log_config, save_log_config
from Commands.ChannelAutomation._storage import load_automation_config, save_automation_config
from Commands.Boost._storage import load_boost_config, save_boost_config
from Commands.Level._storage import load_level_config, save_level_config
from Commands.ServerStats._storage import load_serverstats_config, save_serverstats_config
from aiohttp import web
import discord
import os
import secrets
import aiohttp

class AuthMixin:
    def get_redirect_uri(self, request: web.Request) -> str:
        scheme = request.headers.get("X-Forwarded-Proto", "http")
        return f"{scheme}://{request.host}/auth/callback"

    async def handle_login(self, request: web.Request):
        if not self.client_id:
            return web.Response(text="OAuth2 is not configured. Missing DISCORD_CLIENT_ID.", status=500)
            
        import urllib.parse
        next_url = request.query.get("next", "/")
        state = urllib.parse.quote(next_url)
            
        redirect_uri = self.get_redirect_uri(request)
        discord_login_url = (
            f"https://discord.com/api/oauth2/authorize?client_id={self.client_id}"
            f"&redirect_uri={redirect_uri}&response_type=code&scope=identify%20guilds"
            f"&state={state}"
        )
        raise web.HTTPFound(discord_login_url)

    async def handle_callback(self, request: web.Request):
        code = request.query.get("code")
        state = request.query.get("state", "/")
        import urllib.parse
        try:
            next_url = urllib.parse.unquote(state)
            if not next_url.startswith("/"):
                next_url = "/"
        except:
            next_url = "/"
            
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
        
        response = web.HTTPFound(next_url)
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
        session = await self.get_user_session(request)
        if not session:
            return web.json_response({"error": "Not authenticated"}, status=401)
        return web.json_response(session)

    async def api_resolve_user(self, request: web.Request):
        user_id_str = request.match_info.get("id", "")
        if not user_id_str.isdigit():
            return web.json_response({"error": "Invalid User ID"}, status=400)
        
        user_id = int(user_id_str)
        try:
            user = self.bot.get_user(user_id)
            if not user:
                user = await self.bot.fetch_user(user_id)
            
            return web.json_response({
                "id": str(user.id),
                "name": user.name,
                "global_name": user.global_name or user.name,
                "avatar": user.avatar.url if user.avatar else user.default_avatar.url
            })
        except discord.NotFound:
            return web.json_response({"error": "User not found"}, status=404)
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)
