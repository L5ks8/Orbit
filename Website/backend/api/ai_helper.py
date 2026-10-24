import os
import re
import json
import time
import base64
import secrets
import pathlib
import asyncio
import aiohttp
import discord
from aiohttp import web
from typing import Dict, Any, List, Optional

from Components.Systems.WelcomeGoodbye._storage import load_welcome_config, save_welcome_config
from Components.Systems.WelcomeGoodbye._storage import load_goodbye_config, save_goodbye_config
from Components.Systems.Automoderation._storage import load_automod_config, save_automod_config
from Components.Systems.Verify._storage import load_verify_config, save_verify_config
from Components.Systems.Roles._storage import load_join_roles, save_join_roles
from Components.Systems.Automoderation.log_storage import load_log_config, save_log_config
from Components.Systems.Level._storage import load_level_config, save_level_config
from Components.Systems.Tickets._storage import load_ticket_config, save_ticket_config
from Components.Systems.JoinToCreate._storage import load_jtc_config, save_jtc_config
from Components.Systems.Security._storage import load_security_config, save_security_config

_GROQ_RESOLVED_MODELS: List[str] = []
_GROQ_VISION_MODELS: List[str] = []

# In-memory fallback stores
_MEM_CHATS: Dict[int, List[Dict[str, Any]]] = {}
_MEM_UNDO_STACK: Dict[int, List[Dict[str, Any]]] = {}
_MEM_REDO_STACK: Dict[int, List[Dict[str, Any]]] = {}
_MEM_ACTION_HISTORY: Dict[int, List[Dict[str, Any]]] = {}

_DATA_DIR = pathlib.Path("Storage") / "AIHelper"

SUPPORTED_PERMISSIONS = {
    "view_channel",
    "send_messages",
    "read_message_history",
    "connect",
    "speak",
    "attach_files",
    "embed_links",
    "add_reactions",
    "use_external_emojis",
    "manage_messages",
    "manage_channels",
    "manage_roles",
    "mention_everyone",
    "send_messages_in_threads",
    "create_public_threads",
    "create_private_threads",
    "stream",
    "use_voice_activation",
    "mute_members",
    "deafen_members",
    "move_members",
}


def _get_groq_api_key() -> str:
    env_key = os.environ.get("GROQ_API_KEY", "").strip()
    if env_key:
        return env_key
    try:
        env_path = pathlib.Path(".env")
        if env_path.exists():
            for line in env_path.read_text(encoding="utf-8", errors="ignore").splitlines():
                line = line.strip()
                if line.startswith("GROQ_API_KEY="):
                    val = line.split("=", 1)[1].strip().strip('"').strip("'")
                    if val:
                        os.environ["GROQ_API_KEY"] = val
                        return val
    except Exception:
        pass
    return ""


async def _resolve_groq_models(session: aiohttp.ClientSession, groq_key: str, need_vision: bool = False) -> List[str]:
    global _GROQ_RESOLVED_MODELS, _GROQ_VISION_MODELS
    if need_vision and _GROQ_VISION_MODELS:
        return _GROQ_VISION_MODELS
    if not need_vision and _GROQ_RESOLVED_MODELS:
        return _GROQ_RESOLVED_MODELS

    headers = {"Authorization": f"Bearer {groq_key}"}
    try:
        async with session.get(
            "https://api.groq.com/openai/v1/models",
            headers=headers,
            timeout=aiohttp.ClientTimeout(total=5.0),
        ) as resp:
            if resp.status == 200:
                data = await resp.json()
                all_ids = [m.get("id", "") for m in data.get("data", []) if m.get("id")]
                raw_models = [
                    mid for mid in all_ids
                    if "whisper" not in mid.lower()
                    and "guard" not in mid.lower()
                    and "orpheus" not in mid.lower()
                    and "allam" not in mid.lower()
                    and "tts" not in mid.lower()
                ]

                vision_candidates = [
                    mid for mid in raw_models
                    if any(vk in mid.lower() for vk in ("llama-4-scout", "llama-4-maverick", "vision", "llava"))
                ]
                if vision_candidates:
                    _GROQ_VISION_MODELS = vision_candidates

                def _sort_pref(m_id: str) -> int:
                    ml = m_id.lower()
                    if "70b" in ml or "llama-3.3" in ml:
                        return 0
                    if "8b-instant" in ml or "llama-3.1-8b" in ml:
                        return 1
                    if "120b" in ml:
                        return 2
                    if "qwen" in ml:
                        return 3
                    if "scout" in ml or "maverick" in ml:
                        return 4
                    if "20b" in ml or "27b" in ml or "32b" in ml:
                        return 5
                    return 6

                raw_models.sort(key=_sort_pref)
                if raw_models:
                    _GROQ_RESOLVED_MODELS = raw_models
    except Exception as e:
        print(f"[AIHelper] Error fetching Groq models: {e}")

    if need_vision:
        return _GROQ_VISION_MODELS or [
            "meta-llama/llama-4-scout-17b-16e-instruct",
            "meta-llama/llama-4-maverick-17b-128e-instruct",
            "llama-3.2-90b-vision-preview",
            "llama-3.2-11b-vision-preview",
        ]

    return _GROQ_RESOLVED_MODELS or [
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "openai/gpt-oss-120b",
        "qwen/qwen3.8-27b",
        "openai/gpt-oss-20b",
    ]


def _extract_json_payload(raw_text: str) -> Dict[str, Any]:
    """Extracts JSON object from the model output, stripping <think> tags or markdown fences."""
    cleaned = re.sub(r"<think>[\s\S]*?</think>", "", raw_text or "", flags=re.DOTALL).strip()

    try:
        parsed = json.loads(cleaned)
        if isinstance(parsed, dict):
            return parsed
    except Exception:
        pass

    fence_match = re.search(r"```(?:json)?\s*(\{[\s\S]*?\})\s*```", cleaned, flags=re.IGNORECASE)
    if fence_match:
        try:
            parsed = json.loads(fence_match.group(1))
            if isinstance(parsed, dict):
                return parsed
        except Exception:
            pass

    first_brace = cleaned.find("{")
    last_brace = cleaned.rfind("}")
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        candidate = cleaned[first_brace:last_brace + 1]
        try:
            parsed = json.loads(candidate)
            if isinstance(parsed, dict):
                return parsed
        except Exception:
            pass

    # Salvage truncated or unclosed JSON
    if '"reply"' in cleaned:
        reply_m = re.search(r'"reply"\s*:\s*"((?:[^"\\]|\\.)*)"', cleaned, flags=re.DOTALL)
        if reply_m:
            try:
                unescaped = json.loads(f'"{reply_m.group(1)}"')
                return {"reply": unescaped, "actions": []}
            except Exception:
                return {"reply": reply_m.group(1).replace("\\n", "\n").replace('\\"', '"'), "actions": []}

        unclosed_m = re.search(r'"reply"\s*:\s*"(.*)', cleaned, flags=re.DOTALL)
        if unclosed_m:
            rem = unclosed_m.group(1)
            for sep in ['",\n', '",\r\n', '", "actions"', '",\n  "actions"']:
                if sep in rem:
                    rem = rem.split(sep)[0]
                    break
            return {"reply": rem.replace("\\n", "\n").replace('\\"', '"').strip(), "actions": []}

    if cleaned.startswith("{") and "reply" in cleaned:
        lines = cleaned.splitlines()
        filtered = [l for l in lines if not l.strip().startswith("{") and not l.strip().startswith("}") and not l.strip().startswith('"actions"')]
        if filtered:
            return {"reply": "\n".join(filtered).strip(), "actions": []}

    return {"reply": cleaned or "How can I help you with your server configuration?", "actions": []}


