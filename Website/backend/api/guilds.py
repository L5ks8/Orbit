import os
import secrets
import json
import asyncio
from aiohttp import web
import aiohttp
import discord
from typing import Dict, Any
from Components.Systems.WelcomeGoodbye._storage import load_welcome_config, save_welcome_config
from Components.Systems.WelcomeGoodbye._storage import load_goodbye_config, save_goodbye_config
from Components.Systems.Automoderation._storage import load_automod_config, save_automod_config
from Components.Systems.Verify._storage import load_verify_config, save_verify_config, WEB_VERIFY_SESSIONS, remove_pending_kick
from Components.Commands.AutoResponder._storage import load_responses, save_responses
from Components.Systems.Roles._storage import load_join_roles, save_join_roles
from Components.Systems.Automoderation.log_storage import load_log_config, save_log_config
from Components.Commands.ChannelAutomation._storage import load_automation_config, save_automation_config
from Components.Commands.Boost._storage import load_boost_config, save_boost_config
from Components.Systems.Level._storage import load_level_config, save_level_config
from Components.Commands.ServerStats._storage import load_serverstats_config, save_serverstats_config

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
            
        from Components.Systems.Level._storage import get_leaderboard_by, level_from_xp
        from Components.Commands.Level.level import LB_CATEGORIES
        
        if sort_key == "invites":
            from Components.Commands.Invite._storage import get_leaderboard
            top = get_leaderboard(guild_id, limit=100)
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
            from Components.Commands.OwnerOnly._storage import is_devmode_enabled
            devmode, reason = is_devmode_enabled()
        except Exception:
            devmode, reason = False, ""
            
        servers = len(self.bot.guilds)
        users = sum(g.member_count for g in self.bot.guilds if hasattr(g, "member_count") and g.member_count)
        import math
        import random
        ping = round(self.bot.latency * 1000) if not math.isnan(self.bot.latency) else 0

        # Sample up to 3 random servers that have a custom (non-default) icon, preserving animated GIF if available
        guilds_with_icon = [g for g in self.bot.guilds if getattr(g, "icon", None) is not None]
        sample_count = min(3, len(guilds_with_icon))
        sampled = random.sample(guilds_with_icon, sample_count) if sample_count > 0 else []

        server_icons = []
        for g in sampled:
            try:
                if hasattr(g.icon, "is_animated") and g.icon.is_animated():
                    icon_url = str(g.icon.with_format("gif").with_size(64).url)
                else:
                    icon_url = str(g.icon.with_format("png").with_size(64).url)
            except Exception:
                icon_url = str(g.icon.url)
            server_icons.append({
                "name": g.name,
                "icon": icon_url
            })

        return web.json_response({
            "history": list(history),
            "devmode": devmode,
            "devmode_reason": reason,
            "servers": servers,
            "users": users,
            "ping": ping,
            "server_icons": server_icons
        })

    async def api_uptime(self, request: web.Request):
        from Components.Database.mongodb import get_db
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
        if not hasattr(self, "_manageable_guilds_cache"):
            self._manageable_guilds_cache = {}
            
        import time
        now = time.time()
        
        force_refresh = request.query.get("force") == "true"
        if force_refresh and user["id"] in self._manageable_guilds_cache:
            self._manageable_guilds_cache.pop(user["id"], None)
        
        cached = self._manageable_guilds_cache.get(user["id"])
        if cached and (now - cached['time'] < 60) and not force_refresh:
            cached_data = cached.get('data', [])
            has_any_bot = any(g.get("has_bot") for g in cached_data)
            # If bot was not ready when cache was stored (0 bot guilds), but is ready now with guilds, re-fetch!
            if has_any_bot or (not self.bot.is_ready()) or len(self.bot.guilds) == 0:
                return web.json_response(cached_data)

        # Ensure bot is ready before evaluating bot server presence
        if not self.bot.is_ready() or len(self.bot.guilds) == 0:
            try:
                await asyncio.wait_for(self.bot.wait_until_ready(), timeout=5.0)
            except Exception:
                pass

        headers = {"Authorization": f"Bearer {user['access_token']}"}
        user_guilds = None
        async with aiohttp.ClientSession() as session:
            for attempt in range(2):
                async with session.get("https://discord.com/api/users/@me/guilds", headers=headers) as resp:
                    if resp.status == 200:
                        user_guilds = await resp.json()
                        break
                    err_text = await resp.text()
                    print(f"[api_guilds] Discord API error {resp.status} (attempt {attempt + 1}): {err_text}", flush=True)
                    if resp.status == 429 and attempt == 0:
                        try:
                            err_data = json.loads(err_text)
                            retry_after = float(err_data.get("retry_after", 1.0))
                        except Exception:
                            retry_after = 1.0
                        if retry_after <= 3.0:
                            await asyncio.sleep(retry_after + 0.1)
                            continue
                    if cached:
                        return web.json_response(cached['data'])
                    status_code = resp.status if resp.status in (401, 429) else 400
                    return web.json_response({"error": "Failed to fetch guilds"}, status=status_code)

        if user_guilds is None:
            if cached:
                return web.json_response(cached['data'])
            return web.json_response({"error": "Failed to fetch guilds"}, status=400)

        
        print(f"[api_guilds] User {user.get('username')} has {len(user_guilds)} total guilds, bot is in {len(self.bot.guilds)} guilds", flush=True)
                
        from Components.Systems.WebDashboard._storage import load_settings_config
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
                
            bot_guild = None
            try:
                gid_int = int(g["id"])
                bot_guild = self.bot.get_guild(gid_int)
            except Exception:
                pass
            if not bot_guild:
                try:
                    bot_guild = discord.utils.find(lambda x: str(x.id) == str(g["id"]), self.bot.guilds)
                except Exception:
                    pass
            bot_in_server = bot_guild is not None
                
            if not (is_admin or manage_guild):
                if not bot_in_server:
                    continue
                settings_cfg = load_settings_config(int(g["id"]))
                manager_roles = [str(r) for r in settings_cfg.get("manager_roles", [])]
                manager_users = [str(u) for u in settings_cfg.get("manager_users", [])]
                for item in settings_cfg.get("dashboard_access", []):
                    if isinstance(item, dict):
                        if item.get("type") == "role" and item.get("id"):
                            manager_roles.append(str(item.get("id")))
                        elif item.get("type") == "user" and item.get("id"):
                            manager_users.append(str(item.get("id")))
                member = bot_guild.get_member(int(user["id"]))
                has_custom_access = (str(user["id"]) in manager_users) or (member and any(str(r.id) in manager_roles for r in member.roles))
                if not has_custom_access:
                    continue

            manageable_guilds.append({
                "id": g["id"],
                "name": g["name"],
                "icon": g.get("icon"),
                "owner": is_owner,
                "has_bot": bot_in_server,
                "bot_in_server": bot_in_server
            })
        
        print(f"[api_guilds] Returning {len(manageable_guilds)} manageable guilds", flush=True)
        if self.bot.is_ready() and len(self.bot.guilds) > 0:
            self._manageable_guilds_cache[user["id"]] = {'time': now, 'data': manageable_guilds}
        return web.json_response(manageable_guilds)

    def _build_48h_buckets(self, guild_id: int, doc_map: dict, now_dt):
        from datetime import timedelta
        import time

        hourly_buckets = []
        bucket_index_by_key = {}
        dates_in_48h = set()
        for i in range(47, -1, -1):
            d = now_dt - timedelta(hours=i)
            date_key = d.strftime("%Y-%m-%d")
            hour_key = d.strftime("%H")
            dates_in_48h.add(date_key)
            idx = len(hourly_buckets)
            bucket_index_by_key[(date_key, hour_key)] = idx
            hourly_buckets.append({
                "date": date_key,
                "hour": hour_key,
                "label": f"{d.month:02d}/{d.day:02d} {d.hour:02d}h",
                "short_label": f"{d.hour:02d}:00",
                "messages": 0
            })

        # 1. Populate from saved hourly buckets in GuildStats
        tracked_by_date = {dk: 0 for dk in dates_in_48h}
        for (date_key, hour_key), idx in bucket_index_by_key.items():
            doc = doc_map.get(date_key)
            if doc and isinstance(doc.get("hours"), dict):
                val = int(doc["hours"].get(hour_key, 0) or 0)
                hourly_buckets[idx]["messages"] += val
                tracked_by_date[date_key] = tracked_by_date.get(date_key, 0) + val

        # 2. Check in-memory recent_messages for the last ~65 minutes if any exceed persisted hourly count
        recent = []
        if hasattr(self.bot, "recent_messages"):
            recent = self.bot.recent_messages.get(guild_id, [])
        if recent:
            from datetime import datetime, timezone
            mem_hour_counts = {}
            for ts in recent:
                dt = datetime.fromtimestamp(ts, tz=timezone.utc)
                k = (dt.strftime("%Y-%m-%d"), dt.strftime("%H"))
                mem_hour_counts[k] = mem_hour_counts.get(k, 0) + 1
            for k, mem_cnt in mem_hour_counts.items():
                if k in bucket_index_by_key:
                    idx = bucket_index_by_key[k]
                    if mem_cnt > hourly_buckets[idx]["messages"]:
                        diff = mem_cnt - hourly_buckets[idx]["messages"]
                        hourly_buckets[idx]["messages"] = mem_cnt
                        tracked_by_date[k[0]] = tracked_by_date.get(k[0], 0) + diff

        # 3. For any date in the last 48h where doc["messages"] > sum(hours) (e.g. saved before hourly subdoc),
        # place the remaining untracked messages into the latest hour of that date in the 48h window.
        for date_key in sorted(dates_in_48h):
            doc = doc_map.get(date_key)
            if not doc:
                continue
            doc_msgs = int(doc.get("messages", 0) or 0)
            untracked = doc_msgs - tracked_by_date.get(date_key, 0)
            if untracked > 0:
                date_indices = [
                    idx for (dk, _), idx in bucket_index_by_key.items() if dk == date_key
                ]
                if date_indices:
                    target_idx = date_indices[-1]
                    hourly_buckets[target_idx]["messages"] += untracked

        return hourly_buckets

    async def api_guild_stats(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        if not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild ID"}, status=400)
        guild_id = int(guild_id_str)
        
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild:
            return web.json_response({"error": "Unauthorized or not found"}, status=403)
            
        raw_days = str(request.query.get("days", "7")).strip().lower()
        raw_channels_days = str(request.query.get("channels_days", raw_days)).strip().lower()
            
        from Components.Database.mongodb import get_db
        db = get_db()
        
        from datetime import datetime, timedelta, timezone
        import time
        today = datetime.now(timezone.utc)
        today_str = today.strftime("%Y-%m-%d")

        all_docs = []
        doc_map = {}
        if db is not None:
            try:
                all_docs = list(db["GuildStats"].find({
                    "$or": [
                        {"guild_id": guild_id},
                        {"guild_id": str(guild_id)},
                        {"_id": {"$regex": f"^{guild_id}_"}}
                    ]
                }))
                for doc in all_docs:
                    d_str = doc.get("date")
                    if not d_str and isinstance(doc.get("_id"), str) and "_" in doc["_id"]:
                        d_str = doc["_id"].split("_", 1)[1]
                    if d_str:
                        doc_map[d_str] = doc
            except Exception as e:
                print(f"[api_guild_stats] Error querying GuildStats for {guild_id}: {e}", flush=True)

        def _resolve_num_days(val_str: str) -> int:
            if val_str == "all":
                if doc_map:
                    earliest_str = min(doc_map.keys())
                    try:
                        earliest_dt = datetime.strptime(earliest_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
                        span = (today.replace(hour=0, minute=0, second=0, microsecond=0) - earliest_dt).days + 1
                        return max(7, min(span, 365))
                    except Exception:
                        return 30
                return 30
            try:
                return max(1, min(int(val_str), 365))
            except ValueError:
                return 7

        num_days = _resolve_num_days(raw_days)
        channels_num_days = _resolve_num_days(raw_channels_days)

        live_48h = self._build_48h_buckets(guild_id, doc_map, today)
        total_48h = sum(b["messages"] for b in live_48h)

        # Build Activity history for requested range
        stats = []
        prev_period_messages = 0
        if raw_days == "1":
            # For 1D (Last 24 hours), provide 24 hourly points so the Activity chart renders a full 24h curve
            last_24 = live_48h[-24:]
            prev_24 = live_48h[:24]
            prev_period_messages = sum(b["messages"] for b in prev_24)
            for b in last_24:
                stats.append({
                    "date": b["short_label"],
                    "full_date": b["label"],
                    "joins": 0,
                    "leaves": 0,
                    "messages": b["messages"]
                })
        else:
            for i in range(num_days - 1, -1, -1):
                d = today - timedelta(days=i)
                date_str = d.strftime("%Y-%m-%d")
                doc = doc_map.get(date_str)
                if doc:
                    stats.append({
                        "date": date_str,
                        "joins": int(doc.get("joins", 0) or 0),
                        "leaves": int(doc.get("leaves", 0) or 0),
                        "messages": int(doc.get("messages", 0) or 0)
                    })
                else:
                    stats.append({
                        "date": date_str,
                        "joins": 0,
                        "leaves": 0,
                        "messages": 0
                    })
            for i in range(num_days * 2 - 1, num_days - 1, -1):
                d = today - timedelta(days=i)
                date_str = d.strftime("%Y-%m-%d")
                doc = doc_map.get(date_str)
                if doc:
                    prev_period_messages += int(doc.get("messages", 0) or 0)

        period_messages = sum(item["messages"] for item in stats)

        # Build Top Message Channels for channels_days range
        channels_agg = {}
        if raw_channels_days == "all":
            target_docs = list(doc_map.values())
        else:
            target_docs = []
            for i in range(channels_num_days - 1, -1, -1):
                d = today - timedelta(days=i)
                doc = doc_map.get(d.strftime("%Y-%m-%d"))
                if doc:
                    target_docs.append(doc)

        for doc in target_docs:
            ch_map = doc.get("channels")
            if isinstance(ch_map, dict):
                for cid, count in ch_map.items():
                    channels_agg[str(cid)] = channels_agg.get(str(cid), 0) + int(count or 0)

        # Compute 7-day and previous 7-day metrics for top stat cards
        week_messages = 0
        prev_week_messages = 0
        week_joins = 0
        week_leaves = 0
        prev_week_joins = 0
        prev_week_leaves = 0
        week_voice_minutes = 0
        prev_week_voice_minutes = 0
        week_active_users_set = set()
        prev_week_active_users_set = set()

        for i in range(6, -1, -1):
            d_str = (today - timedelta(days=i)).strftime("%Y-%m-%d")
            doc = doc_map.get(d_str)
            if doc:
                week_messages += int(doc.get("messages", 0) or 0)
                week_joins += int(doc.get("joins", 0) or 0)
                week_leaves += int(doc.get("leaves", 0) or 0)
                week_voice_minutes += int(doc.get("voice_minutes", 0) or 0)
                for u in doc.get("active_users", []) or []:
                    week_active_users_set.add(str(u))

        for i in range(13, 6, -1):
            d_str = (today - timedelta(days=i)).strftime("%Y-%m-%d")
            doc = doc_map.get(d_str)
            if doc:
                prev_week_messages += int(doc.get("messages", 0) or 0)
                prev_week_joins += int(doc.get("joins", 0) or 0)
                prev_week_leaves += int(doc.get("leaves", 0) or 0)
                prev_week_voice_minutes += int(doc.get("voice_minutes", 0) or 0)
                for u in doc.get("active_users", []) or []:
                    prev_week_active_users_set.add(str(u))

        # Include live active voice sessions not yet flushed to MongoDB
        stats_cog = self.bot.get_cog("StatsTracker")
        live_voice_minutes = 0
        if stats_cog and hasattr(stats_cog, "voice_join_times"):
            now_ts = time.time()
            for uid_str, join_ts in list(stats_cog.voice_join_times.items()):
                try:
                    member = guild.get_member(int(uid_str))
                    if member and member.voice and member.voice.channel:
                        elapsed = max(0, int((now_ts - join_ts) / 60))
                        live_voice_minutes += elapsed
                        week_active_users_set.add(str(uid_str))
                except Exception:
                    pass

        week_voice_minutes += live_voice_minutes

        # Fallback to LevelData if GuildStats has 0 messages/voice (e.g. historical data in LevelData)
        if db is not None and week_messages == 0 and week_voice_minutes == 0 and not doc_map:
            try:
                level_docs = list(db["LevelData"].find({"$or": [{"guild_id": guild_id}, {"guild_id": str(guild_id)}]}))
                if level_docs:
                    lvl_msgs = sum(int(d.get("message_count", 0) or 0) for d in level_docs)
                    lvl_voice = sum(int(d.get("voice_minutes", 0) or 0) for d in level_docs)
                    lvl_users = {str(d.get("user_id")) for d in level_docs if (d.get("message_count", 0) or 0) > 0 or (d.get("voice_minutes", 0) or 0) > 0}
                    week_messages = max(week_messages, lvl_msgs)
                    week_voice_minutes = max(week_voice_minutes, lvl_voice)
                    week_active_users_set |= lvl_users
            except Exception:
                pass

        today_doc = doc_map.get(today_str)
        today_messages = int(today_doc.get("messages", 0) or 0) if today_doc else 0
        today_joins = int(today_doc.get("joins", 0) or 0) if today_doc else 0
        today_leaves = int(today_doc.get("leaves", 0) or 0) if today_doc else 0
        today_active_users = len(today_doc.get("active_users", [])) if today_doc and "active_users" in today_doc else 0
        today_voice_minutes = (int(today_doc.get("voice_minutes", 0) or 0) if today_doc else 0) + live_voice_minutes

        voice_hours = round(week_voice_minutes / 60, 1)
        if voice_hours.is_integer():
            voice_hours = int(voice_hours)

        def _calc_pct(curr: float, prev: float) -> int:
            if prev <= 0:
                return 100 if curr > 0 else 0
            return round(((curr - prev) / prev) * 100)

        total_members = guild.member_count or len(guild.members) or 0
        net_week_members = week_joins - week_leaves
        prev_members_est = max(1, total_members - net_week_members)
        members_pct = round((net_week_members / prev_members_est) * 100) if net_week_members != 0 else 0

        changes = {
            "members_pct": members_pct,
            "messages_pct": _calc_pct(week_messages, prev_week_messages),
            "active_users_pct": _calc_pct(len(week_active_users_set), len(prev_week_active_users_set)),
            "voice_pct": _calc_pct(week_voice_minutes, prev_week_voice_minutes),
            "period_messages_pct": _calc_pct(period_messages, prev_period_messages)
        }

        from Components.Systems.Tickets._storage import load_ticket_config
        ticket_cfg = load_ticket_config(guild_id)
        open_tickets = len(ticket_cfg.get("active_tickets", {}))
        
        total_msgs = sum(channels_agg.values()) if channels_agg else 1
        top_channels = []
        for cid, count in sorted(channels_agg.items(), key=lambda x: x[1], reverse=True)[:5]:
            if count <= 0:
                continue
            ch = guild.get_channel(int(cid)) if str(cid).isdigit() else None
            ch_name = ch.name if ch else f"channel-{cid}"
            if ch:
                top_channels.append({
                    "id": str(cid),
                    "name": ch_name,
                    "messages": count,
                    "percentage": round((count / total_msgs) * 100),
                    "change": count
                })
        
        return web.json_response({
            "total_members": total_members,
            "member_count": total_members,
            "today_joins": today_joins,
            "today_leaves": today_leaves,
            "today_messages": today_messages,
            "week_messages": week_messages,
            "message_count": week_messages,
            "period_messages": period_messages,
            "prev_period_messages": prev_period_messages,
            "today_active_users": today_active_users,
            "week_active_users": len(week_active_users_set),
            "active_users": len(week_active_users_set),
            "today_voice_minutes": today_voice_minutes,
            "week_voice_minutes": week_voice_minutes,
            "voice_hours": voice_hours,
            "open_tickets": open_tickets,
            "changes": changes,
            "history": stats,
            "top_channels": top_channels,
            "live_48h": live_48h,
            "total_48h": total_48h
        })

    async def api_guild_stats_live(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        if not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild ID"}, status=400)
        guild_id = int(guild_id_str)
        
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild:
            return web.json_response({"error": "Unauthorized"}, status=403)
            
        recent = []
        if hasattr(self.bot, 'recent_messages'):
            recent = self.bot.recent_messages.get(guild_id, [])
            
        import time
        now = time.time()
        
        minutes = [0] * 60
        for ts in recent:
            diff_sec = now - ts
            if 0 <= diff_sec < 3600:
                minute_idx = 59 - int(diff_sec / 60)
                if 0 <= minute_idx < 60:
                    minutes[minute_idx] += 1
                
        from datetime import datetime, timedelta, timezone
        now_dt = datetime.now(timezone.utc)
        result = []
        for i in range(60):
            d = now_dt - timedelta(minutes=59 - i)
            result.append({
                "name": f"{d.hour:02d}:{d.minute:02d}",
                "label": f"{d.hour:02d}:{d.minute:02d}",
                "messages": minutes[i]
            })

        from Components.Database.mongodb import get_db
        db = get_db()
        doc_map = {}
        if db is not None:
            try:
                for i in range(3):
                    d_str = (now_dt - timedelta(days=i)).strftime("%Y-%m-%d")
                    doc = db["GuildStats"].find_one({"_id": f"{guild_id}_{d_str}"})
                    if doc:
                        doc_map[d_str] = doc
            except Exception:
                pass
        live_48h = self._build_48h_buckets(guild_id, doc_map, now_dt)
        total_48h = sum(b["messages"] for b in live_48h)
            
        return web.json_response({
            "live_60m": result,
            "total_60m": sum(minutes),
            "live_48h": live_48h,
            "total_48h": total_48h
        })

    async def api_mod_activity(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        if not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild ID"}, status=400)
        guild_id = int(guild_id_str)
        
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild:
            return web.json_response({"error": "Unauthorized or not found"}, status=403)
            
        from Components.Commands.ModLog._modlog_storage import get_recent_modlogs
        logs = get_recent_modlogs(guild_id, limit=25)

        if not hasattr(self, "_user_name_cache"):
            self._user_name_cache = {}

        async def _resolve_user_name(raw_id, prefix: str) -> str:
            if not raw_id:
                return f"Unknown {prefix}"
            raw_str = str(raw_id).strip()
            if not raw_str.isdigit():
                return raw_str
            uid = int(raw_str)
            if uid == 0:
                return "AutoMod" if prefix == "Mod" else "Unknown User"
            member = guild.get_member(uid)
            if member:
                self._user_name_cache[uid] = member.display_name or member.name
                return self._user_name_cache[uid]
            user_obj = self.bot.get_user(uid)
            if user_obj:
                self._user_name_cache[uid] = user_obj.display_name or user_obj.name
                return self._user_name_cache[uid]
            if uid in self._user_name_cache:
                return self._user_name_cache[uid]
            try:
                fetched = await self.bot.fetch_user(uid)
                if fetched:
                    self._user_name_cache[uid] = fetched.display_name or fetched.name
                    return self._user_name_cache[uid]
            except Exception:
                pass
            return f"{prefix} {uid}"
        
        results = []
        for log in logs:
            uid = log.get("user_id")
            mid = log.get("moderator_id")
            target_name = await _resolve_user_name(uid, "User")
            mod_name = await _resolve_user_name(mid, "Mod")
            
            results.append({
                "action": log.get("action_type", "Moderation"),
                "reason": log.get("reason") or "No reason provided",
                "target_name": target_name,
                "target_id": str(uid) if uid else "",
                "mod_name": mod_name,
                "mod_id": str(mid) if mid else "",
                "timestamp": log.get("timestamp", 0),
                "case_id": log.get("case_id")
            })
            
        return web.json_response(results)

    async def api_get_user_warns(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        user_id_str = request.match_info.get("user_id")
        if not guild_id_str.isdigit() or not user_id_str.isdigit():
            return web.json_response({"error": "Invalid ID"}, status=400)
        guild_id = int(guild_id_str)
        user_id = int(user_id_str)
        
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild:
            return web.json_response({"error": "Unauthorized or not found"}, status=403)
            
        from Components.Commands.Warn._storage import get_warn_history
        warns = get_warn_history(guild_id, user_id)
        
        results = []
        for warn in warns:
            mod = guild.get_member(warn.get("moderator_id"))
            mod_name = mod.name if mod else f"Mod {warn.get('moderator_id')}"
            
            results.append({
                "reason": warn.get("reason", "No reason provided"),
                "mod_name": mod_name,
                "timestamp": warn.get("timestamp", 0),
                "id": warn.get("warn_id", "Unknown")
            })
            
        return web.json_response(results)

    async def api_channels(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        if not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid ID"}, status=400)
        guild_id = int(guild_id_str)
        
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild:
            return web.json_response({"error": "Unauthorized or not found"}, status=403)
            
        channels = [
            {"id": str(c.id), "name": c.name, "type": "text"}
            for c in sorted(guild.channels, key=lambda x: getattr(x, "position", 0))
            if isinstance(c, discord.TextChannel) or (hasattr(c, "send") and not isinstance(c, (discord.VoiceChannel, discord.StageChannel, discord.CategoryChannel)))
        ]
        return web.json_response(channels)

    async def api_roles(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        if not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid ID"}, status=400)
        guild_id = int(guild_id_str)
        
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild:
            return web.json_response({"error": "Unauthorized or not found"}, status=403)
            
        roles = [
            {
                "id": str(r.id), 
                "name": r.name, 
                "color": f"#{r.color.value:06x}" if r.color.value else None,
                "position": r.position
            }
            for r in guild.roles if not r.is_default()
        ]
        roles.sort(key=lambda x: x["position"], reverse=True)
        return web.json_response(roles)

    async def api_guild_analytics(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        if not guild_id_str or not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild ID"}, status=400)
        guild_id = int(guild_id_str)

        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild:
            return web.json_response({"error": "Unauthorized or not found"}, status=403)

        raw_days = str(request.query.get("days", "7")).strip().lower()
        try:
            days = max(1, min(int(raw_days), 365))
        except ValueError:
            days = 7

        from Components.Database.mongodb import get_db
        from datetime import datetime, timedelta, timezone
        import time

        db = get_db()
        now_dt = datetime.now(timezone.utc)
        now_ts = time.time()

        def _resolve_member_name(uid_raw) -> str:
            if not uid_raw:
                return "Unknown"
            s = str(uid_raw).strip()
            if not s.isdigit():
                return s
            uid_int = int(s)
            m = guild.get_member(uid_int)
            if m:
                return m.display_name or m.name
            u = self.bot.get_user(uid_int)
            if u:
                return u.display_name or u.name
            if hasattr(self, "_user_name_cache") and uid_int in self._user_name_cache:
                return self._user_name_cache[uid_int]
            return f"user-{s[-6:]}"

        def _resolve_channel_info(cid_raw):
            s = str(cid_raw or "").strip()
            if s.isdigit():
                ch = guild.get_channel(int(s))
                if ch:
                    return ch.name, False
            return f"channel-{s[-6:]}" if len(s) >= 6 else f"channel-{s}", True

        def _summary_obj(curr: float, prev: float):
            change = curr - prev
            if prev > 0:
                pct = round((change / prev) * 100, 1)
            else:
                pct = 100.0 if curr > 0 else 0.0
            return {
                "current": curr,
                "previous": prev,
                "change": change,
                "percent": pct
            }

        def _build_rows(curr_map: dict, prev_map: dict, kind: str = "raw", limit: int = 10):
            total_curr = sum(curr_map.values())
            sorted_items = sorted(curr_map.items(), key=lambda x: x[1], reverse=True)[:limit]
            rows = []
            for k, count in sorted_items:
                if count <= 0:
                    continue
                prev_val = prev_map.get(k, 0)
                chg = count - prev_val
                chg_pct = round(((count - prev_val) / prev_val) * 100, 1) if prev_val > 0 else (100.0 if count > 0 else None)
                share = (count / total_curr) if total_curr > 0 else 0
                name = str(k)
                deleted = False
                if kind == "user":
                    name = _resolve_member_name(k)
                elif kind == "channel":
                    name, deleted = _resolve_channel_info(k)
                rows.append({
                    "id": str(k),
                    "name": name,
                    "deleted": deleted,
                    "count": count,
                    "share": share,
                    "change": chg,
                    "changePct": chg_pct
                })
            return {"rows": rows, "total": total_curr}

        doc_map = {}
        if db is not None:
            try:
                all_docs = list(db["GuildStats"].find({
                    "$or": [
                        {"guild_id": guild_id},
                        {"guild_id": str(guild_id)},
                        {"_id": {"$regex": f"^{guild_id}_"}}
                    ]
                }))
                for doc in all_docs:
                    d_str = doc.get("date")
                    if not d_str and isinstance(doc.get("_id"), str) and "_" in doc["_id"]:
                        d_str = doc["_id"].split("_", 1)[1]
                    if d_str:
                        doc_map[d_str] = doc
            except Exception:
                pass

        # Live voice minutes
        stats_cog = self.bot.get_cog("StatsTracker")
        live_voice_total = 0
        live_user_voice = {}
        live_channel_voice = {}
        if stats_cog and hasattr(stats_cog, "voice_join_times"):
            for uid_str, join_ts in list(stats_cog.voice_join_times.items()):
                try:
                    m = guild.get_member(int(uid_str))
                    if m and m.voice and m.voice.channel:
                        elapsed = max(0, int((now_ts - join_ts) / 60))
                        if elapsed > 0:
                            live_voice_total += elapsed
                            live_user_voice[str(uid_str)] = live_user_voice.get(str(uid_str), 0) + elapsed
                            cid_s = str(m.voice.channel.id)
                            live_channel_voice[cid_s] = live_channel_voice.get(cid_s, 0) + elapsed
                except Exception:
                    pass

        total_members = guild.member_count or len(guild.members) or 0

        # Build daily series for current window and previous window
        curr_dates = [(now_dt - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(days - 1, -1, -1)]
        prev_dates = [(now_dt - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(days * 2 - 1, days - 1, -1)]

        # Work backwards from total_members to estimate daily member count
        all_window_dates = prev_dates + curr_dates
        daily_net = {}
        for d_str in all_window_dates:
            doc = doc_map.get(d_str) or {}
            daily_net[d_str] = int(doc.get("joins", 0) or 0) - int(doc.get("leaves", 0) or 0)

        member_curve = {}
        running_members = total_members
        for d_str in reversed(all_window_dates):
            member_curve[d_str] = max(1, running_members)
            running_members = max(1, running_members - daily_net.get(d_str, 0))

        chart_data = []
        prev_chart_data = []

        curr_messages = 0
        prev_messages = 0
        curr_voice = live_voice_total
        prev_voice = 0
        curr_joins = 0
        prev_joins = 0
        curr_leaves = 0
        prev_leaves = 0
        curr_active_users = set(live_user_voice.keys())
        prev_active_users = set()

        curr_channels = {}
        prev_channels = {}
        curr_react_channels = {}
        prev_react_channels = {}
        curr_voice_channels = dict(live_channel_voice)
        prev_voice_channels = {}
        curr_user_msgs = {}
        prev_user_msgs = {}
        curr_user_voice = dict(live_user_voice)
        prev_user_voice = {}
        curr_reacted_users = {}
        prev_reacted_users = {}
        curr_mentioned_users = {}
        prev_mentioned_users = {}

        # Heatmap 7x24 (weekday 0=Sun..6=Sat, hour 0..23)
        heatmap_matrix = [[0 for _ in range(24)] for _ in range(7)]
        heatmap_total = 0

        for idx, d_str in enumerate(curr_dates):
            doc = doc_map.get(d_str) or {}
            dt_obj = datetime.strptime(d_str, "%Y-%m-%d")
            label = dt_obj.strftime("%b %d")
            msgs = int(doc.get("messages", 0) or 0)
            v_mins = int(doc.get("voice_minutes", 0) or 0)
            if idx == len(curr_dates) - 1:
                v_mins += live_voice_total
            au_list = [str(u) for u in (doc.get("active_users") or [])]
            j_cnt = int(doc.get("joins", 0) or 0)
            l_cnt = int(doc.get("leaves", 0) or 0)

            curr_messages += msgs
            curr_voice += int(doc.get("voice_minutes", 0) or 0)
            curr_joins += j_cnt
            curr_leaves += l_cnt
            curr_active_users.update(au_list)

            chart_data.append({
                "date": label,
                "rawDate": d_str,
                "messages": msgs,
                "activeUsers": len(au_list),
                "voiceMinutes": v_mins,
                "members": member_curve.get(d_str, total_members),
                "joins": j_cnt,
                "leaves": l_cnt
            })

            for cid, cnt in (doc.get("channels") or {}).items():
                curr_channels[str(cid)] = curr_channels.get(str(cid), 0) + int(cnt or 0)
            for cid, cnt in (doc.get("reaction_channels") or {}).items():
                curr_react_channels[str(cid)] = curr_react_channels.get(str(cid), 0) + int(cnt or 0)
            for cid, cnt in (doc.get("voice_channels") or {}).items():
                curr_voice_channels[str(cid)] = curr_voice_channels.get(str(cid), 0) + int(cnt or 0)
            for uid, cnt in (doc.get("user_messages") or {}).items():
                curr_user_msgs[str(uid)] = curr_user_msgs.get(str(uid), 0) + int(cnt or 0)
            for uid, cnt in (doc.get("user_voice") or {}).items():
                curr_user_voice[str(uid)] = curr_user_voice.get(str(uid), 0) + int(cnt or 0)
            for uid, cnt in (doc.get("reacted_users") or {}).items():
                curr_reacted_users[str(uid)] = curr_reacted_users.get(str(uid), 0) + int(cnt or 0)
            for uid, cnt in (doc.get("mentioned_users") or {}).items():
                curr_mentioned_users[str(uid)] = curr_mentioned_users.get(str(uid), 0) + int(cnt or 0)

            # Populate heatmap (Python weekday: Mon=0..Sun=6 -> convert to Sun=0..Sat=6)
            sun_weekday = (dt_obj.weekday() + 1) % 7
            hours_dict = doc.get("hours") if isinstance(doc.get("hours"), dict) else {}
            tracked_h = 0
            for hk, hval in hours_dict.items():
                try:
                    h_int = int(hk)
                    if 0 <= h_int < 24:
                        v = int(hval or 0)
                        heatmap_matrix[sun_weekday][h_int] += v
                        tracked_h += v
                        heatmap_total += v
                except Exception:
                    pass
            if msgs > tracked_h:
                rem = msgs - tracked_h
                fallback_h = now_dt.hour if idx == len(curr_dates) - 1 else 18
                heatmap_matrix[sun_weekday][fallback_h] += rem
                heatmap_total += rem

        for d_str in prev_dates:
            doc = doc_map.get(d_str) or {}
            dt_obj = datetime.strptime(d_str, "%Y-%m-%d")
            label = dt_obj.strftime("%b %d")
            msgs = int(doc.get("messages", 0) or 0)
            v_mins = int(doc.get("voice_minutes", 0) or 0)
            au_list = [str(u) for u in (doc.get("active_users") or [])]
            j_cnt = int(doc.get("joins", 0) or 0)
            l_cnt = int(doc.get("leaves", 0) or 0)

            prev_messages += msgs
            prev_voice += v_mins
            prev_joins += j_cnt
            prev_leaves += l_cnt
            prev_active_users.update(au_list)

            prev_chart_data.append({
                "date": label,
                "rawDate": d_str,
                "messages": msgs,
                "activeUsers": len(au_list),
                "voiceMinutes": v_mins,
                "members": member_curve.get(d_str, total_members),
                "joins": j_cnt,
                "leaves": l_cnt
            })

            for cid, cnt in (doc.get("channels") or {}).items():
                prev_channels[str(cid)] = prev_channels.get(str(cid), 0) + int(cnt or 0)
            for cid, cnt in (doc.get("reaction_channels") or {}).items():
                prev_react_channels[str(cid)] = prev_react_channels.get(str(cid), 0) + int(cnt or 0)
            for cid, cnt in (doc.get("voice_channels") or {}).items():
                prev_voice_channels[str(cid)] = prev_voice_channels.get(str(cid), 0) + int(cnt or 0)
            for uid, cnt in (doc.get("user_messages") or {}).items():
                prev_user_msgs[str(uid)] = prev_user_msgs.get(str(uid), 0) + int(cnt or 0)
            for uid, cnt in (doc.get("user_voice") or {}).items():
                prev_user_voice[str(uid)] = prev_user_voice.get(str(uid), 0) + int(cnt or 0)
            for uid, cnt in (doc.get("reacted_users") or {}).items():
                prev_reacted_users[str(uid)] = prev_reacted_users.get(str(uid), 0) + int(cnt or 0)
            for uid, cnt in (doc.get("mentioned_users") or {}).items():
                prev_mentioned_users[str(uid)] = prev_mentioned_users.get(str(uid), 0) + int(cnt or 0)

        # Fallback / supplement from LevelData for People panels if daily per-user breakdown is sparse
        level_docs = []
        if db is not None:
            try:
                level_docs = list(db["LevelData"].find({"$or": [{"guild_id": guild_id}, {"guild_id": str(guild_id)}]}))
            except Exception:
                pass

        for ldoc in level_docs:
            uid_s = str(ldoc.get("user_id") or "")
            if not uid_s:
                continue
            m_cnt = int(ldoc.get("message_count", 0) or 0)
            v_cnt = int(ldoc.get("voice_minutes", 0) or 0)
            r_cnt = int(ldoc.get("reaction_count", 0) or 0)
            if m_cnt > curr_user_msgs.get(uid_s, 0):
                curr_user_msgs[uid_s] = m_cnt
            if v_cnt > curr_user_voice.get(uid_s, 0):
                curr_user_voice[uid_s] = v_cnt
            if r_cnt > curr_reacted_users.get(uid_s, 0):
                curr_reacted_users[uid_s] = r_cnt

        # At-Risk Members: members who had messages before but 0 in recent active window, or lowest recent activity
        at_risk_map = {}
        recent_active_3d = set()
        for d_str in curr_dates[-min(3, len(curr_dates)):]:
            doc = doc_map.get(d_str) or {}
            for u in (doc.get("active_users") or []):
                recent_active_3d.add(str(u))
        for ldoc in level_docs:
            uid_s = str(ldoc.get("user_id") or "")
            m_cnt = int(ldoc.get("message_count", 0) or 0)
            if uid_s and m_cnt > 0 and uid_s not in recent_active_3d:
                at_risk_map[uid_s] = m_cnt

        # Surging channels: channels with positive growth vs previous period
        surging_curr = {}
        surging_prev = {}
        for cid, cnt in curr_channels.items():
            p_cnt = prev_channels.get(cid, 0)
            if cnt > p_cnt:
                surging_curr[cid] = cnt
                surging_prev[cid] = p_cnt

        # Moderation & Safety from ModLogs
        from Components.Commands.ModLog._modlog_storage import get_recent_modlogs
        all_modlogs = get_recent_modlogs(guild_id, limit=250)
        window_cutoff = now_ts - (days * 86400)
        prev_window_cutoff = now_ts - (days * 2 * 86400)

        curr_mod_count = 0
        prev_mod_count = 0
        mod_daily_counts = {d_str: 0 for d_str in curr_dates}
        curr_mod_users = {}
        prev_mod_users = {}
        curr_automod_trips = {}
        prev_automod_trips = {}
        curr_safety_by_type = {}
        prev_safety_by_type = {}
        curr_threats_by_hour = {}
        prev_threats_by_hour = {}

        safety_keywords = {
            "raid": "raid",
            "nuke": "nuke_ban",
            "massban": "nuke_ban",
            "masskick": "nuke_kick",
            "webhook": "webhook_protection",
            "alt": "new_account_flagged",
            "suspicious": "suspicious_account",
            "honeypot": "suspicious_account"
        }

        for log in all_modlogs:
            ts = float(log.get("timestamp", 0) or 0)
            action = str(log.get("action_type", "Moderation"))
            reason = str(log.get("reason", "") or "")
            uid_s = str(log.get("user_id") or "")
            mid_s = str(log.get("moderator_id") or "")
            dt_log = datetime.fromtimestamp(ts, tz=timezone.utc) if ts > 0 else now_dt
            d_key = dt_log.strftime("%Y-%m-%d")

            is_curr = ts >= window_cutoff
            is_prev = prev_window_cutoff <= ts < window_cutoff

            if is_curr:
                curr_mod_count += 1
                if d_key in mod_daily_counts:
                    mod_daily_counts[d_key] += 1
                if uid_s and uid_s != "0":
                    curr_mod_users[uid_s] = curr_mod_users.get(uid_s, 0) + 1
                if mid_s == "0" or "automod" in action.lower() or "automod" in reason.lower() or "filter" in reason.lower():
                    filter_label = reason.split(":")[0].strip() if ":" in reason else action
                    curr_automod_trips[filter_label] = curr_automod_trips.get(filter_label, 0) + 1
            elif is_prev:
                prev_mod_count += 1
                if uid_s and uid_s != "0":
                    prev_mod_users[uid_s] = prev_mod_users.get(uid_s, 0) + 1
                if mid_s == "0" or "automod" in action.lower() or "automod" in reason.lower() or "filter" in reason.lower():
                    filter_label = reason.split(":")[0].strip() if ":" in reason else action
                    prev_automod_trips[filter_label] = prev_automod_trips.get(filter_label, 0) + 1

            combined_lower = (action + " " + reason).lower()
            matched_safety = None
            for kw, stype in safety_keywords.items():
                if kw in combined_lower:
                    matched_safety = stype
                    break
            if matched_safety:
                h_key = str(dt_log.hour)
                if is_curr:
                    curr_safety_by_type[matched_safety] = curr_safety_by_type.get(matched_safety, 0) + 1
                    curr_threats_by_hour[h_key] = curr_threats_by_hour.get(h_key, 0) + 1
                elif is_prev:
                    prev_safety_by_type[matched_safety] = prev_safety_by_type.get(matched_safety, 0) + 1
                    prev_threats_by_hour[h_key] = prev_threats_by_hour.get(h_key, 0) + 1

        # Tickets metrics
        from Components.Systems.Tickets._storage import load_ticket_config
        ticket_cfg = load_ticket_config(guild_id)
        active_tickets_dict = ticket_cfg.get("active_tickets", {}) or {}
        closed_tickets_list = ticket_cfg.get("closed_tickets", []) or []

        open_tickets_count = len(active_tickets_dict)
        curr_closed_tickets = 0
        prev_closed_tickets = 0
        closed_daily_counts = {d_str: 0 for d_str in curr_dates}
        resolve_durations = []
        tickets_by_cat = {}

        for _, tdata in active_tickets_dict.items():
            cat = str(tdata.get("category_option") or "General Support")
            tickets_by_cat[cat] = tickets_by_cat.get(cat, 0) + 1

        for tdata in closed_tickets_list:
            c_at = float(tdata.get("closed_at", 0) or 0)
            cr_at = float(tdata.get("created_at", 0) or 0)
            cat = str(tdata.get("category_option") or "General Support")
            if c_at >= window_cutoff:
                curr_closed_tickets += 1
                tickets_by_cat[cat] = tickets_by_cat.get(cat, 0) + 1
                d_key = datetime.fromtimestamp(c_at, tz=timezone.utc).strftime("%Y-%m-%d")
                if d_key in closed_daily_counts:
                    closed_daily_counts[d_key] += 1
                if cr_at > 0 and c_at > cr_at:
                    resolve_durations.append((c_at - cr_at) / 60.0)
            elif prev_window_cutoff <= c_at < window_cutoff:
                prev_closed_tickets += 1

        avg_resolve_str = "-"
        if resolve_durations:
            avg_mins = sum(resolve_durations) / len(resolve_durations)
            if avg_mins < 60:
                avg_resolve_str = f"{max(1, round(avg_mins))}m"
            else:
                h = int(avg_mins // 60)
                m = round(avg_mins % 60)
                avg_resolve_str = f"{h}h {m}m" if m > 0 else f"{h}h"

        # Invites & Sources
        curr_inviters = {}
        leaves_by_inviter = {}
        top_sources = []
        if db is not None:
            try:
                inv_docs = list(db["InviteTracker"].find({"guild_id": str(guild_id)}))
                inv_stats = list(db["InviteStats"].find({"guild_id": str(guild_id)}))
                code_counts = {}
                for doc in inv_docs:
                    inv_id = str(doc.get("inviter_id") or "")
                    code = str(doc.get("code") or "")
                    left = bool(doc.get("left", False))
                    if inv_id:
                        if left:
                            leaves_by_inviter[inv_id] = leaves_by_inviter.get(inv_id, 0) + 1
                        else:
                            curr_inviters[inv_id] = curr_inviters.get(inv_id, 0) + 1
                    if code:
                        code_counts[code] = code_counts.get(code, 0) + 1
                for sdoc in inv_stats:
                    inv_id = str(sdoc.get("user_id") or "")
                    bonus = int(sdoc.get("bonus", 0) or 0)
                    if inv_id and bonus > 0:
                        curr_inviters[inv_id] = curr_inviters.get(inv_id, 0) + bonus
                for code, j_cnt in sorted(code_counts.items(), key=lambda x: x[1], reverse=True)[:8]:
                    top_sources.append({
                        "id": code,
                        "name": f"discord.gg/{code}",
                        "joins": j_cnt
                    })
            except Exception:
                pass

        # Retention Funnel (last max(days, 30) days)
        funnel_days = max(days, 30)
        funnel_cutoff_dt = now_dt - timedelta(days=funnel_days)
        active_uid_all = set(curr_user_msgs.keys()) | set(curr_active_users)
        joined_members = [m for m in guild.members if not m.bot and m.joined_at and m.joined_at >= funnel_cutoff_dt]
        funnel_joined = max(len(joined_members), curr_joins)
        funnel_first_msg = sum(1 for m in joined_members if str(m.id) in active_uid_all)
        seven_d_ago = now_dt - timedelta(days=7)
        thirty_d_ago = now_dt - timedelta(days=30)
        funnel_ret_7d = sum(1 for m in joined_members if m.joined_at <= seven_d_ago and str(m.id) in active_uid_all)
        funnel_ret_30d = sum(1 for m in joined_members if m.joined_at <= thirty_d_ago and str(m.id) in active_uid_all)
        if funnel_joined > 0 and funnel_first_msg == 0 and len(active_uid_all) > 0:
            funnel_first_msg = min(funnel_joined, len(active_uid_all))
            funnel_ret_7d = min(funnel_first_msg, max(1, funnel_first_msg // 2))

        # Cohort Retention (last 6 weeks)
        cohorts = []
        current_week_start = (now_dt - timedelta(days=now_dt.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
        for w_idx in range(5, -1, -1):
            w_start = current_week_start - timedelta(weeks=w_idx)
            w_end = w_start + timedelta(weeks=1)
            w_members = [m for m in guild.members if not m.bot and m.joined_at and w_start <= m.joined_at < w_end]
            size = len(w_members)
            weeks_elapsed = 6 - w_idx
            retention_arr = []
            for step in range(6):
                if step >= weeks_elapsed:
                    retention_arr.append(None)
                elif size == 0:
                    retention_arr.append(0)
                elif step == 0:
                    active_in_cohort = sum(1 for m in w_members if str(m.id) in active_uid_all)
                    pct = round((max(1, active_in_cohort) / size) * 100) if active_in_cohort > 0 else 100
                    retention_arr.append(pct)
                else:
                    active_in_cohort = sum(1 for m in w_members if str(m.id) in active_uid_all)
                    pct = round((active_in_cohort / size) * 100)
                    retention_arr.append(pct)
            if size > 0:
                cohorts.append({
                    "weekStart": w_start.strftime("%Y-%m-%d"),
                    "label": w_start.strftime("%b %d"),
                    "size": size,
                    "retention": retention_arr
                })

        # Live 48h & 60m
        live_48h = self._build_48h_buckets(guild_id, doc_map, now_dt)
        total_48h = sum(b["messages"] for b in live_48h)
        recent = getattr(self.bot, "recent_messages", {}).get(guild_id, []) if hasattr(self.bot, "recent_messages") else []
        minutes_60 = [0] * 60
        for ts in recent:
            diff_sec = now_ts - ts
            if 0 <= diff_sec < 3600:
                m_idx = 59 - int(diff_sec / 60)
                if 0 <= m_idx < 60:
                    minutes_60[m_idx] += 1
        live_60m = []
        for i in range(60):
            d_m = now_dt - timedelta(minutes=59 - i)
            live_60m.append({
                "label": f"{d_m.hour:02d}:{d_m.minute:02d}",
                "count": minutes_60[i]
            })

        net_curr_members = curr_joins - curr_leaves
        prev_members_est = max(1, total_members - net_curr_members)

        summaries = {
            "messages": _summary_obj(curr_messages, prev_messages),
            "activeUsers": _summary_obj(len(curr_active_users), len(prev_active_users)),
            "voiceMinutes": _summary_obj(curr_voice, prev_voice),
            "members": {
                "current": total_members,
                "previous": prev_members_est,
                "change": net_curr_members,
                "percent": round((net_curr_members / prev_members_est) * 100, 1) if net_curr_members != 0 else 0.0
            },
            "modActions": _summary_obj(curr_mod_count, prev_mod_count),
            "openTickets": _summary_obj(open_tickets_count, open_tickets_count),
            "closedTickets": _summary_obj(curr_closed_tickets, prev_closed_tickets),
            "avgResolveTime": avg_resolve_str
        }

        sparklines = {
            "messages": [d["messages"] for d in chart_data],
            "activeUsers": [d["activeUsers"] for d in chart_data],
            "voiceMinutes": [d["voiceMinutes"] for d in chart_data],
            "members": [d["members"] for d in chart_data],
            "modActions": [mod_daily_counts.get(d["rawDate"], 0) for d in chart_data],
            "openTickets": [open_tickets_count for _ in chart_data],
            "closedTickets": [closed_daily_counts.get(d["rawDate"], 0) for d in chart_data]
        }

        heatmap_max = max((max(row) for row in heatmap_matrix), default=0)

        return web.json_response({
            "days": days,
            "chartData": chart_data,
            "previousChartData": prev_chart_data,
            "summaries": summaries,
            "sparklines": sparklines,
            "heatmap": {
                "matrix": heatmap_matrix,
                "total": heatmap_total,
                "maxCount": heatmap_max
            },
            "liveMessages": {
                "48h": {
                    "total": total_48h,
                    "data": [{"label": b["label"] if i % 6 == 0 else "", "fullLabel": b["label"], "count": b["messages"]} for i, b in enumerate(live_48h)]
                },
                "60min": {
                    "total": sum(minutes_60),
                    "data": live_60m
                }
            },
            "panels": {
                "topMessageChannels": _build_rows(curr_channels, prev_channels, kind="channel", limit=7),
                "topReactionChannels": _build_rows(curr_react_channels, prev_react_channels, kind="channel", limit=10),
                "topCommunicators": _build_rows(curr_user_msgs, prev_user_msgs, kind="user", limit=10),
                "topVoiceUsers": _build_rows(curr_user_voice, prev_user_voice, kind="user", limit=10),
                "mostReactedTo": _build_rows(curr_reacted_users, prev_reacted_users, kind="user", limit=10),
                "atRiskMembers": _build_rows(at_risk_map, {}, kind="user", limit=10),
                "topInviters": _build_rows(curr_inviters, {}, kind="user", limit=10),
                "mostMentioned": _build_rows(curr_mentioned_users, prev_mentioned_users, kind="user", limit=10),
                "topVoiceChannels": _build_rows(curr_voice_channels, prev_voice_channels, kind="channel", limit=10),
                "surgingChannels": _build_rows(surging_curr, surging_prev, kind="channel", limit=10),
                "topModeratedUsers": _build_rows(curr_mod_users, prev_mod_users, kind="user", limit=10),
                "modActionsByChannel": {"rows": [], "total": 0},
                "autoModTrips": _build_rows(curr_automod_trips, prev_automod_trips, kind="raw", limit=10),
                "ticketsByCategory": _build_rows(tickets_by_cat, {}, kind="raw", limit=10),
                "safetyActivity": _build_rows(curr_safety_by_type, prev_safety_by_type, kind="raw", limit=10),
                "threatsByHour": _build_rows(curr_threats_by_hour, prev_threats_by_hour, kind="raw", limit=10),
                "suspiciousAccounts": {"accounts": [], "total": 0},
                "leavesBySource": _build_rows(leaves_by_inviter, {}, kind="user", limit=10)
            },
            "growth": {
                "sources": {
                    "summaries": {
                        "totalJoins": _summary_obj(curr_joins, prev_joins),
                        "totalLeaves": _summary_obj(curr_leaves, prev_leaves),
                        "retained": _summary_obj(max(0, curr_joins - curr_leaves), max(0, prev_joins - prev_leaves)),
                        "sourceCount": len(top_sources)
                    },
                    "topSources": top_sources
                },
                "retentionFunnel": {
                    "joined": funnel_joined,
                    "firstMessage": funnel_first_msg,
                    "retained7d": funnel_ret_7d,
                    "retained30d": funnel_ret_30d
                },
                "cohortRetention": {
                    "weeks": 6,
                    "cohorts": cohorts
                }
            }
        })
