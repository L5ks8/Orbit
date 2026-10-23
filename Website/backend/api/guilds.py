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
        
        cached = self._manageable_guilds_cache.get(user["id"])
        if cached and (now - cached['time'] < 60) and not force_refresh:
            return web.json_response(cached['data'])

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
                
            bot_guild = self.bot.get_guild(int(g["id"]))
            if not bot_guild:
                try:
                    bot_guild = discord.utils.get(self.bot.guilds, id=int(g["id"]))
                except Exception:
                    pass
            bot_in_server = bot_guild is not None
                
            if not (is_admin or manage_guild):
                if not bot_in_server:
                    continue
                settings_cfg = load_settings_config(int(g["id"]))
                manager_roles = settings_cfg.get("manager_roles", [])
                if manager_roles:
                    member = bot_guild.get_member(int(user["id"]))
                    if not (member and any(str(r.id) in manager_roles for r in member.roles)):
                        continue
                else:
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
        # distribute the remaining untracked messages deterministically across the valid hours of that date.
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
                    import math
                    weights = []
                    for idx in date_indices:
                        hr = int(hourly_buckets[idx]["hour"])
                        # Natural activity curve peaking in afternoon/evening UTC
                        w = max(0.15, 0.55 + 0.45 * math.sin((hr - 8) * math.pi / 12))
                        weights.append(w)
                    total_w = sum(weights) or 1.0
                    allocated = 0
                    for k_idx, idx in enumerate(date_indices):
                        if k_idx == len(date_indices) - 1:
                            share = max(0, untracked - allocated)
                        else:
                            share = int(round(untracked * (weights[k_idx] / total_w)))
                            if allocated + share > untracked:
                                share = max(0, untracked - allocated)
                        hourly_buckets[idx]["messages"] += share
                        allocated += share

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
            {"id": str(c.id), "name": c.name, "type": str(c.type)}
            for c in guild.text_channels
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
