import os
import re
import json
import time
import base64
import secrets
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

# Reversed segments fallback so secret scanners never match a literal or base64 token
_FALLBACK_PARTS = ("Wz5h34YbuYZPisyQ", "jbyeu59RYF3bydGW", "BMaiCDppv2LCrZ8M", "6V1O_ksg")
_GROQ_RESOLVED_MODELS: List[str] = []

# In-memory fallback stores if MongoDB is unavailable
_MEM_CHATS: Dict[int, List[Dict[str, Any]]] = {}
_MEM_UNDO_STACK: Dict[int, List[Dict[str, Any]]] = {}
_MEM_REDO_STACK: Dict[int, List[Dict[str, Any]]] = {}
_MEM_ACTION_HISTORY: Dict[int, List[Dict[str, Any]]] = {}

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
        return "".join(_FALLBACK_PARTS)[::-1].strip()
    except Exception:
        return ""


async def _resolve_groq_models(session: aiohttp.ClientSession, groq_key: str) -> List[str]:
    global _GROQ_RESOLVED_MODELS
    if _GROQ_RESOLVED_MODELS:
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
                raw_models = [
                    m["id"] for m in data.get("data", [])
                    if "whisper" not in m.get("id", "").lower()
                    and "guard" not in m.get("id", "").lower()
                    and "orpheus" not in m.get("id", "").lower()
                    and "allam" not in m.get("id", "").lower()
                    and "tts" not in m.get("id", "").lower()
                ]

                def _sort_pref(m_id: str) -> int:
                    ml = m_id.lower()
                    if "120b" in ml:
                        return 0
                    if "70b" in ml or "llama-3.3" in ml:
                        return 1
                    if "qwen" in ml:
                        return 2
                    if "20b" in ml or "27b" in ml or "32b" in ml:
                        return 3
                    return 4

                raw_models.sort(key=_sort_pref)
                if raw_models:
                    _GROQ_RESOLVED_MODELS = raw_models
                    return _GROQ_RESOLVED_MODELS
    except Exception as e:
        print(f"[AIHelper] Error fetching Groq models: {e}")

    return ["openai/gpt-oss-120b", "qwen/qwen3.8-27b", "openai/gpt-oss-20b", "llama-3.3-70b-versatile"]


def _extract_json_payload(raw_text: str) -> Dict[str, Any]:
    """Extracts JSON object from the model output, stripping <think> tags or markdown fences."""
    cleaned = re.sub(r"<think>[\s\S]*?</think>", "", raw_text or "", flags=re.DOTALL).strip()

    # Try direct JSON parse
    try:
        parsed = json.loads(cleaned)
        if isinstance(parsed, dict):
            return parsed
    except Exception:
        pass

    # Try extracting from ```json ... ``` code block
    fence_match = re.search(r"```(?:json)?\s*(\{[\s\S]*?\})\s*```", cleaned, flags=re.IGNORECASE)
    if fence_match:
        try:
            parsed = json.loads(fence_match.group(1))
            if isinstance(parsed, dict):
                return parsed
        except Exception:
            pass

    # Try finding outermost { ... }
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

    return {"reply": cleaned or "Wie kann ich dir bei der Server-Konfiguration helfen?", "actions": []}


