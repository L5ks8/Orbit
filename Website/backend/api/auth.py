import os
import secrets
import json
import asyncio
from aiohttp import web
import aiohttp
import discord
from typing import Dict, Any

class AuthMixin:
    def get_redirect_uri(self, request: web.Request) -> str:
        scheme = request.headers.get("X-Forwarded-Proto", "http")
        return f"{scheme}://{request.host}/auth/callback"

    async def handle_login(self, request: web.Request):
        if not self.client_id:
            return web.Response(text="OAuth2 is not configured. Missing DISCORD_CLIENT_ID.", status=500)
            
        import urllib.parse
        next_url = request.query.get("next", "/")
        popup = request.query.get("popup", "")
        # Encode popup flag into state so it survives the OAuth redirect
        state_val = next_url
        if popup == "1":
            state_val = next_url + ("&" if "?" in next_url else "?") + "popup=1"
        state = urllib.parse.quote(state_val)
            
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
        self.sessions[session_id] = {
            "id": user_info["id"],
            "username": user_info["username"],
            "avatar": user_info.get("avatar"),
            "access_token": access_token
        }
        
        # Record Login History
        try:
            import sys
            import os
            import time
            sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
            from Components.Database.mongodb import get_db
            db = get_db()
            ip = request.headers.get("X-Forwarded-For", request.remote)
            if ip and "," in ip:
                ip = ip.split(",")[0].strip()
            user_agent = request.headers.get("User-Agent", "Unknown")
            login_entry = {
                "timestamp": int(time.time()),
                "ip": ip,
                "user_agent": user_agent
            }
            db["Users"].update_one(
                {"_id": str(user_info["id"])},
                {"$push": {"login_history": {"$each": [login_entry], "$slice": -10}}},
                upsert=True
            )
        except Exception as e:
            print(f"Failed to save login history: {e}")
        
        # Check if this was a popup login
        is_popup = "popup=1" in state or "&popup=1" in next_url
        if is_popup:
            # Clean popup param from next_url
            next_url = next_url.replace("&popup=1", "").replace("?popup=1", "").replace("popup=1", "")
            if not next_url or next_url == "?":
                next_url = "/"
            # Return HTML that shows authenticating -> success -> closes
            html = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Login - Orbit</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #0a0a0a;
    color: #fff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }
  .card {
    background: #171717;
    border: 1px solid #262626;
    border-radius: 20px;
    padding: 48px 40px;
    text-align: center;
    max-width: 340px;
    width: 90%;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  }
  .icon-wrap {
    width: 72px; height: 72px;
    border-radius: 50%;
    background: #262626;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
    position: relative;
  }
  .spinner {
    width: 40px; height: 40px;
    border: 3px solid #404040;
    border-top-color: #a3a3a3;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .checkmark {
    display: none;
    width: 40px; height: 40px;
  }
  .checkmark svg {
    width: 40px; height: 40px;
    animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  @keyframes popIn {
    0% { transform: scale(0); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
  h2 { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
  p { font-size: 14px; color: #737373; line-height: 1.5; }
  .success .icon-wrap { background: rgba(34, 197, 94, 0.12); }
  .success .spinner { display: none; }
  .success .checkmark { display: block; }
  .success h2 { color: #22c55e; }
</style>
</head>
<body>
<div class="card" id="card">
  <div class="icon-wrap">
    <div class="spinner"></div>
    <div class="checkmark">
      <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>
  </div>
  <h2 id="title">Authenticating...</h2>
  <p id="desc">Please wait while we complete your login.</p>
</div>
<script>
  setTimeout(function() {
    document.getElementById('card').classList.add('success');
    document.getElementById('title').textContent = 'Login successful!';
    document.getElementById('desc').textContent = 'You can now close this window.';
    setTimeout(function() { window.close(); }, 1500);
  }, 800);
</script>
</body>
</html>"""
            response = web.Response(text=html, content_type="text/html")
            response.set_cookie("orbit_session", session_id, max_age=86400 * 7, httponly=True)
            return response
        
        response = web.HTTPFound(next_url)
        response.set_cookie("orbit_session", session_id, max_age=86400 * 7, httponly=True)
        return response

    async def handle_logout(self, request: web.Request):
        session_id = request.cookies.get("orbit_session")
        if session_id in self.sessions:
            del self.sessions[session_id]
        response = web.HTTPFound("/")
        response.del_cookie("orbit_session")
        return response

    async def api_user(self, request: web.Request):
        session = await self.get_user_session(request)
        if not session:
            return web.json_response({"error": "Not authenticated"}, status=401)
            
        try:
            from Components.Database.mongodb import get_db
            db = get_db()
            user_doc = db["Users"].find_one({"_id": str(session["id"])})
            if user_doc and "login_history" in user_doc:
                session["login_history"] = user_doc["login_history"]
        except Exception as e:
            session["login_history"] = []
            
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