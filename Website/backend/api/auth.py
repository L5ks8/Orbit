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
        next_url = request.query.get("next", "/dashboard")
        if not next_url or next_url == "/":
            next_url = "/dashboard"
        popup = request.query.get("popup", "")
        state_val = next_url
        if popup == "1":
            state_val = next_url + ("&" if "?" in next_url else "?") + "popup=1"
        state = urllib.parse.quote(state_val)
            
        redirect_uri = self.get_redirect_uri(request)
        # Using response_type=token (Implicit Grant) completely prevents Discord/Cloudflare Error 1015 on token exchange
        discord_login_url = (
            f"https://discord.com/oauth2/authorize?client_id={self.client_id}"
            f"&redirect_uri={redirect_uri}&response_type=token&scope=identify%20guilds"
            f"&state={state}"
        )
        raise web.HTTPFound(discord_login_url)

    async def handle_callback(self, request: web.Request):
        # Serves the exact confirmation screen matching PeakBot design (Screenshots 2 & 3).
        # Handles both implicit grant (#access_token=...) and code grant (?code=...) client-side.
        confirmation_html = """<!DOCTYPE html>
<html lang="de" class="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Authentifizierung - Orbit</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #0a0a0a;
    color: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 16px;
    -webkit-font-smoothing: antialiased;
  }
  .card {
    background: #121212;
    border: 1px solid #262626;
    border-radius: 24px;
    padding: 44px 32px 36px;
    text-align: center;
    max-width: 400px;
    width: 100%;
    box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7);
    transition: all 0.3s ease;
  }
  .icon-wrap {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #1f1f1f;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 22px;
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .spinner {
    width: 28px;
    height: 28px;
    border: 3px solid rgba(255, 255, 255, 0.15);
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .checkmark {
    display: none;
    width: 28px;
    height: 28px;
  }
  .checkmark svg {
    width: 28px;
    height: 28px;
    animation: popIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  @keyframes popIn {
    0% { transform: scale(0.3); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
  h2 {
    font-size: 20px;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 8px;
    letter-spacing: -0.01em;
  }
  p {
    font-size: 14px;
    color: #8e8e93;
    line-height: 1.5;
    max-width: 290px;
    margin: 0 auto;
  }
  .redirect-link {
    display: none;
    margin-top: 22px;
    font-size: 13px;
    color: #636366;
    text-decoration: none;
    cursor: pointer;
    transition: color 0.15s ease;
  }
  .redirect-link:hover {
    color: #ffffff;
    text-decoration: underline;
  }
  .error-btn {
    display: none;
    margin-top: 22px;
    padding: 12px 24px;
    border-radius: 12px;
    background: #5865F2;
    color: #ffffff;
    font-weight: 600;
    font-size: 14px;
    text-decoration: none;
  }

  /* Success State matching PeakBot */
  .success .icon-wrap {
    background: rgba(34, 197, 94, 0.15);
  }
  .success .spinner {
    display: none;
  }
  .success .checkmark {
    display: block;
  }
  .success .redirect-link {
    display: inline-block;
  }

  /* Error State */
  .is-error .icon-wrap {
    background: rgba(239, 68, 68, 0.15);
  }
  .is-error .spinner {
    display: none;
  }
  .is-error .error-btn {
    display: inline-block;
  }
</style>
</head>
<body>
<div class="card" id="card">
  <div class="icon-wrap" id="icon-wrap">
    <div class="spinner"></div>
    <div class="checkmark">
      <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>
  </div>
  <h2 id="title">Authentifizierung...</h2>
  <p id="desc">Bitte warten Sie, während wir Ihre Anmeldung abschließen.</p>
  <div>
    <a href="/dashboard" id="redirect-link" class="redirect-link" onclick="handleRedirect(event)">Not redirecting? Click here</a>
    <a href="/auth/login?popup=1" id="retry-btn" class="error-btn">Erneut versuchen</a>
  </div>
</div>
<script>
  function completeAuthAndRedirect() {
    try {
      if (window.opener && !window.opener.closed) {
        if (window.opener.Router && typeof window.opener.Router.navigate === 'function') {
          window.opener.Router.checkAuth().then(function() {
            window.opener.Router.navigate('/dashboard');
          }).catch(function() {
            window.opener.location.href = '/dashboard';
          });
        } else {
          window.opener.location.href = '/dashboard';
        }
      }
    } catch (e) {
      try { window.opener.location.href = '/dashboard'; } catch (_) {}
    }
  }

  function handleRedirect(e) {
    if (e) e.preventDefault();
    completeAuthAndRedirect();
    if (!window.opener || window.opener.closed) {
      window.location.href = '/dashboard';
    } else {
      setTimeout(function() {
        try { window.close(); } catch(_) { window.location.href = '/dashboard'; }
      }, 200);
    }
  }

  function showSuccess() {
    var card = document.getElementById('card');
    if (card) card.classList.add('success');
    var title = document.getElementById('title');
    if (title) title.textContent = 'Success!';
    var desc = document.getElementById('desc');
    if (desc) desc.textContent = 'You can close this window.';
    
    // Notify opener window immediately
    completeAuthAndRedirect();

    // Auto-close popup after showing success
    setTimeout(function() {
      try {
        if (window.opener && !window.opener.closed) {
          window.close();
        } else {
          window.location.href = '/dashboard';
        }
      } catch (e) {
        window.location.href = '/dashboard';
      }
    }, 1300);
  }

  function showError(msg) {
    var card = document.getElementById('card');
    if (card) {
      card.classList.remove('success');
      card.classList.add('is-error');
    }
    var title = document.getElementById('title');
    if (title) title.textContent = 'Authentifizierung fehlgeschlagen';
    var desc = document.getElementById('desc');
    if (desc) desc.textContent = msg || 'Die Discord-Anmeldung ist abgelaufen oder wurde abgebrochen. Bitte versuchen Sie es erneut.';
  }

  async function processAuth() {
    try {
      var hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      var queryParams = new URLSearchParams(window.location.search);
      
      var accessToken = hashParams.get('access_token');
      var code = queryParams.get('code');
      var error = hashParams.get('error') || queryParams.get('error');

      if (error) {
        showError('Die Anmeldung wurde in Discord abgebrochen.');
        return;
      }

      if (accessToken) {
        // Fetch user from Discord directly via client home IP to bypass any server Cloudflare blocks
        var userInfo = null;
        try {
          var userRes = await fetch('https://discord.com/api/users/@me', {
            headers: { 'Authorization': 'Bearer ' + accessToken }
          });
          if (userRes.ok) {
            userInfo = await userRes.json();
          }
        } catch (_) {}

        // Send to backend session endpoint
        var sessionRes = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: accessToken, user_info: userInfo })
        });

        if (!sessionRes.ok) {
          throw new Error('Session creation failed');
        }

        setTimeout(showSuccess, 400);
        return;
      }

      if (code) {
        // Legacy code exchange fallback
        var sessionRes = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: code })
        });

        if (sessionRes.ok) {
          setTimeout(showSuccess, 400);
        } else {
          // If code grant fails due to Cloudflare 1015 on server, automatically upgrade to token flow
          window.location.href = '/auth/login?popup=1';
        }
        return;
      }

      // No token or code, redirect to login
      window.location.href = '/auth/login?popup=1';
    } catch (err) {
      showError('Die Anmeldung konnte nicht abgeschlossen werden. Bitte versuchen Sie es erneut.');
    }
  }

  processAuth();
</script>
</body>
</html>"""
        return web.Response(text=confirmation_html, content_type="text/html")

    async def api_create_session(self, request: web.Request):
        try:
            body = await request.json()
        except Exception:
            return web.json_response({"error": "Invalid JSON"}, status=400)

        access_token = body.get("access_token")
        user_info = body.get("user_info")
        code = body.get("code")

        # Code grant exchange fallback if code was supplied
        if code and not access_token:
            redirect_uri = self.get_redirect_uri(request)
            data = {
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": redirect_uri
            }
            discord_headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (compatible; OrbitBot/2.0)",
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded"
            }
            try:
                async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=10)) as session:
                    async with session.post("https://discord.com/api/oauth2/token", data=data, headers=discord_headers) as resp:
                        if resp.status == 200:
                            tok = await resp.json()
                            access_token = tok.get("access_token")
            except Exception:
                pass

        if not access_token:
            return web.json_response({"error": "Missing access_token"}, status=400)

        # If user_info was not provided by the client, fetch it
        if not user_info or "id" not in user_info:
            user_headers = {
                "Authorization": f"Bearer {access_token}",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (compatible; OrbitBot/2.0)",
                "Accept": "application/json"
            }
            try:
                async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=10)) as session:
                    async with session.get("https://discord.com/api/users/@me", headers=user_headers) as resp:
                        if resp.status == 200:
                            user_info = await resp.json()
            except Exception:
                pass

        if not user_info or "id" not in user_info:
            return web.json_response({"error": "Failed to verify user info"}, status=400)

        session_id = secrets.token_urlsafe(32)
        self.sessions[session_id] = {
            "id": user_info["id"],
            "username": user_info.get("username", "User"),
            "avatar": user_info.get("avatar"),
            "access_token": access_token
        }

        # Save login history
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

        response = web.json_response({"ok": True, "user": user_info})
        response.set_cookie("orbit_session", session_id, max_age=86400 * 7, httponly=True, path="/")
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

    async def api_notifications(self, request: web.Request):
        session = await self.get_user_session(request)
        if not session:
            return web.json_response({"error": "Not authenticated"}, status=401)
            
        try:
            from Components.Database.mongodb import get_db
            db = get_db()
            user_id = str(session["id"])
            
            notifications = list(db["Notifications"].find(
                {"target": {"$in": ["all", user_id]}}
            ).sort("timestamp", -1).limit(20))
            
            for notif in notifications:
                notif["_id"] = str(notif["_id"])
                
            return web.json_response(notifications)
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

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