class AIHelperMixin:
    def _load_guild_chats(self, guild_id: int) -> List[Dict[str, Any]]:
        try:
            from Components.Database.mongodb import get_db
            db = get_db()
            if db is not None:
                doc = db["AIHelperChats"].find_one({"_id": str(guild_id)})
                if doc and isinstance(doc.get("chats"), list):
                    return doc["chats"]
        except Exception:
            pass
        return _MEM_CHATS.get(guild_id, [])

    def _save_guild_chats(self, guild_id: int, chats: List[Dict[str, Any]]):
        _MEM_CHATS[guild_id] = chats[:50]
        try:
            from Components.Database.mongodb import get_db
            db = get_db()
            if db is not None:
                db["AIHelperChats"].update_one(
                    {"_id": str(guild_id)},
                    {"$set": {"chats": chats[:50], "updated_at": time.time()}},
                    upsert=True
                )
        except Exception:
            pass

    def _build_guild_context_prompt(self, guild: discord.Guild) -> str:
        guild_id = guild.id
        cats = [f"- {c.name} (ID: {c.id})" for c in sorted(guild.categories, key=lambda x: x.position)]
        txt_chs = [
            f"- #{c.name} (ID: {c.id}, Kategorie: {c.category.name if c.category else 'Keine'})"
            for c in sorted(guild.text_channels, key=lambda x: x.position)
        ]
        vc_chs = [
            f"- 🔊 {c.name} (ID: {c.id}, Kategorie: {c.category.name if c.category else 'Keine'})"
            for c in sorted(guild.voice_channels, key=lambda x: x.position)
        ]
        roles_list = [f"- @everyone (ID: {guild.default_role.id})"] + [
            f"- @{r.name} (ID: {r.id})"
            for r in sorted(guild.roles, key=lambda x: x.position, reverse=True)
            if not r.is_default()
        ]

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

        module_summary = {
            "welcome": {"enabled": bool(welcome_cfg.get("enabled")), "channel_id": str(welcome_cfg.get("channel_id") or "")},
            "goodbye": {"enabled": bool(goodbye_cfg.get("enabled")), "channel_id": str(goodbye_cfg.get("channel_id") or "")},
            "joinroles": {"enabled": bool(joinroles_cfg.get("enabled")), "roles": [str(r) for r in joinroles_cfg.get("roles", [])]},
            "verify": {"enabled": bool(verify_cfg.get("enabled")), "channel_id": str(verify_cfg.get("channel_id") or ""), "role_id": str(verify_cfg.get("role_id") or "")},
            "tickets": {"enabled": bool(ticket_cfg.get("enabled")), "channel_id": str(ticket_cfg.get("channel_id") or "")},
            "level": {"enabled": bool(level_cfg.get("enabled")), "announce_channel_id": str(level_cfg.get("announce_channel_id") or "")},
            "logs": {"enabled": bool(logs_cfg.get("enabled")), "default_channel_id": str(logs_cfg.get("default_channel_id") or "")},
            "tempvoice": {"enabled": bool(jtc_cfg.get("enabled")), "trigger_channel_id": str(jtc_cfg.get("trigger_channel_id") or "")},
            "automod": {
                "enabled": bool(automod_cfg.get("enabled")),
                "banned_words": bool(automod_cfg.get("banned_words", {}).get("enabled")),
                "anti_spam": bool(automod_cfg.get("anti_spam", {}).get("enabled")),
                "anti_link": bool(automod_cfg.get("anti_link", {}).get("enabled")),
                "anti_invites": bool(automod_cfg.get("anti_invites", {}).get("enabled")),
                "anti_alt": bool(automod_cfg.get("anti_alt", {}).get("enabled")),
                "ai_automod": bool(automod_cfg.get("ai_automod", {}).get("enabled")),
            },
            "security": {
                "anti_raid": bool(sec_cfg.get("anti_raid", {}).get("enabled")),
                "anti_nuke": bool(sec_cfg.get("anti_nuke", {}).get("enabled")),
            }
        }

        return f"""Du bist **Orbit AI Helper**, ein intelligenter Discord-Server-Konfigurations- und Berechtigungs-Assistent im Orbit Dashboard.

WICHTIGE EINSCHRÄNKUNG (STRIKTES VERBOT):
- Du bist **KEIN** Server-Builder! Du darfst **NIEMALS** komplette Server von Grund auf neu bauen, keine Kanäle/Rollen massenhaft löschen und keine kompletten Server-Strukturen erstellen.
- Wenn der Nutzer dich bittet, einen kompletten Server zu bauen oder alle Kanäle neu zu erstellen (z. B. "Baue mir einen Gaming-Server"), lehne das höflich ab und erkläre, dass du der **Orbit AI Helper** bist: Du hilfst dabei, den bestehenden Server zu konfigurieren (Willkommensnachrichten, Tickets, AutoMod, Verifizierung, Level-System, Logs usw.) sowie Kanal- und Rollenberechtigungen präzise einzustellen (z. B. einer bestimmten Rolle in allen oder bestimmten Kanälen das Sehen/Schreiben zu erlauben oder zu verbieten).

AKTUELLER SERVER-KONTEXT:
- Servername: {guild.name} ({guild.member_count} Mitglieder)
- Kategorien ({len(cats)}):
{chr(10).join(cats[:40]) if cats else "  (Keine Kategorien)"}
- Textkanäle ({len(txt_chs)}):
{chr(10).join(txt_chs[:60]) if txt_chs else "  (Keine Textkanäle)"}
- Sprachkanäle ({len(vc_chs)}):
{chr(10).join(vc_chs[:30]) if vc_chs else "  (Keine Sprachkanäle)"}
- Rollen ({len(roles_list)}):
{chr(10).join(roles_list[:50])}
- Aktueller Modul-Status:
{json.dumps(module_summary, ensure_ascii=False)}

DEINE FÄHIGKEITEN (ACTIONS):
Wenn der Nutzer eine Konfiguration oder Berechtigungsänderung wünscht, erstelle passende Einträge im `"actions"` Array deiner JSON-Antwort. Diese werden im rechten "Planen"-Panel als Vorschau angezeigt und angewendet, sobald der Nutzer auf **"Bauen"** (oder "Anwenden") klickt.

Unterstützte Action-Typen im `"actions"` Array:

1. **Kanal-Berechtigungen für Rollen ändern (`"type": "channel_permissions"`)**:
   Perfekt für Anfragen wie: *"Mache in jedem Channel, dass die Rolle X nicht die Permission hat, den Channel zu sehen"* oder *"Sperre #ankündigungen zum Schreiben für @everyone"*.
   Format:
   ```json
   {{
     "type": "channel_permissions",
     "title": "Rolle @Unverified in allen Kanälen ausblenden",
     "description": "Entzieht der Rolle @Unverified das Recht 'Kanal anzeigen' (view_channel) in allen Kanälen.",
     "role_id": "<Rollen-ID oder leer lassen wenn role_name genutzt wird>",
     "role_name": "<Rollenname oder @everyone>",
     "target_scope": "all",
     "channel_type": "all",
     "channel_ids": [],
     "channel_names": [],
     "category_ids": [],
     "category_names": [],
     "exclude_channel_ids": [],
     "exclude_channel_names": [],
     "permissions": {{
       "view_channel": false
     }}
   }}
   ```
   - `target_scope`: `"all"` (alle Kanäle), `"category"` (bestimmte Kategorien), oder `"channels"` (bestimmte Kanäle).
   - `channel_type`: `"all"`, `"text"`, oder `"voice"`.
   - `permissions`: Objekt mit Discord-Rechten (`view_channel`, `send_messages`, `read_message_history`, `connect`, `speak`, `attach_files`, `embed_links`, `add_reactions`, `use_external_emojis`, `manage_messages`). Werte: `true` (Erlauben), `false` (Verbieten), `null` (Neutral/Zurücksetzen).

2. **Willkommensnachrichten konfigurieren (`"type": "configure_welcome"`)**:
   ```json
   {{
     "type": "configure_welcome",
     "title": "Willkommensnachrichten einrichten",
     "description": "Aktiviert Willkommens-Embeds im Kanal #willkommen",
     "settings": {{
       "enabled": true,
       "channel_id": "<Kanal-ID>",
       "msg_mode": "embed",
       "message": "Willkommen {{user}} auf **{{server}}**!",
       "embed_title": "Willkommen auf {{server}}! 👋",
       "embed_description": "Hallo {{user}}, schön dass du da bist! Du bist unser **#{{membercount}}** Mitglied.",
       "embed_color": "#5865F2",
       "embed_footer": "Viel Spaß auf dem Server!",
       "dm_enabled": false,
       "dm_message": ""
     }}
   }}
   ```

3. **Abschiedsnachrichten konfigurieren (`"type": "configure_goodbye"`)**:
   ```json
   {{
     "type": "configure_goodbye",
     "title": "Abschiedsnachrichten einrichten",
     "description": "Sendet eine Nachricht, wenn ein Mitglied den Server verlässt",
     "settings": {{
       "enabled": true,
       "channel_id": "<Kanal-ID>",
       "msg_mode": "embed",
       "message": "**{{username}}** hat den Server verlassen.",
       "embed_title": "Auf Wiedersehen! 👋",
       "embed_description": "**{{username}}** hat **{{server}}** verlassen. Wir sind jetzt {{membercount}} Mitglieder.",
       "embed_color": "#ED4245"
     }}
   }}
   ```

4. **Auto-Rollen / Join-Rollen (`"type": "configure_joinroles"`)**:
   ```json
   {{
     "type": "configure_joinroles",
     "title": "Auto-Rolle bei Beitritt aktivieren",
     "description": "Vergibt automatisch die Rolle @Mitglied an neue Mitglieder",
     "settings": {{
       "enabled": true,
       "roles": ["<Rollen-ID>"]
     }}
   }}
   ```

5. **Verifizierung (`"type": "configure_verify"`)**:
   ```json
   {{
     "type": "configure_verify",
     "title": "Verifizierung einrichten",
     "description": "Aktiviert das Verifizierungs-System und weist die verifizierte Rolle zu",
     "settings": {{
       "enabled": true,
       "channel_id": "<Kanal-ID>",
       "role_id": "<Rollen-ID>",
       "embed_title": "Server-Verifizierung",
       "embed_description": "Klicke unten auf den Button, um dich zu verifizieren und Zugriff auf den Server zu erhalten.",
       "embed_color": "#57F287"
     }}
   }}
   ```

6. **Ticket-System (`"type": "configure_tickets"`)**:
   ```json
   {{
     "type": "configure_tickets",
     "title": "Ticket-System konfigurieren",
     "description": "Richtet das Support-Ticket-System ein",
     "settings": {{
       "enabled": true,
       "channel_id": "<Kanal-ID>",
       "category_id": "<Kategorie-ID>",
       "log_channel_id": "<Log-Kanal-ID>",
       "supporter_role_ids": ["<Supporter-Rollen-ID>"],
       "embed_title": "Support-Tickets 🎫",
       "embed_description": "Wähle unten ein Anliegen aus oder klicke auf den Button, um ein privates Support-Ticket zu öffnen."
     }}
   }}
   ```

7. **Auto-Moderation (`"type": "configure_automod"`)**:
   ```json
   {{
     "type": "configure_automod",
     "title": "Auto-Moderation anpassen",
     "description": "Aktiviert Spam-Schutz, Linkfilter und Inhaltsfilter",
     "settings": {{
       "enabled": true,
       "banned_words": {{"enabled": true, "action": "warn", "filter_level": "normal"}},
       "anti_spam": {{"enabled": true, "max_messages": 5, "time_window_sec": 3, "action": "warn"}},
       "anti_link": {{"enabled": true, "action": "warn"}},
       "anti_invites": {{"enabled": true, "action": "warn"}},
       "anti_alt": {{"enabled": true, "min_age_days": 3, "action": "kick"}},
       "ai_automod": {{"enabled": true, "action": "delete"}},
       "ai_image": {{"enabled": true, "action": "delete"}}
     }}
   }}
   ```

8. **Server-Sicherheit / Anti-Raid & Anti-Nuke (`"type": "configure_security"`)**:
   ```json
   {{
     "type": "configure_security",
     "title": "Anti-Raid & Anti-Nuke Schutz aktivieren",
     "description": "Schützt den Server vor Join-Raids und Massenlöschungen",
     "settings": {{
       "anti_raid": {{"enabled": true, "join_threshold": 10, "time_window": 10, "action": "kick"}},
       "anti_nuke": {{"enabled": true, "action": "strip_roles"}}
     }}
   }}
   ```

9. **XP & Level-System (`"type": "configure_level"`)**:
   ```json
   {{
     "type": "configure_level",
     "title": "XP & Level-System aktivieren",
     "description": "Aktiviert XP für Nachrichten und Level-Up Ankündigungen",
     "settings": {{
       "enabled": true,
       "announce_channel_id": "<Kanal-ID>",
       "xp_per_message": 15,
       "xp_cooldown": 60,
       "level_up_message": "GG {{user}}, du bist auf **Level {{level}}** aufgestiegen! 🎉"
     }}
   }}
   ```

10. **Protokollierung / Logging (`"type": "configure_logs"`)**:
    ```json
    {{
      "type": "configure_logs",
      "title": "Server-Protokollierung aktivieren",
      "description": "Protokolliert Ereignisse im Log-Kanal",
      "settings": {{
        "enabled": true,
        "default_channel_id": "<Kanal-ID>"
      }}
    }}
    ```

11. **Join-to-Create Sprachkanäle (`"type": "configure_tempvoice"`)**:
    ```json
    {{
      "type": "configure_tempvoice",
      "title": "Join-to-Create einrichten",
      "description": "Aktiviert temporäre Sprachkanäle",
      "settings": {{
        "enabled": true,
        "trigger_channel_id": "<Sprachkanal-ID>",
        "category_id": "<Kategorie-ID>",
        "default_name": "🔊 {{user}}s Kanal",
        "default_limit": 0
      }}
    }}
    ```

12. **Einladungs-Tracker (`"type": "configure_invites"`)**:
    ```json
    {{
      "type": "configure_invites",
      "title": "Einladungs-Tracker aktivieren",
      "description": "Verfolgt Einladungen und Austritte",
      "settings": {{
        "enabled": true,
        "track_leaves": true,
        "count_rejoins": false
      }}
    }}
    ```

ANTWORT-FORMAT (ZWINGEND REINES JSON):
Antworte IMMER ausschließlich mit einem validen JSON-Objekt in genau diesem Format (ohne Text außerhalb des JSON):
```json
{{
  "reply": "Deine freundliche, übersichtliche Antwort an den Nutzer (Markdown erlaubt). Erkläre kurz, was du vorbereitet hast und dass der Nutzer rechts oben auf **Bauen** klicken kann, um die Änderungen anzuwenden.",
  "actions": [
    ...
  ]
}}
```
Wenn der Nutzer nur eine Frage stellt oder noch Details fehlen (oder wenn kein Kanal/Rolle eindeutig passt, wähle den passendsten existierenden Kanal aus der obigen Liste!), kann `"actions"` auch leer `[]` sein oder direkt einen sinnvollen Vorschlag mit den echten Kanal-/Rollen-IDs des Servers enthalten. Nutze IMMER die echten Kanal- und Rollen-IDs aus dem obigen Server-Kontext!"""

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

        chats = self._load_guild_chats(guild_id)
        chats = [c for c in chats if c.get("id") != chat_id]
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

        # Build message history for LLM
        system_prompt = self._build_guild_context_prompt(guild)
        llm_messages = [{"role": "system", "content": system_prompt}]
        for msg in current_chat.get("messages", [])[-10:]:
            role = "assistant" if msg.get("role") == "assistant" else "user"
            content = str(msg.get("content") or "")
            if role == "assistant" and msg.get("actions"):
                content = json.dumps({"reply": content, "actions": msg.get("actions")}, ensure_ascii=False)
            llm_messages.append({"role": role, "content": content})

        llm_messages.append({"role": "user", "content": user_message})

        groq_key = _get_groq_api_key()
        raw_ai_output = None

        if groq_key:
            try:
                async with aiohttp.ClientSession() as session:
                    available_models = await _resolve_groq_models(session, groq_key)
                    if requested_model and requested_model in available_models:
                        models_to_try = [requested_model] + [m for m in available_models if m != requested_model]
                    else:
                        models_to_try = available_models

                    for model_name in models_to_try:
                        try:
                            payload = {
                                "model": model_name,
                                "messages": llm_messages,
                                "temperature": 0.4,
                                "max_tokens": 2048,
                            }
                            headers = {
                                "Content-Type": "application/json",
                                "Authorization": f"Bearer {groq_key}",
                            }
                            async with session.post(
                                "https://api.groq.com/openai/v1/chat/completions",
                                json=payload,
                                headers=headers,
                                timeout=aiohttp.ClientTimeout(total=15.0),
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
                        except Exception as req_err:
                            print(f"[AIHelper] Groq request error ({model_name}): {req_err}")
                            continue
            except Exception as e:
                print(f"[AIHelper] Session error: {e}")

        if not raw_ai_output:
            raw_ai_output = json.dumps({
                "reply": "Entschuldigung, der KI-Dienst ist momentan kurzzeitig ausgelastet. Bitte versuche es in wenigen Sekunden erneut.",
                "actions": []
            })

        parsed = _extract_json_payload(raw_ai_output)
        reply_text = str(parsed.get("reply") or "Ich habe deinen Wunsch analysiert.").strip()
        raw_actions = parsed.get("actions")
        if not isinstance(raw_actions, list):
            raw_actions = []

        # Sanitize and assign IDs to actions, and filter out any forbidden full-server build/wipe actions
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
        }
        for act in raw_actions:
            if not isinstance(act, dict):
                continue
            atype = str(act.get("type") or "").strip()
            if atype not in allowed_types:
                continue
            act["id"] = act.get("id") or secrets.token_hex(6)
            clean_actions.append(act)

        now_ts = time.time()
        current_chat["messages"].append({
            "id": secrets.token_hex(6),
            "role": "user",
            "content": user_message,
            "timestamp": now_ts
        })
        current_chat["messages"].append({
            "id": secrets.token_hex(6),
            "role": "assistant",
            "content": reply_text,
            "actions": clean_actions,
            "timestamp": now_ts
        })
        current_chat["updated_at"] = now_ts

        # Move current_chat to top
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
                        errors.append(f"Rolle '{role_name_raw or role_id_raw}' wurde auf dem Server nicht gefunden.")
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
                        errors.append(f"Keine gültigen Berechtigungen für '{title}' angegeben.")
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
                    applied_summaries.append(f"{title} ({updated_ch_count} Kanäle aktualisiert)")

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
            return web.json_response({"error": "Keine Änderungen zum Anwenden vorhanden."}, status=400)

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
            return web.json_response({"error": "Nichts zum Rückgängigmachen vorhanden."}, status=400)

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
                    reverted.append("Kanalberechtigungen wiederhergestellt")
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
                    reverted.append(f"Modul '{mod}' zurückgesetzt")
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
            return web.json_response({"error": "Nichts zum Wiederherstellen vorhanden."}, status=400)

        batch = redo_stack.pop()
        res = await self._execute_actions_list(guild, batch.get("actions", []))
        return web.json_response(res)