class AIHelperMixin:
    def _disk_chat_path(self, guild_id: int) -> pathlib.Path:
        _DATA_DIR.mkdir(parents=True, exist_ok=True)
        return _DATA_DIR / f"chats_{guild_id}.json"

    def _load_guild_chats(self, guild_id: int) -> List[Dict[str, Any]]:
        # 1. Check MongoDB
        try:
            from Components.Database.mongodb import get_db
            db = get_db()
            if db is not None:
                doc = db["AIHelperChats"].find_one({"_id": str(guild_id)})
                if doc and isinstance(doc.get("chats"), list) and len(doc["chats"]) > 0:
                    _MEM_CHATS[guild_id] = doc["chats"]
                    return doc["chats"]
        except Exception:
            pass

        # 2. Check local disk JSON
        try:
            p = self._disk_chat_path(guild_id)
            if p.exists():
                raw = json.loads(p.read_text(encoding="utf-8"))
                if isinstance(raw, dict) and isinstance(raw.get("chats"), list):
                    _MEM_CHATS[guild_id] = raw["chats"]
                    if isinstance(raw.get("action_history"), list) and guild_id not in _MEM_ACTION_HISTORY:
                        _MEM_ACTION_HISTORY[guild_id] = raw["action_history"]
                    return raw["chats"]
        except Exception:
            pass

        # 3. Fallback to memory
        return _MEM_CHATS.get(guild_id, [])

    def _save_guild_chats(self, guild_id: int, chats: List[Dict[str, Any]]):
        trimmed = chats[:50]
        _MEM_CHATS[guild_id] = trimmed

        # 1. Save to local disk JSON
        try:
            p = self._disk_chat_path(guild_id)
            payload = {
                "guild_id": str(guild_id),
                "updated_at": time.time(),
                "chats": trimmed,
                "action_history": _MEM_ACTION_HISTORY.get(guild_id, [])[:30],
            }
            p.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        except Exception as e:
            print(f"[AIHelper] Disk save error: {e}")

        # 2. Save to MongoDB
        try:
            from Components.Database.mongodb import get_db
            db = get_db()
            if db is not None:
                db["AIHelperChats"].update_one(
                    {"_id": str(guild_id)},
                    {"$set": {
                        "chats": trimmed,
                        "action_history": _MEM_ACTION_HISTORY.get(guild_id, [])[:30],
                        "updated_at": time.time(),
                    }},
                    upsert=True
                )
        except Exception:
            pass

    def _build_guild_context_prompt(self, guild: discord.Guild) -> str:
        guild_id = guild.id
        cats = [f"{c.name}({c.id})" for c in sorted(guild.categories, key=lambda x: x.position)[:25]]
        txt_chs = [
            f"#{c.name}({c.id})"
            for c in sorted(guild.text_channels, key=lambda x: x.position)[:40]
        ]
        vc_chs = [
            f"🔊{c.name}({c.id})"
            for c in sorted(guild.voice_channels, key=lambda x: x.position)[:20]
        ]
        roles_list = [f"@{guild.default_role.name}({guild.default_role.id})"] + [
            f"@{r.name}({r.id})"
            for r in sorted(guild.roles, key=lambda x: x.position, reverse=True)
            if not r.is_default()
        ][:35]

        welcome_cfg = load_welcome_config(guild_id)
        goodbye_cfg = load_goodbye_config(guild_id)
        automod_cfg = load_automod_config(guild_id)
        verify_cfg = load_verify_config(guild_id)
        joinroles_cfg = load_join_roles(guild_id)
        ticket_cfg = load_ticket_config(guild_id)
        level_cfg = load_level_config(guild_id)
        logs_cfg = load_log_config(guild_id)
        jtc_cfg = load_jtc_config(guild_id)
        sec_cfg = load_security_config(guild_id)

        # 1. Ticket System Metrics
        active_tickets_map = ticket_cfg.get("active_tickets", {}) if isinstance(ticket_cfg.get("active_tickets"), dict) else {}
        closed_tickets_list = ticket_cfg.get("closed_tickets", []) if isinstance(ticket_cfg.get("closed_tickets"), list) else []
        ticket_active_count = len(active_tickets_map)
        ticket_closed_count = len(closed_tickets_list)
        ticket_counter = ticket_cfg.get("ticket_counter", 0)
        ticket_panel_ch = f"#{guild.get_channel(ticket_cfg['panel_channel_id']).name}({ticket_cfg['panel_channel_id']})" if ticket_cfg.get("panel_channel_id") and guild.get_channel(ticket_cfg["panel_channel_id"]) else "None"

        # 2. Giveaways Status
        gw_summary = "0 active"
        try:
            from Components.Commands.Giveaway._storage import load_giveaways
            all_gw = load_giveaways(guild_id) or {}
            now_ts = time.time()
            active_gws = []
            for gid, gentry in all_gw.items():
                if isinstance(gentry, dict) and not gentry.get("ended") and not gentry.get("draft") and gentry.get("end_timestamp", 0) > now_ts:
                    ch_name = "unknown"
                    if gentry.get("channel_id"):
                        ch_obj = guild.get_channel(int(gentry["channel_id"]))
                        if ch_obj:
                            ch_name = f"#{ch_obj.name}"
                    active_gws.append(f"'{gentry.get('prize', 'Prize')}' ({gentry.get('winners', 1)}w) in {ch_name} [{len(gentry.get('entries', []))} entries]")
            gw_summary = f"{len(active_gws)} Active: {', '.join(active_gws)}" if active_gws else f"0 active ({len(all_gw)} total in history)"
        except Exception:
            gw_summary = "0 active"

        # 3. Verification Details
        v_ch = f"#{guild.get_channel(verify_cfg['channel_id']).name}({verify_cfg['channel_id']})" if verify_cfg.get("channel_id") and guild.get_channel(verify_cfg["channel_id"]) else "None"
        v_role = f"@{guild.get_role(verify_cfg['role_id']).name}({verify_cfg['role_id']})" if verify_cfg.get("role_id") and guild.get_role(verify_cfg["role_id"]) else "None"
        v_status = f"Enabled={verify_cfg.get('enabled', False)}, Type={verify_cfg.get('verification_type', 'captcha')}, Channel={v_ch}, VerifiedRole={v_role}"

        # 4. AutoMod & Security Summary
        am_active = []
        if automod_cfg.get("enabled"):
            if automod_cfg.get("anti_spam", {}).get("enabled"): am_active.append("AntiSpam")
            if automod_cfg.get("anti_link", {}).get("enabled"): am_active.append("AntiLink")
            if automod_cfg.get("anti_invites", {}).get("enabled"): am_active.append("AntiInvite")
            if automod_cfg.get("anti_alt", {}).get("enabled"): am_active.append(f"AntiAlt({automod_cfg['anti_alt'].get('min_age_days', 3)}d)")
            if automod_cfg.get("ai_automod", {}).get("enabled"): am_active.append("AI-Filter")
            if automod_cfg.get("banned_words", {}).get("enabled"): am_active.append("BannedWords")

        sec_active = []
        if sec_cfg.get("anti_raid", {}).get("enabled"):
            sec_active.append(f"AntiRaid(Threshold:{sec_cfg['anti_raid'].get('join_threshold', 10)}/{sec_cfg['anti_raid'].get('time_window', 10)}s)")
        if sec_cfg.get("anti_nuke", {}).get("enabled"):
            sec_active.append("AntiNuke")

        # 5. Activity Analytics (7 Days)
        stats_summary = "No stats recorded yet"
        try:
            from Components.Database.mongodb import get_db
            from datetime import datetime, timedelta, timezone
            db = get_db()
            if db is not None:
                now_dt = datetime.now(timezone.utc)
                curr_dates = [(now_dt - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(7)]
                gid_str = str(guild_id)
                def _fetch_ai_stats():
                    d = list(db["GuildStats"].find({
                        "_id": {
                            "$gte": f"{gid_str}_",
                            "$lt": f"{gid_str}_\uffff"
                        }
                    }).limit(365))
                    if not d:
                        d = list(db["GuildStats"].find({
                            "$or": [{"guild_id": guild_id}, {"guild_id": gid_str}]
                        }).limit(365))
                    return d
                docs = await asyncio.to_thread(_fetch_ai_stats)
                tot_msgs = 0
                tot_voice = 0
                tot_joins = 0
                tot_leaves = 0
                for d in docs:
                    d_str = d.get("date") or (d.get("_id", "").split("_", 1)[1] if "_" in str(d.get("_id")) else "")
                    if d_str in curr_dates:
                        tot_msgs += int(d.get("messages", 0) or 0)
                        tot_voice += int(d.get("voice_minutes", 0) or 0)
                        tot_joins += int(d.get("joins", 0) or 0)
                        tot_leaves += int(d.get("leaves", 0) or 0)
                stats_summary = f"Past 7 Days: {tot_msgs} messages sent, {tot_voice} voice minutes, +{tot_joins} joins, -{tot_leaves} leaves (Net growth: {tot_joins - tot_leaves})"
        except Exception:
            stats_summary = "Stats lookup unavailable"

        active_mods = []
        if welcome_cfg.get("enabled"): active_mods.append(f"Welcome(Ch:{welcome_cfg.get('channel_id')})")
        if goodbye_cfg.get("enabled"): active_mods.append(f"Goodbye(Ch:{goodbye_cfg.get('channel_id')})")
        if joinroles_cfg.get("enabled"): active_mods.append(f"JoinRoles({len(joinroles_cfg.get('roles', []))} roles)")
        if verify_cfg.get("enabled"): active_mods.append(f"Verify({v_status})")
        if ticket_cfg.get("enabled"): active_mods.append(f"Tickets(Open:{ticket_active_count}, Closed:{ticket_closed_count}, Ch:{ticket_panel_ch})")
        if level_cfg.get("enabled"): active_mods.append(f"Levels(AnnounceCh:{level_cfg.get('announce_channel_id')})")
        if logs_cfg.get("enabled"): active_mods.append(f"Logs(DefaultCh:{logs_cfg.get('default_channel_id')})")
        if jtc_cfg.get("enabled"): active_mods.append(f"TempVoice(TriggerCh:{jtc_cfg.get('trigger_channel_id')})")
        if automod_cfg.get("enabled"): active_mods.append(f"AutoMod({', '.join(am_active)})")
        if sec_cfg.get("anti_raid", {}).get("enabled") or sec_cfg.get("anti_nuke", {}).get("enabled"): active_mods.append(f"Security({', '.join(sec_active)})")

        # 6. Moderation History & Cases
        mod_history_summary = "No recorded moderation cases yet"
        try:
            from Components.Commands.Cases.storage import _get_cases_collection
            from Components.Commands.ModLog.storage import get_recent_modlogs
            cases_col = _get_cases_collection()
            recent_cases = []
            if cases_col is not None:
                recent_cases = list(cases_col.find({"guild_id": {"$in": [int(guild_id), str(guild_id)]}}).sort("case_id", -1).limit(50))
            if not recent_cases:
                recent_cases = get_recent_modlogs(guild_id, limit=50)

            if recent_cases:
                action_counts = {}
                reasons = []
                for c in recent_cases:
                    act = str(c.get("action") or c.get("action_type") or "warn").lower()
                    action_counts[act] = action_counts.get(act, 0) + 1
                    r = c.get("reason")
                    if r and r != "No reason provided":
                        reasons.append(r)
                
                counts_str = ", ".join([f"{act.capitalize()}: {cnt}" for act, cnt in sorted(action_counts.items(), key=lambda x: x[1], reverse=True)])
                mod_history_summary = f"{len(recent_cases)} total logged actions ({counts_str}). Most frequent action types: {counts_str}. Sample reasons: {', '.join(reasons[:5]) if reasons else 'No reasons provided'}."
            else:
                mod_history_summary = "No recorded moderation cases or warnings found for this server."
        except Exception:
            mod_history_summary = "No recorded moderation cases or warnings found for this server."

        return f"""You are **Orbit AI Helper**, an intelligent Discord server co-pilot, analyst, and configuration assistant in the Orbit Dashboard.

CRITICAL INSTRUCTION - STRICT USER INTENT GATING (DO ONLY WHAT WAS ASKED):
- DO ONLY WHAT THE USER EXPLICITLY ASKS FOR. Never assume, configure, or volunteer unsolicited setup actions!
- INFORMATIONAL / ANALYTICAL / QUESTIONS:
  * When the user asks a question, checks moderation history, asks what the most common actions/reasons are, requests an audit or analytics, or asks how something works:
    -> Provide ONLY a direct, factual, well-structured answer in "reply" in English.
    -> "actions" MUST BE AN EMPTY ARRAY: `"actions": []`.
    -> DO NOT create or suggest unprompted actions (e.g. do NOT configure automod, do NOT deploy tickets, do NOT configure logs unless explicitly requested).
    -> DO NOT mention the "Build" button if no actions were requested.
- MODERATION HISTORY QUERIES:
  * When the user asks to check moderation history or what the most frequent actions/offenses are (e.g., "Check mal die Mod-History und sag mir, was die häufigsten Sachen sind"):
    -> Refer directly to the "Moderation History & Recent Actions" in SERVER CONTEXT.
    -> If actions are recorded: report the total volume, breakdown of action types (e.g. Warns, Timeouts, Bans), and top reasons clearly.
    -> If no actions are recorded: inform the user simply that no moderation cases or warnings are currently recorded on this server.
    -> ALWAYS leave `"actions": []` empty for history lookups!
- EXPLICIT ACTION COMMANDS ONLY:
  * ONLY populate the "actions" array when the user explicitly commands you to build, configure, setup, create, enable, disable, or modify a feature (e.g. "Create a giveaway for Nitro", "Setup ticket panel in #support", "Enable Anti-Spam", "Lock #general").
  * When executing an explicit user command, include the required action objects in "actions", and mention in "reply" that the user can review and click **Build** at the top right to apply the planned changes.
- STRICT GENERAL RULES:
  * You are NOT a server builder! Never delete existing server structures or wipe roles.
  * ALWAYS reply in English by default!
  * ALWAYS use real IDs from the SERVER CONTEXT below!

CORE CAPABILITIES:
1. SERVER OVERVIEW & ANALYTICS AUDIT:
   - When the user asks to analyze the server, check overview, inspect analytics, or audit server security:
     Deliver an organized report in English. If they specifically ask to optimize or build recommendations, then include actions; otherwise provide pure analysis with "actions": [].
2. CREATING & MANAGING SERVER FEATURES (When explicitly requested):
   - Create Giveaways: Deploy interactive giveaway messages to any channel via "create_giveaway".
   - Setup Support Ticket Panels: Deploy interactive ticket panels with dropdown categories to any channel via "create_ticket_panel".
   - Setup Verification: Deploy verification button panels with roles and security modes via "create_verification_panel".
   - Channel Permissions: Adjust channel permissions across all channels, categories, or specific channels via "channel_permissions".
   - Self-Assignable Roles: Deploy interactive button menus via "create_reaction_roles".
   - Full Module Configuration: Configure Welcome, Goodbye, Join Roles, AutoMod, Security (Anti-Raid/Anti-Nuke), Levels, Logs, TempVoice, and Invites.

SERVER CONTEXT:
- Server: {guild.name} (ID: {guild.id}, Total Members: {guild.member_count}, Boost Tier: {guild.premium_tier}, Boosts: {guild.premium_subscription_count})
- Recent 7-Day Activity: {stats_summary}
- Moderation History & Recent Actions: {mod_history_summary}
- Support Tickets: Enabled={ticket_cfg.get('enabled', False)}, Active Open={ticket_active_count}, Closed={ticket_closed_count}, Total Count={ticket_counter}, Panel={ticket_panel_ch}
- Giveaways: {gw_summary}
- Verification: {v_status}
- AutoMod: {', '.join(am_active) if am_active else 'Disabled'}
- Security: {', '.join(sec_active) if sec_active else 'Disabled'}
- Categories: {', '.join(cats) if cats else 'None'}
- Text Channels: {', '.join(txt_chs) if txt_chs else 'None'}
- Voice Channels: {', '.join(vc_chs) if vc_chs else 'None'}
- Roles: {', '.join(roles_list)}
- Active Modules: {', '.join(active_mods) if active_mods else 'None'}

SUPPORTED ACTIONS (include in the "actions" array):
1. create_giveaway: {{"type": "create_giveaway", "title": "Create Giveaway: <Prize> (<Winners> Winners, <Duration>)", "description": "Deploys an interactive giveaway message to #<channel>", "channel_id": "<channel_id>", "prize": "Discord Nitro", "winners": 1, "duration_seconds": 86400, "description_text": "Click the button to enter!", "required_role_id": "<optional_role_id>", "color": "#5865F2"}}
2. create_ticket_panel: {{"type": "create_ticket_panel", "title": "Deploy Ticket Support Panel", "description": "Posts interactive support panel with dropdown options to #<channel>", "channel_id": "<channel_id>", "category_id": "<category_id>", "support_role_ids": ["<role_id>"], "panel_title": "Support Desk", "panel_description": "Click the button or select an option to open a ticket.", "panel_instructions": "> Select a department from the dropdown to open your private channel.", "options_slots": [{{"name": "General Support", "emoji": "🎫", "description": "General assistance"}}, {{"name": "Billing & Orders", "emoji": "💳", "description": "Order inquiries"}}], "color": "#5865F2"}}
3. create_verification_panel: {{"type": "create_verification_panel", "title": "Setup Verification in #<channel>", "description": "Deploys an interactive verification panel assigning verified role", "channel_id": "<channel_id>", "role_id": "<role_id>", "remove_role_id": "<optional_role_id>", "verification_type": "captcha"|"oneclick"|"questionnaire", "embed_title": "Server Verification", "embed_description": "Click the button below to verify your account and gain access.", "button_label": "Verify Account", "button_style": "success", "color": "#22C55E"}}
4. create_reaction_roles: {{"type": "create_reaction_roles", "title": "Deploy Reaction Role Menu in #<channel>", "description": "Posts self-assignable role buttons in #<channel>", "channel_id": "<channel_id>", "embed_title": "Self Roles", "embed_description": "Click buttons below to toggle your roles.", "roles": [{{"role_id": "<role_id>", "label": "Updates", "emoji": "📢", "style": "primary"}}], "color": "#5865F2"}}
5. channel_permissions: {{"type": "channel_permissions", "title": "...", "description": "...", "role_id": "...", "role_name": "...", "target_scope": "all"|"category"|"channels", "channel_type": "all"|"text"|"voice", "channel_ids": [], "category_ids": [], "exclude_channel_ids": [], "permissions": {{"view_channel": true|false|null, "send_messages": true|false|null, "read_message_history": true|false|null, "connect": true|false|null, "speak": true|false|null}}}}
6. configure_welcome: {{"type": "configure_welcome", "title": "...", "description": "...", "settings": {{"enabled": true, "channel_id": "...", "msg_mode": "embed", "message": "...", "embed_title": "...", "embed_description": "...", "embed_color": "#5865F2"}}}}
7. configure_goodbye: {{"type": "configure_goodbye", "title": "...", "description": "...", "settings": {{"enabled": true, "channel_id": "...", "msg_mode": "embed", "message": "...", "embed_title": "...", "embed_description": "...", "embed_color": "#ED4245"}}}}
8. configure_joinroles: {{"type": "configure_joinroles", "title": "...", "description": "...", "settings": {{"enabled": true, "roles": ["<role-id>"]}}}}
9. configure_verify: {{"type": "configure_verify", "title": "...", "description": "...", "settings": {{"enabled": true, "channel_id": "...", "role_id": "...", "embed_title": "...", "embed_description": "...", "embed_color": "#57F287"}}}}
10. configure_tickets: {{"type": "configure_tickets", "title": "...", "description": "...", "settings": {{"enabled": true, "channel_id": "...", "category_id": "...", "log_channel_id": "...", "supporter_role_ids": ["..."], "embed_title": "...", "embed_description": "..."}}}}
11. configure_automod: {{"type": "configure_automod", "title": "...", "description": "...", "settings": {{"enabled": true, "banned_words": {{"enabled": true, "action": "warn"}}, "anti_spam": {{"enabled": true, "max_messages": 5, "time_window_sec": 3, "action": "warn"}}, "anti_link": {{"enabled": true, "action": "warn"}}, "anti_invites": {{"enabled": true, "action": "warn"}}, "anti_alt": {{"enabled": true, "min_age_days": 3, "action": "kick"}}, "ai_automod": {{"enabled": true, "action": "delete"}}}}}}
12. configure_security: {{"type": "configure_security", "title": "...", "description": "...", "settings": {{"anti_raid": {{"enabled": true, "join_threshold": 10, "time_window": 10, "action": "kick"}}, "anti_nuke": {{"enabled": true, "action": "strip_roles"}}}}}}
13. configure_level: {{"type": "configure_level", "title": "...", "description": "...", "settings": {{"enabled": true, "announce_channel_id": "...", "xp_per_message": 15, "xp_cooldown": 60, "level_up_message": "GG {{user}}, Level {{level}}!"}}}}
14. configure_logs: {{"type": "configure_logs", "title": "...", "description": "...", "settings": {{"enabled": true, "default_channel_id": "..."}}}}
15. configure_tempvoice: {{"type": "configure_tempvoice", "title": "...", "description": "...", "settings": {{"enabled": true, "trigger_channel_id": "...", "category_id": "...", "default_name": "🔊 {{user}}'s Channel", "default_limit": 0}}}}
16. configure_invites: {{"type": "configure_invites", "title": "...", "description": "...", "settings": {{"enabled": true, "track_leaves": true, "count_rejoins": false}}}}
17. send_message: {{"type": "send_message", "title": "...", "description": "...", "channel_id": "...", "embed_title": "...", "embed_description": "...", "embed_color": "#5865F2"}}

RESPONSE FORMAT (STRICTLY PURE JSON):
Always respond exclusively with a valid JSON object in English:
```json
{{
  "reply": "Clear, concise response to the user in English (Markdown allowed). If executable actions are present, mention that they can click **Build** at the top right to apply them. If no actions are present, simply answer the inquiry without mentioning the Build button.",
  "actions": []
}}
```
NOTE ON ACTIONS:
- If the user asked a question, requested moderation history, asked for an explanation, or requested an audit/overview, "actions" MUST BE `[]`.
- Only populate "actions" if the user explicitly commanded to create, build, setup, configure, change, enable, or disable something!
ALWAYS use real IDs from the server context above!"""

    async def api_ai_helper_get_chats(self, request: web.Request):
        guild_id_str = request.match_info.get("id", "")
        if not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild ID"}, status=400)
        guild_id = int(guild_id_str)

        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild:
            return web.json_response({"error": "Unauthorized"}, status=403)

        chats = self._load_guild_chats(guild_id)
        history = _MEM_ACTION_HISTORY.get(guild_id, [])
        can_undo = len(_MEM_UNDO_STACK.get(guild_id, [])) > 0
        can_redo = len(_MEM_REDO_STACK.get(guild_id, [])) > 0

        return web.json_response({
            "chats": chats,
            "action_history": history[:30],
            "can_undo": can_undo,
            "can_redo": can_redo
        })

    async def api_ai_helper_delete_chat(self, request: web.Request):
        guild_id_str = request.match_info.get("id", "")
        chat_id = request.match_info.get("chat_id", "")
        if not guild_id_str.isdigit() or not chat_id:
            return web.json_response({"error": "Invalid parameters"}, status=400)
        guild_id = int(guild_id_str)

        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild:
            return web.json_response({"error": "Unauthorized"}, status=403)

        if chat_id == "all":
            chats = []
        else:
            chats = self._load_guild_chats(guild_id)
            chats = [c for c in chats if c.get("id") != chat_id]
        self._save_guild_chats(guild_id, chats)
        return web.json_response({"success": True, "chats": chats})

    async def api_ai_helper_rename_chat(self, request: web.Request):
        guild_id_str = request.match_info.get("id", "")
        chat_id = request.match_info.get("chat_id", "")
        if not guild_id_str.isdigit() or not chat_id:
            return web.json_response({"error": "Invalid parameters"}, status=400)
        guild_id = int(guild_id_str)

        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild:
            return web.json_response({"error": "Unauthorized"}, status=403)

        try:
            body = await request.json()
        except Exception:
            return web.json_response({"error": "Invalid JSON"}, status=400)

        new_title = str(body.get("title") or "").strip()[:80]
        if not new_title:
            return web.json_response({"error": "Empty title"}, status=400)

        chats = self._load_guild_chats(guild_id)
        for c in chats:
            if str(c.get("id")) == str(chat_id):
                c["title"] = new_title
                c["updated_at"] = time.time()
                break
        self._save_guild_chats(guild_id, chats)
        return web.json_response({"success": True, "chats": chats})

    async def api_ai_helper_chat(self, request: web.Request):
        guild_id_str = request.match_info.get("id", "")
        if not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild ID"}, status=400)
        guild_id = int(guild_id_str)

        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild:
            return web.json_response({"error": "Unauthorized"}, status=403)

        try:
            body = await request.json()
        except Exception:
            return web.json_response({"error": "Invalid JSON"}, status=400)

        user_message = str(body.get("message") or "").strip()
        raw_attachments = body.get("attachments") if isinstance(body.get("attachments"), list) else []

        # Sanitize attachments
        image_attachments = []
        file_attachments = []
        stored_attachments = []

        for att in raw_attachments[:5]:
            if not isinstance(att, dict):
                continue
            att_type = str(att.get("type") or "").lower()
            att_name = str(att.get("name") or "Anhang")[:120]
            if att_type == "image" and str(att.get("dataUrl") or "").startswith("data:image/"):
                data_url = str(att["dataUrl"])
                image_attachments.append({"name": att_name, "dataUrl": data_url})
                stored_attachments.append({"type": "image", "name": att_name, "dataUrl": data_url})
            elif att_type == "file" and att.get("textContent"):
                txt_content = str(att.get("textContent") or "")[:15000]
                file_attachments.append({"name": att_name, "textContent": txt_content})
                stored_attachments.append({
                    "type": "file",
                    "name": att_name,
                    "size": len(txt_content)
                })

        if not user_message and (image_attachments or file_attachments):
            user_message = "Analyze the uploaded content and provide suggestions or suitable configurations for this server."

        if not user_message:
            return web.json_response({"error": "Empty message"}, status=400)

        chat_id = str(body.get("chat_id") or "").strip()
        requested_model = str(body.get("model") or "").strip()

        chats = self._load_guild_chats(guild_id)
        current_chat = None
        if chat_id:
            current_chat = next((c for c in chats if c.get("id") == chat_id), None)

        if not current_chat:
            chat_id = secrets.token_hex(8)
            title = user_message[:42] + ("…" if len(user_message) > 42 else "")
            current_chat = {
                "id": chat_id,
                "title": title,
                "created_at": time.time(),
                "updated_at": time.time(),
                "messages": []
            }
            chats.insert(0, current_chat)

        # Build message history for LLM with compact context
        system_prompt = self._build_guild_context_prompt(guild)
        llm_messages: List[Dict[str, Any]] = [{"role": "system", "content": system_prompt}]
        for msg in current_chat.get("messages", [])[-6:]:
            role = "assistant" if msg.get("role") == "assistant" else "user"
            content = str(msg.get("content") or "").strip()
            if role == "assistant" and msg.get("actions"):
                act_titles = [f"[{a.get('type')}: {a.get('title') or a.get('type')}]" for a in msg.get("actions", []) if isinstance(a, dict)]
                if act_titles:
                    content = f"{content}\n(Planned actions: {', '.join(act_titles[:4])})"
            llm_messages.append({"role": role, "content": content[:1200]})

        # Augment user prompt with uploaded file contents if any
        augmented_prompt = user_message
        if file_attachments:
            file_blocks = []
            for fatt in file_attachments[:4]:
                txt_snippet = str(fatt.get("textContent") or "")[:1500]
                file_blocks.append(f"\n--- DATEI: {fatt.get('name', 'file')} ---\n{txt_snippet}\n--- ENDE DATEI ---")
            augmented_prompt = f"{user_message}\n\nAttached files for analysis:{''.join(file_blocks)}"

        has_images = len(image_attachments) > 0
        if has_images:
            vision_parts: List[Dict[str, Any]] = [
                {
                    "type": "text",
                    "text": (
                        f"{system_prompt}\n\n"
                        f"USER REQUEST REGARDING THE IMAGE:\n{augmented_prompt}\n\n"
                        f"IMPORTANT: Respond exclusively as a valid JSON object in English with \"reply\" and \"actions\"!"
                    )
                }
            ]
            for img in image_attachments[:3]:
                vision_parts.append({
                    "type": "image_url",
                    "image_url": {"url": img["dataUrl"]}
                })
            vision_messages = [{"role": "user", "content": vision_parts}]
        else:
            llm_messages.append({"role": "user", "content": augmented_prompt})
            vision_messages = []

        groq_key = _get_groq_api_key()
        raw_ai_output = None

        if groq_key:
            try:
                async with aiohttp.ClientSession() as session:
                    if has_images:
                        models_to_try = await _resolve_groq_models(session, groq_key, need_vision=True)
                        req_messages = vision_messages
                    else:
                        available_models = await _resolve_groq_models(session, groq_key, need_vision=False)
                        # Always guarantee high-capacity fallback models (30,000 TPM)
                        for fb in ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"]:
                            if fb not in available_models:
                                available_models.append(fb)

                        if requested_model and requested_model in available_models:
                            models_to_try = [requested_model] + [m for m in available_models if m != requested_model]
                        else:
                            models_to_try = available_models
                        req_messages = llm_messages

                    current_max_tokens = 4096
                    for model_name in models_to_try:
                        try:
                            payload = {
                                "model": model_name,
                                "messages": req_messages,
                                "temperature": 0.4,
                                "max_tokens": current_max_tokens,
                            }
                            headers = {
                                "Content-Type": "application/json",
                                "Authorization": f"Bearer {groq_key}",
                            }
                            async with session.post(
                                "https://api.groq.com/openai/v1/chat/completions",
                                json=payload,
                                headers=headers,
                                timeout=aiohttp.ClientTimeout(total=30.0),
                            ) as resp:
                                if resp.status == 200:
                                    data = await resp.json()
                                    content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                                    if content and content.strip():
                                        raw_ai_output = content.strip()
                                        break
                                else:
                                    err_txt = await resp.text()
                                    print(f"[AIHelper] Groq model {model_name} returned {resp.status}: {err_txt[:200]}")
                                    if resp.status == 413:
                                        current_max_tokens = min(current_max_tokens, 2048)
                        except Exception as req_err:
                            print(f"[AIHelper] Groq request error ({model_name}): {req_err}")
                            continue
            except Exception as e:
                print(f"[AIHelper] Session error: {e}")

        if not raw_ai_output:
            raw_ai_output = json.dumps({
                "reply": "Sorry, the AI service is currently busy or the API key is missing. Please try again in a few seconds.",
                "actions": []
            })

        parsed = _extract_json_payload(raw_ai_output)
        reply_text = str(parsed.get("reply") or "I have analyzed your request.").strip()
        if reply_text.startswith("{") and '"reply"' in reply_text:
            try:
                inner = json.loads(reply_text)
                if isinstance(inner, dict) and "reply" in inner:
                    reply_text = str(inner.get("reply") or reply_text).strip()
            except Exception:
                pass
        raw_actions = parsed.get("actions")
        if not isinstance(raw_actions, list):
            raw_actions = []

        # Sanitize and assign IDs to actions
        clean_actions = []
        allowed_types = {
            "channel_permissions",
            "configure_welcome",
            "configure_goodbye",
            "configure_joinroles",
            "configure_verify",
            "configure_tickets",
            "configure_automod",
            "configure_security",
            "configure_level",
            "configure_logs",
            "configure_tempvoice",
            "configure_invites",
            "edit_channel",
            "edit_role",
            "create_giveaway",
            "create_ticket_panel",
            "create_verification_panel",
            "create_reaction_roles",
            "send_message",
        }
        for act in raw_actions:
            if not isinstance(act, dict):
                continue
            atype = str(act.get("type") or "").strip()
            if atype not in allowed_types:
                continue
            act["id"] = act.get("id") or secrets.token_hex(6)
            clean_actions.append(act)

        # Safety Intent Gating: If the user asked a question, requested history/cases/stats,
        # or asked for information without an explicit command to build/configure/create,
        # discard any hallucinated actions so the bot strictly does only what it was asked to do.
        msg_lower = user_message.lower()
        action_intent_words = [
            "create", "build", "setup", "set up", "configure", "apply", "enable", "disable",
            "turn on", "turn off", "lock", "unlock", "delete", "remove", "add", "deploy", "update",
            "erstelle", "erstell", "bau", "bauen", "einrichten", "richte ein", "konfigurieren", "konfiguriere",
            "aktiviere", "aktivier", "deaktiviere", "schalte ein", "schalte aus", "sperre", "entsperre", "lösche", "entferne", "setze", "änder", "ändere"
        ]
        has_action_intent = any(w in msg_lower for w in action_intent_words)
        is_query_intent = any(w in msg_lower for w in [
            "check", "history", "cases", "offenses", "häufigsten", "warum", "wer", "was ist", "was sind",
            "what is", "what are", "how many", "show me", "tell me", "sag mir", "zeige", "erklär", "explain"
        ])
        if is_query_intent and not has_action_intent:
            clean_actions = []

        now_ts = time.time()
        user_msg_entry: Dict[str, Any] = {
            "id": secrets.token_hex(6),
            "role": "user",
            "content": user_message,
            "timestamp": now_ts
        }
        if stored_attachments:
            user_msg_entry["attachments"] = stored_attachments

        current_chat["messages"].append(user_msg_entry)
        current_chat["messages"].append({
            "id": secrets.token_hex(6),
            "role": "assistant",
            "content": reply_text,
            "actions": clean_actions,
            "timestamp": now_ts
        })
        current_chat["updated_at"] = now_ts

        # Move current_chat to top and persist
        chats = [current_chat] + [c for c in chats if c.get("id") != chat_id]
        self._save_guild_chats(guild_id, chats)

        return web.json_response({
            "chat_id": chat_id,
            "reply": reply_text,
            "actions": clean_actions,
            "chat": current_chat,
            "chats": chats
        })

    async def _execute_actions_list(self, guild: discord.Guild, actions: List[Dict[str, Any]]) -> Dict[str, Any]:
        guild_id = guild.id
        applied_summaries = []
        errors = []
        undo_entries = []

        for act in actions:
            atype = str(act.get("type") or "")
            title = str(act.get("title") or atype)
            try:
                if atype == "channel_permissions":
                    role_obj = None
                    role_id_raw = str(act.get("role_id") or "").strip()
                    role_name_raw = str(act.get("role_name") or "").strip()

                    if role_id_raw and role_id_raw.isdigit():
                        role_obj = guild.get_role(int(role_id_raw))
                    if not role_obj and role_name_raw:
                        rn_clean = role_name_raw.lstrip("@").strip().lower()
                        if rn_clean in ("everyone", "@everyone"):
                            role_obj = guild.default_role
                        else:
                            role_obj = next(
                                (r for r in guild.roles if r.name.lower() == rn_clean),
                                None
                            )
                            if not role_obj:
                                role_obj = next(
                                    (r for r in guild.roles if rn_clean in r.name.lower()),
                                    None
                                )

                    if not role_obj:
                        errors.append(f"Role '{role_name_raw or role_id_raw}' was not found on the server.")
                        continue

                    scope = str(act.get("target_scope") or "all").lower()
                    ch_type = str(act.get("channel_type") or "all").lower()

                    if ch_type == "text":
                        candidate_channels = list(guild.text_channels)
                    elif ch_type == "voice":
                        candidate_channels = list(guild.voice_channels)
                    else:
                        candidate_channels = list(guild.text_channels) + list(guild.voice_channels)

                    target_channels = []
                    if scope == "all":
                        target_channels = candidate_channels
                    elif scope == "category":
                        cat_ids = {str(x).strip() for x in (act.get("category_ids") or []) if x}
                        cat_names = {str(x).strip().lower() for x in (act.get("category_names") or []) if x}
                        for ch in candidate_channels:
                            if ch.category:
                                if str(ch.category.id) in cat_ids or ch.category.name.lower() in cat_names:
                                    target_channels.append(ch)
                    elif scope == "channels":
                        ch_ids = {str(x).strip() for x in (act.get("channel_ids") or []) if x}
                        ch_names = {str(x).lstrip("#").strip().lower() for x in (act.get("channel_names") or []) if x}
                        for ch in candidate_channels:
                            if str(ch.id) in ch_ids or ch.name.lower() in ch_names:
                                target_channels.append(ch)
                    else:
                        target_channels = candidate_channels

                    excl_ids = {str(x).strip() for x in (act.get("exclude_channel_ids") or []) if x}
                    excl_names = {str(x).lstrip("#").strip().lower() for x in (act.get("exclude_channel_names") or []) if x}
                    if excl_ids or excl_names:
                        target_channels = [
                            ch for ch in target_channels
                            if str(ch.id) not in excl_ids and ch.name.lower() not in excl_names
                        ]

                    perms_dict = act.get("permissions") or {}
                    clean_perms = {
                        k: (bool(v) if v is not None else None)
                        for k, v in perms_dict.items()
                        if k in SUPPORTED_PERMISSIONS
                    }

                    if not clean_perms:
                        errors.append(f"No valid permissions specified for '{title}'.")
                        continue

                    prev_overwrites = []
                    updated_ch_count = 0
                    for ch in target_channels:
                        try:
                            current_ow = ch.overwrites_for(role_obj)
                            prev_map = {}
                            for pk in clean_perms.keys():
                                prev_map[pk] = getattr(current_ow, pk, None)
                                setattr(current_ow, pk, clean_perms[pk])
                            await ch.set_permissions(role_obj, overwrite=current_ow, reason="Orbit AI Helper")
                            prev_overwrites.append({
                                "channel_id": ch.id,
                                "role_id": role_obj.id,
                                "permissions": prev_map
                            })
                            updated_ch_count += 1
                        except Exception as ch_err:
                            print(f"[AIHelper] Failed set_permissions on #{ch.name}: {ch_err}")

                    undo_entries.append({
                        "type": "revert_channel_permissions",
                        "overwrites": prev_overwrites
                    })
                    applied_summaries.append(f"{title} ({updated_ch_count} channels updated)")

                elif atype == "configure_welcome":
                    prev_cfg = load_welcome_config(guild_id)
                    undo_entries.append({"type": "restore_config", "module": "welcome", "data": dict(prev_cfg)})
                    new_cfg = dict(prev_cfg)
                    settings = act.get("settings") or {}
                    for k, v in settings.items():
                        new_cfg[k] = v
                    save_welcome_config(guild_id, new_cfg)
                    applied_summaries.append(title)

                elif atype == "configure_goodbye":
                    prev_cfg = load_goodbye_config(guild_id)
                    undo_entries.append({"type": "restore_config", "module": "goodbye", "data": dict(prev_cfg)})
                    new_cfg = dict(prev_cfg)
                    settings = act.get("settings") or {}
                    for k, v in settings.items():
                        new_cfg[k] = v
                    save_goodbye_config(guild_id, new_cfg)
                    applied_summaries.append(title)

                elif atype == "configure_joinroles":
                    prev_cfg = load_join_roles(guild_id)
                    undo_entries.append({"type": "restore_config", "module": "joinroles", "data": dict(prev_cfg)})
                    new_cfg = dict(prev_cfg)
                    settings = act.get("settings") or {}
                    for k, v in settings.items():
                        new_cfg[k] = v
                    save_join_roles(guild_id, new_cfg)
                    applied_summaries.append(title)

                elif atype == "configure_verify":
                    prev_cfg = load_verify_config(guild_id)
                    undo_entries.append({"type": "restore_config", "module": "verify", "data": dict(prev_cfg)})
                    new_cfg = dict(prev_cfg)
                    settings = act.get("settings") or {}
                    for k, v in settings.items():
                        new_cfg[k] = v
                    save_verify_config(guild_id, new_cfg)
                    applied_summaries.append(title)

                elif atype == "configure_tickets":
                    prev_cfg = load_ticket_config(guild_id)
                    undo_entries.append({"type": "restore_config", "module": "tickets", "data": dict(prev_cfg)})
                    new_cfg = dict(prev_cfg)
                    settings = act.get("settings") or {}
                    for k, v in settings.items():
                        new_cfg[k] = v
                    save_ticket_config(guild_id, new_cfg)
                    applied_summaries.append(title)

                elif atype == "configure_automod":
                    prev_cfg = load_automod_config(guild_id)
                    undo_entries.append({"type": "restore_config", "module": "automod", "data": json.loads(json.dumps(prev_cfg))})
                    new_cfg = json.loads(json.dumps(prev_cfg))
                    settings = act.get("settings") or {}
                    for k, v in settings.items():
                        if isinstance(v, dict) and isinstance(new_cfg.get(k), dict):
                            new_cfg[k].update(v)
                        else:
                            new_cfg[k] = v
                    save_automod_config(guild_id, new_cfg)
                    applied_summaries.append(title)

                elif atype == "configure_security":
                    prev_cfg = load_security_config(guild_id)
                    undo_entries.append({"type": "restore_config", "module": "security", "data": json.loads(json.dumps(prev_cfg))})
                    new_cfg = json.loads(json.dumps(prev_cfg))
                    settings = act.get("settings") or {}
                    for k, v in settings.items():
                        if isinstance(v, dict) and isinstance(new_cfg.get(k), dict):
                            new_cfg[k].update(v)
                        else:
                            new_cfg[k] = v
                    save_security_config(guild_id, new_cfg)
                    applied_summaries.append(title)

                elif atype == "configure_level":
                    prev_cfg = load_level_config(guild_id)
                    undo_entries.append({"type": "restore_config", "module": "level", "data": dict(prev_cfg)})
                    new_cfg = dict(prev_cfg)
                    settings = act.get("settings") or {}
                    for k, v in settings.items():
                        new_cfg[k] = v
                    save_level_config(guild_id, new_cfg)
                    applied_summaries.append(title)

                elif atype == "configure_logs":
                    prev_cfg = load_log_config(guild_id)
                    undo_entries.append({"type": "restore_config", "module": "logs", "data": dict(prev_cfg)})
                    new_cfg = dict(prev_cfg)
                    settings = act.get("settings") or {}
                    for k, v in settings.items():
                        new_cfg[k] = v
                    save_log_config(guild_id, new_cfg)
                    applied_summaries.append(title)

                elif atype == "configure_tempvoice":
                    prev_cfg = load_jtc_config(guild_id)
                    undo_entries.append({"type": "restore_config", "module": "tempvoice", "data": dict(prev_cfg)})
                    new_cfg = dict(prev_cfg)
                    settings = act.get("settings") or {}
                    for k, v in settings.items():
                        new_cfg[k] = v
                    save_jtc_config(guild_id, new_cfg)
                    applied_summaries.append(title)

                elif atype == "configure_invites":
                    from Components.Database.mongodb import get_config, set_config
                    prev_cfg = get_config("InviteConfig", guild_id) or {}
                    undo_entries.append({"type": "restore_config", "module": "invites", "data": dict(prev_cfg)})
                    new_cfg = dict(prev_cfg)
                    settings = act.get("settings") or {}
                    for k, v in settings.items():
                        new_cfg[k] = v
                    set_config("InviteConfig", guild_id, new_cfg)
                    applied_summaries.append(title)

                elif atype == "edit_channel":
                    ch_id = str(act.get("channel_id") or "").strip()
                    ch = guild.get_channel(int(ch_id)) if ch_id.isdigit() else None
                    if ch:
                        settings = act.get("settings") or {}
                        edit_kwargs = {}
                        if "name" in settings and settings["name"]:
                            edit_kwargs["name"] = str(settings["name"])[:100]
                        if "topic" in settings and hasattr(ch, "topic"):
                            edit_kwargs["topic"] = str(settings["topic"])[:1024]
                        if "slowmode_delay" in settings and hasattr(ch, "slowmode_delay"):
                            edit_kwargs["slowmode_delay"] = max(0, min(21600, int(settings["slowmode_delay"])))
                        if edit_kwargs:
                            await ch.edit(**edit_kwargs, reason="Orbit AI Helper")
                            applied_summaries.append(title)

                elif atype == "edit_role":
                    r_id = str(act.get("role_id") or "").strip()
                    role = guild.get_role(int(r_id)) if r_id.isdigit() else None
                    if role:
                        settings = act.get("settings") or {}
                        edit_kwargs = {}
                        if "name" in settings and settings["name"]:
                            edit_kwargs["name"] = str(settings["name"])[:100]
                        if "hoist" in settings:
                            edit_kwargs["hoist"] = bool(settings["hoist"])
                        if "mentionable" in settings:
                            edit_kwargs["mentionable"] = bool(settings["mentionable"])
                        if edit_kwargs:
                            await role.edit(**edit_kwargs, reason="Orbit AI Helper")
                            applied_summaries.append(title)

                elif atype == "create_giveaway":
                    from Components.Commands.Giveaway._storage import generate_giveaway_id, save_giveaways, load_giveaways
                    from Components.Commands.Giveaway.giveaway import send_giveaway_message

                    ch_id_raw = str(act.get("channel_id") or "").strip()
                    channel = guild.get_channel(int(ch_id_raw)) if ch_id_raw.isdigit() else None
                    if not channel and act.get("channel_name"):
                        cn = str(act.get("channel_name")).lstrip("#").strip().lower()
                        channel = discord.utils.get(guild.text_channels, name=cn)
                    if not channel:
                        errors.append(f"Giveaway channel '{ch_id_raw or act.get('channel_name')}' not found on server.")
                        continue

                    prize = str(act.get("prize") or "Special Giveaway Prize").strip()[:100]
                    winners = max(1, min(100, int(act.get("winners") or act.get("winners_count") or 1)))
                    duration_sec = int(act.get("duration_seconds") or 86400)
                    if duration_sec < 10:
                        duration_sec = 60
                    if duration_sec > 86400 * 30:
                        duration_sec = 86400 * 30

                    now_ts = int(time.time())
                    end_time = now_ts + duration_sec
                    gw_id = generate_giveaway_id(guild_id)

                    color_val = 0x5865F2
                    c_raw = act.get("color") or act.get("embed_color")
                    if c_raw:
                        try:
                            if isinstance(c_raw, str) and c_raw.startswith("#"):
                                color_val = int(c_raw.lstrip("#"), 16)
                            elif isinstance(c_raw, int):
                                color_val = c_raw
                        except Exception:
                            pass

                    req_role_id = act.get("required_role_id")
                    req_role_int = int(req_role_id) if req_role_id and str(req_role_id).isdigit() else None

                    entry = {
                        "giveaway_id": gw_id,
                        "channel_id": channel.id,
                        "message_id": 0,
                        "prize": prize,
                        "description": str(act.get("description_text") or act.get("description") or "Click the button below to participate!"),
                        "winners": winners,
                        "winners_count": winners,
                        "end_timestamp": end_time,
                        "entries": [],
                        "ended": False,
                        "draft": False,
                        "author_id": 0,
                        "required_role_id": req_role_int,
                        "color": color_val,
                        "created_at": now_ts
                    }

                    try:
                        msg = await send_giveaway_message(channel, entry, guild_id)
                        if msg:
                            entry["message_id"] = msg.id
                            entry["channel_id"] = msg.channel.id
                    except Exception as gw_err:
                        errors.append(f"Failed to post giveaway message: {gw_err}")
                        continue

                    gw_data = load_giveaways(guild_id) or {}
                    gw_data[gw_id] = entry
                    save_giveaways(guild_id, gw_data)

                    undo_entries.append({
                        "type": "delete_giveaway",
                        "giveaway_id": gw_id,
                        "channel_id": channel.id,
                        "message_id": entry.get("message_id")
                    })
                    applied_summaries.append(f"Giveaway '{prize}' posted in #{channel.name}")

                elif atype == "create_ticket_panel":
                    from Components.Systems.Tickets._views import PersistentTicketPanelLayout
                    from Components.Systems.Tickets._storage import load_ticket_config, save_ticket_config

                    ticket_cfg = load_ticket_config(guild_id)
                    undo_entries.append({"type": "restore_config", "module": "tickets", "data": json.loads(json.dumps(ticket_cfg))})

                    ch_id_raw = str(act.get("channel_id") or ticket_cfg.get("panel_channel_id") or "").strip()
                    channel = guild.get_channel(int(ch_id_raw)) if ch_id_raw.isdigit() else None
                    if not channel and act.get("channel_name"):
                        cn = str(act.get("channel_name")).lstrip("#").strip().lower()
                        channel = discord.utils.get(guild.text_channels, name=cn)
                    if not channel:
                        errors.append(f"Ticket channel '{ch_id_raw or act.get('channel_name')}' not found.")
                        continue

                    cat_id_raw = str(act.get("category_id") or ticket_cfg.get("category_id") or "").strip()
                    if cat_id_raw and cat_id_raw.isdigit():
                        ticket_cfg["category_id"] = int(cat_id_raw)

                    sup_roles = act.get("support_role_ids") or []
                    if sup_roles and str(sup_roles[0]).isdigit():
                        ticket_cfg["support_role_id"] = int(sup_roles[0])

                    p_title = str(act.get("panel_title") or "Support Ticket Desk")
                    p_desc = str(act.get("panel_description") or "Click the button below to open a direct support channel with our team.")
                    p_instr = str(act.get("panel_instructions") or "> Select your inquiry category from the menu below, then click **Create Ticket**.")

                    opts = act.get("options_slots") or [
                        {"name": "General Support", "emoji": "🎫", "description": "General questions and assistance"},
                        {"name": "Billing & Orders", "emoji": "💳", "description": "Order inquiries and payment issues"}
                    ]

                    p_color = 0x5865F2
                    c_raw = act.get("color") or act.get("embed_color")
                    if c_raw:
                        try:
                            if isinstance(c_raw, str) and c_raw.startswith("#"):
                                p_color = int(c_raw.lstrip("#"), 16)
                        except Exception:
                            pass

                    view = PersistentTicketPanelLayout(
                        title=p_title,
                        description=p_desc,
                        instructions=p_instr,
                        options_slots=opts
                    )
                    desc_text = f"{view.panel_desc}\n\n{view.panel_instructions}" if view.panel_instructions else view.panel_desc
                    embed = discord.Embed(
                        title=view.panel_title,
                        description=desc_text,
                        color=p_color
                    )
                    msg = await channel.send(embed=embed, view=view, allowed_mentions=discord.AllowedMentions.none())

                    ticket_cfg["enabled"] = True
                    ticket_cfg["panel_channel_id"] = channel.id
                    ticket_cfg["panel_message_id"] = msg.id
                    ticket_cfg["panel_title"] = p_title
                    ticket_cfg["panel_description"] = p_desc
                    ticket_cfg["panel_instructions"] = p_instr
                    ticket_cfg["options_slots"] = opts
                    ticket_cfg["options"] = [s.get("name", "Support") if isinstance(s, dict) else str(s) for s in opts]
                    save_ticket_config(guild_id, ticket_cfg)
                    applied_summaries.append(f"Ticket Support Panel posted in #{channel.name}")

                elif atype == "create_verification_panel":
                    from Components.Systems.Verify._storage import load_verify_config, save_verify_config

                    verify_cfg = load_verify_config(guild_id)
                    undo_entries.append({"type": "restore_config", "module": "verify", "data": json.loads(json.dumps(verify_cfg))})

                    ch_id_raw = str(act.get("channel_id") or verify_cfg.get("channel_id") or "").strip()
                    channel = guild.get_channel(int(ch_id_raw)) if ch_id_raw.isdigit() else None
                    if not channel and act.get("channel_name"):
                        cn = str(act.get("channel_name")).lstrip("#").strip().lower()
                        channel = discord.utils.get(guild.text_channels, name=cn)
                    if not channel:
                        errors.append(f"Verification channel '{ch_id_raw or act.get('channel_name')}' not found.")
                        continue

                    role_id_raw = str(act.get("role_id") or verify_cfg.get("role_id") or "").strip()
                    role_obj = guild.get_role(int(role_id_raw)) if role_id_raw.isdigit() else None
                    if not role_obj:
                        r_name = str(act.get("role_name") or "Verified").strip()
                        role_obj = discord.utils.get(guild.roles, name=r_name)
                        if not role_obj:
                            try:
                                role_obj = await guild.create_role(name=r_name, color=discord.Color.green(), reason="Orbit Verification Setup")
                            except Exception:
                                pass

                    if not role_obj:
                        errors.append("Verified role could not be resolved or created.")
                        continue

                    sys_id = secrets.token_hex(4)
                    vtype = str(act.get("verification_type") or "captcha").lower()
                    btn_label = str(act.get("button_label") or "Verify").strip()[:80]
                    btn_style_str = str(act.get("button_style") or "success").lower()
                    style_map = {
                        "success": discord.ButtonStyle.success,
                        "primary": discord.ButtonStyle.primary,
                        "secondary": discord.ButtonStyle.secondary,
                        "danger": discord.ButtonStyle.danger
                    }
                    btn_style = style_map.get(btn_style_str, discord.ButtonStyle.success)

                    color_val = 0x22C55E
                    c_raw = act.get("color") or act.get("embed_color")
                    if c_raw:
                        try:
                            if isinstance(c_raw, str) and c_raw.startswith("#"):
                                color_val = int(c_raw.lstrip("#"), 16)
                        except Exception:
                            pass

                    embed = discord.Embed(
                        title=str(act.get("embed_title") or "Server Verification"),
                        description=str(act.get("embed_description") or "Please click the button below to verify your account and gain access to the server."),
                        color=color_val
                    )

                    view = discord.ui.View(timeout=None)
                    view.add_item(discord.ui.Button(label=btn_label, style=btn_style, custom_id=f"orbit:verify_start:{sys_id}"))
                    msg = await channel.send(embed=embed, view=view, allowed_mentions=discord.AllowedMentions.none())

                    verify_cfg["enabled"] = True
                    verify_cfg["channel_id"] = channel.id
                    verify_cfg["role_id"] = role_obj.id
                    rem_role_raw = str(act.get("remove_role_id") or "").strip()
                    if rem_role_raw and rem_role_raw.isdigit():
                        verify_cfg["remove_role_id"] = int(rem_role_raw)
                    verify_cfg["verification_type"] = vtype
                    verify_cfg["embed_title"] = embed.title
                    verify_cfg["embed_description"] = embed.description

                    systems = verify_cfg.get("systems") or []
                    systems.append({
                        "id": sys_id,
                        "name": embed.title,
                        "enabled": True,
                        "deployed": True,
                        "deployed_at": time.time(),
                        "message_id": str(msg.id),
                        "channel_id": str(channel.id),
                        "role_id": str(role_obj.id),
                        "verification_type": vtype,
                        "embed_title": embed.title,
                        "embed_description": embed.description,
                        "button_label": btn_label,
                        "button_style": btn_style_str
                    })
                    verify_cfg["systems"] = systems
                    save_verify_config(guild_id, verify_cfg)
                    applied_summaries.append(f"Verification Panel posted in #{channel.name}")

                elif atype == "create_reaction_roles":
                    ch_id_raw = str(act.get("channel_id") or "").strip()
                    channel = guild.get_channel(int(ch_id_raw)) if ch_id_raw.isdigit() else None
                    if not channel and act.get("channel_name"):
                        cn = str(act.get("channel_name")).lstrip("#").strip().lower()
                        channel = discord.utils.get(guild.text_channels, name=cn)
                    if not channel:
                        errors.append(f"Channel '{ch_id_raw or act.get('channel_name')}' not found.")
                        continue

                    color_val = 0x5865F2
                    c_raw = act.get("color") or act.get("embed_color")
                    if c_raw:
                        try:
                            if isinstance(c_raw, str) and c_raw.startswith("#"):
                                color_val = int(c_raw.lstrip("#"), 16)
                        except Exception:
                            pass

                    embed = discord.Embed(
                        title=str(act.get("embed_title") or "Self-Assignable Roles"),
                        description=str(act.get("embed_description") or "Click the buttons below to receive or remove roles."),
                        color=color_val
                    )

                    view = discord.ui.View(timeout=None)
                    role_items = act.get("roles") or []
                    added_btns = 0
                    for ri in role_items[:25]:
                        if not isinstance(ri, dict):
                            continue
                        r_id_str = str(ri.get("role_id") or "").strip()
                        r_obj = guild.get_role(int(r_id_str)) if r_id_str.isdigit() else None
                        if not r_obj and ri.get("name"):
                            r_obj = discord.utils.get(guild.roles, name=str(ri.get("name")).strip())
                        if not r_obj:
                            continue

                        lbl = str(ri.get("label") or r_obj.name)[:80]
                        emoji = ri.get("emoji")
                        view.add_item(discord.ui.Button(
                            label=lbl,
                            emoji=emoji if emoji else None,
                            style=discord.ButtonStyle.primary,
                            custom_id=f"orbit:role_toggle:{r_obj.id}"
                        ))
                        added_btns += 1

                    if added_btns == 0:
                        errors.append("No valid roles provided for reaction role menu.")
                        continue

                    msg = await channel.send(embed=embed, view=view, allowed_mentions=discord.AllowedMentions.none())
                    applied_summaries.append(f"Reaction Role Menu ({added_btns} roles) posted in #{channel.name}")

                elif atype == "send_message":
                    ch_id_raw = str(act.get("channel_id") or "").strip()
                    channel = guild.get_channel(int(ch_id_raw)) if ch_id_raw.isdigit() else None
                    if not channel and act.get("channel_name"):
                        cn = str(act.get("channel_name")).lstrip("#").strip().lower()
                        channel = discord.utils.get(guild.text_channels, name=cn)
                    if not channel:
                        errors.append(f"Channel '{ch_id_raw or act.get('channel_name')}' not found.")
                        continue

                    color_val = 0x5865F2
                    c_raw = act.get("color") or act.get("embed_color")
                    if c_raw:
                        try:
                            if isinstance(c_raw, str) and c_raw.startswith("#"):
                                color_val = int(c_raw.lstrip("#"), 16)
                        except Exception:
                            pass

                    title_text = str(act.get("embed_title") or act.get("title") or "").strip()
                    desc_text = str(act.get("embed_description") or act.get("content") or act.get("message") or "").strip()

                    if title_text or desc_text:
                        embed = discord.Embed(title=title_text or None, description=desc_text or None, color=color_val)
                        await channel.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())
                    else:
                        plain_msg = str(act.get("text") or act.get("content") or "Hello!")
                        await channel.send(plain_msg)

                    applied_summaries.append(f"Message sent to #{channel.name}")

            except Exception as act_err:
                errors.append(f"{title}: {act_err}")

        if undo_entries:
            _MEM_UNDO_STACK.setdefault(guild_id, []).append({
                "timestamp": time.time(),
                "actions": actions,
                "undo_entries": undo_entries,
                "summaries": applied_summaries
            })
            _MEM_REDO_STACK[guild_id] = []

        if applied_summaries:
            hist = _MEM_ACTION_HISTORY.setdefault(guild_id, [])
            for s in applied_summaries:
                hist.insert(0, {
                    "id": secrets.token_hex(4),
                    "title": s,
                    "timestamp": time.time()
                })
            self._save_guild_chats(guild_id, self._load_guild_chats(guild_id))

        return {
            "success": len(applied_summaries) > 0 or len(errors) == 0,
            "applied": applied_summaries,
            "errors": errors,
            "can_undo": len(_MEM_UNDO_STACK.get(guild_id, [])) > 0,
            "can_redo": len(_MEM_REDO_STACK.get(guild_id, [])) > 0,
            "action_history": _MEM_ACTION_HISTORY.get(guild_id, [])[:30]
        }

    async def api_ai_helper_apply(self, request: web.Request):
        guild_id_str = request.match_info.get("id", "")
        if not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild ID"}, status=400)
        guild_id = int(guild_id_str)

        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild:
            return web.json_response({"error": "Unauthorized"}, status=403)

        try:
            body = await request.json()
        except Exception:
            return web.json_response({"error": "Invalid JSON"}, status=400)

        actions = body.get("actions") or []
        if not isinstance(actions, list) or not actions:
            return web.json_response({"error": "No changes to apply."}, status=400)

        res = await self._execute_actions_list(guild, actions)
        return web.json_response(res)

    async def api_ai_helper_undo(self, request: web.Request):
        guild_id_str = request.match_info.get("id", "")
        if not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild ID"}, status=400)
        guild_id = int(guild_id_str)

        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild:
            return web.json_response({"error": "Unauthorized"}, status=403)

        stack = _MEM_UNDO_STACK.get(guild_id, [])
        if not stack:
            return web.json_response({"error": "Nothing to undo."}, status=400)

        last_batch = stack.pop()
        reverted = []
        for entry in reversed(last_batch.get("undo_entries", [])):
            etype = entry.get("type")
            try:
                if etype == "revert_channel_permissions":
                    for ow_item in entry.get("overwrites", []):
                        ch = guild.get_channel(int(ow_item["channel_id"]))
                        role = guild.get_role(int(ow_item["role_id"]))
                        if ch and role:
                            curr_ow = ch.overwrites_for(role)
                            for pk, pv in ow_item.get("permissions", {}).items():
                                setattr(curr_ow, pk, pv)
                            await ch.set_permissions(role, overwrite=curr_ow, reason="Orbit AI Helper Undo")
                    reverted.append("Channel permissions restored")
                elif etype == "delete_giveaway":
                    from Components.Commands.Giveaway._storage import load_giveaways, save_giveaways
                    gw_id = entry.get("giveaway_id")
                    gw_data = load_giveaways(guild_id) or {}
                    if gw_id in gw_data:
                        del gw_data[gw_id]
                        save_giveaways(guild_id, gw_data)
                    reverted.append(f"Giveaway {gw_id} removed")
                elif etype == "restore_config":
                    mod = entry.get("module")
                    data = entry.get("data", {})
                    if mod == "welcome":
                        save_welcome_config(guild_id, data)
                    elif mod == "goodbye":
                        save_goodbye_config(guild_id, data)
                    elif mod == "joinroles":
                        save_join_roles(guild_id, data)
                    elif mod == "verify":
                        save_verify_config(guild_id, data)
                    elif mod == "tickets":
                        save_ticket_config(guild_id, data)
                    elif mod == "automod":
                        save_automod_config(guild_id, data)
                    elif mod == "security":
                        save_security_config(guild_id, data)
                    elif mod == "level":
                        save_level_config(guild_id, data)
                    elif mod == "logs":
                        save_log_config(guild_id, data)
                    elif mod == "tempvoice":
                        save_jtc_config(guild_id, data)
                    elif mod == "invites":
                        from Components.Database.mongodb import set_config
                        set_config("InviteConfig", guild_id, data)
                    reverted.append(f"Module '{mod}' reverted")
            except Exception as e:
                print(f"[AIHelper] Undo error: {e}")

        _MEM_REDO_STACK.setdefault(guild_id, []).append(last_batch)
        return web.json_response({
            "success": True,
            "reverted": reverted,
            "can_undo": len(_MEM_UNDO_STACK.get(guild_id, [])) > 0,
            "can_redo": len(_MEM_REDO_STACK.get(guild_id, [])) > 0,
            "action_history": _MEM_ACTION_HISTORY.get(guild_id, [])[:30]
        })

    async def api_ai_helper_redo(self, request: web.Request):
        guild_id_str = request.match_info.get("id", "")
        if not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild ID"}, status=400)
        guild_id = int(guild_id_str)

        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild:
            return web.json_response({"error": "Unauthorized"}, status=403)

        redo_stack = _MEM_REDO_STACK.get(guild_id, [])
        if not redo_stack:
            return web.json_response({"error": "Nothing to redo."}, status=400)

        batch = redo_stack.pop()
        res = await self._execute_actions_list(guild, batch.get("actions", []))
        return web.json_response(res)
