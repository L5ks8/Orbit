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

class GuildsMixin:
    async def api_public_leaderboard(self, request: web.Request):
        guild_id = request.match_info.get("id")
        if not guild_id:
            return web.json_response({"error": "Missing guild ID"}, status=400)
            
        try:
            guild_id = int(guild_id)
        except ValueError:
            return web.json_response({"error": "Invalid guild ID"}, status=400)
            
        sort_key = request.query.get("sort", "total_xp")
        
        guild = self.bot.get_guild(guild_id)
        if not guild:
            return web.json_response({"error": "Bot not in this server"}, status=404)
            
        from Commands.Level._storage import get_leaderboard_by, level_from_xp
        from Commands.Level.level import LB_CATEGORIES
        
        if sort_key == "invites":
            from Commands.Invite._storage import get_leaderboard
            top = get_leaderboard(guild_id, limit=100)
        elif sort_key == "balance":
            from Commands.Economy._storage import get_economy_leaderboard
            top = get_economy_leaderboard(guild_id, limit=100)
        else:
            top = get_leaderboard_by(guild_id, sort_key, 100)
        
        results = []
        for i, entry in enumerate(top, 1):
            try:
                uid = int(entry.get("user_id"))
            except (ValueError, TypeError):
                uid = 0
                
            member = guild.get_member(uid) or self.bot.get_user(uid)
            if not member and uid != 0:
                try:
                    member = await self.bot.fetch_user(uid)
                except Exception:
                    pass
            
            name = member.display_name if hasattr(member, 'display_name') else (member.name if member else f"User#{uid}")
            
            avatar_url = ""
            if member and member.display_avatar:
                avatar_url = str(member.display_avatar.url)
                
            if sort_key == "invites":
                val = entry.get("total", 0)
            elif sort_key == "balance":
                val = entry.get("balance", 0)
            else:
                val = entry.get(sort_key, 0)
                
            if sort_key == "voice_minutes":
                val = val / 60.0
                
            results.append({
                "rank": i,
                "name": name,
                "avatar": avatar_url,
                "level": level_from_xp(entry.get("total_xp", 0)) if sort_key != "invites" else 0,
                "value": val,
                "total_xp": entry.get("total_xp", 0)
            })
            
        return web.json_response({
            "guild_name": guild.name,
            "guild_icon": str(guild.icon.url) if guild.icon else "",
            "category": sort_key,
            "entries": results
        })

    async def api_stats(self, request: web.Request):
        history = getattr(self.bot, "stats_history", [])
        try:
            from Commands.OwnerOnly._storage import is_devmode_enabled
            devmode, reason = is_devmode_enabled()
        except Exception:
            devmode, reason = False, ""
            
        servers = len(self.bot.guilds)
        users = sum(g.member_count for g in self.bot.guilds if hasattr(g, "member_count") and g.member_count)
        ping = round(self.bot.latency * 1000)

        return web.json_response({
            "history": list(history),
            "devmode": devmode,
            "devmode_reason": reason,
            "servers": servers,
            "users": users,
            "ping": ping
        })

    async def api_uptime(self, request: web.Request):
        from Database.mongodb import get_db
        import datetime
        db = get_db()
        if db is None:
            return web.json_response([])
            
        today = datetime.datetime.now(datetime.timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        past_45_days = today - datetime.timedelta(days=45)
        
        docs = list(db["UptimeStats"].find({"date": {"$gte": past_45_days}}).sort("date", 1))
        uptime_map = {doc["_id"]: doc for doc in docs}
        
        result = []
        for i in range(44, -1, -1):
            date_str = (today - datetime.timedelta(days=i)).strftime("%Y-%m-%d")
            doc = uptime_map.get(date_str, {})
            result.append({
                "date": date_str,
                "bot_pings": doc.get("bot_pings", 0),
                "db_pings": doc.get("db_pings", 0),
                "api_pings": doc.get("api_pings", 0)
            })
            
        return web.json_response(result)

    async def api_guilds(self, request: web.Request):
        user = await self.get_user_session(request)
        if not user:
            return web.json_response({"error": "Unauthorized"}, status=401)
            
        headers = {"Authorization": f"Bearer {user['access_token']}"}
        async with aiohttp.ClientSession() as session:
            async with session.get("https://discord.com/api/users/@me/guilds", headers=headers) as resp:
                if resp.status != 200:
                    err_text = await resp.text()
                    print(f"[api_guilds] Discord API error {resp.status}: {err_text}")
                    return web.json_response({"error": "Failed to fetch guilds"}, status=400)
                user_guilds = await resp.json()
        
        print(f"[api_guilds] User {user.get('username')} has {len(user_guilds)} total guilds, bot is in {len(self.bot.guilds)} guilds")
                
        from Commands.WebDashboard._storage import load_settings_config
        manageable_guilds = []
        for g in user_guilds:
            perms = int(g["permissions"])
            is_owner = g.get("owner", False)
            is_admin = is_owner or (perms & 0x8) == 0x8
            manage_guild = (perms & 0x20) == 0x20
            manage_roles = (perms & 0x10000000) == 0x10000000
            manage_channels = (perms & 0x10) == 0x10
            manage_messages = (perms & 0x2000) == 0x2000
            
            has_perms = is_admin or manage_guild or manage_roles or manage_channels or manage_messages
            
            if not has_perms:
                continue
                
            bot_guild = self.bot.get_guild(int(g["id"]))
            if not bot_guild:
                continue
                
            # Additional manager role check for users without direct perms
            if not (is_admin or manage_guild):
                settings_cfg = load_settings_config(int(g["id"]))
                manager_roles = settings_cfg.get("manager_roles", [])
                if manager_roles:
                    member = bot_guild.get_member(int(user["id"]))
                    if not (member and any(str(r.id) in manager_roles for r in member.roles)):
                        continue

            manageable_guilds.append({
                "id": g["id"],
                "name": g["name"],
                "icon": g.get("icon"),
                "owner": is_owner
            })
        
        print(f"[api_guilds] Returning {len(manageable_guilds)} manageable guilds")
        return web.json_response(manageable_guilds)

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
        today_doc = None
        if db is not None:
            doc_ids = []
            for i in range(days - 1, -1, -1):
                d = today - timedelta(days=i)
                date_str = d.strftime("%Y-%m-%d")
                doc_ids.append(f"{guild_id}_{date_str}")
                
            docs = list(db["GuildStats"].find({"_id": {"$in": doc_ids}}))
            doc_map = {doc["_id"]: doc for doc in docs}
            
            for doc_id in doc_ids:
                doc = doc_map.get(doc_id)
                date_str = doc_id.split("_")[1]
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
            today_doc = doc_map.get(f"{guild_id}_{today_str}")
        
        from Commands.Ticket._storage import load_ticket_config
        ticket_cfg = load_ticket_config(guild_id)
        open_tickets = len(ticket_cfg.get("active_tickets", {}))
        
        return web.json_response({
            "total_members": guild.member_count,
            "today_joins": today_doc.get("joins", 0) if today_doc else 0,
            "today_leaves": today_doc.get("leaves", 0) if today_doc else 0,
            "today_messages": today_doc.get("messages", 0) if today_doc else 0,
            "today_active_users": len(today_doc.get("active_users", [])) if today_doc and "active_users" in today_doc else 0,
            "today_voice_minutes": today_doc.get("voice_minutes", 0) if today_doc else 0,
            "open_tickets": open_tickets,
            "history": stats
        })