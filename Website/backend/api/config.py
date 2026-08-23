import os
import secrets
import json
import asyncio
from aiohttp import web
import aiohttp
import discord
from typing import Dict, Any
from Components.Commands.Welcome._storage import load_welcome_config, save_welcome_config
from Components.Commands.Goodbye._storage import load_goodbye_config, save_goodbye_config
from Components.Dashboard.Automoderation._storage import load_automod_config, save_automod_config
from Components.Commands.Verify._storage import load_verify_config, save_verify_config, WEB_VERIFY_SESSIONS, remove_pending_kick
from Components.Commands.AutoResponder._storage import load_responses, save_responses
from Components.Commands.JoinRole._storage import load_join_roles, save_join_roles
from Components.Commands.Log._storage import load_log_config, save_log_config
from Components.Commands.ChannelAutomation._storage import load_automation_config, save_automation_config
from Components.Commands.Boost._storage import load_boost_config, save_boost_config
from Components.Commands.Level._storage import load_level_config, save_level_config
from Components.Commands.ServerStats._storage import load_serverstats_config, save_serverstats_config


class ConfigMixin:
    async def api_get_config(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        if not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild ID"}, status=400)
        guild_id = int(guild_id_str)
        
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild:
            return web.json_response({"error": "Unauthorized or not found"}, status=403)

        channels = [{"id": str(c.id), "name": c.name} for c in guild.text_channels]
        voice_channels = [{"id": str(c.id), "name": c.name} for c in guild.voice_channels]
        categories = [{"id": str(c.id), "name": c.name} for c in guild.categories]
        roles = [{"id": str(r.id), "name": r.name, "color": str(r.color) if str(r.color) != "#000000" else "#b9bbbe"} for r in guild.roles if not r.is_default()]
        emojis = [{"id": str(e.id), "name": e.name, "animated": e.animated} for e in guild.emojis]

        welcome_cfg = load_welcome_config(guild_id)
        automod_cfg = load_automod_config(guild_id)
        verify_cfg = load_verify_config(guild_id)
        goodbye_cfg = load_goodbye_config(guild_id)
        boost_cfg = load_boost_config(guild_id)
        autoresponder_cfg = load_responses(guild_id)
        joinroles_cfg = load_join_roles(guild_id)
        
        from Components.Commands.Ticket._storage import load_ticket_config
        ticket_cfg = load_ticket_config(guild_id)
        logs_cfg = load_log_config(guild_id)
        automation_cfg = load_automation_config(guild_id)
        
        from Components.Commands.JoinToCreate._storage import load_jtc_config
        tempvoice_cfg = load_jtc_config(guild_id)
        level_cfg = load_level_config(guild_id)
        
        from Components.Commands.Security._storage import load_security_config
        security_cfg = load_security_config(guild_id)
        
        from Components.Commands.Economy._storage import load_economy_config
        economy_cfg = load_economy_config(guild_id)
        serverstats_cfg = load_serverstats_config(guild_id)

        from Components.Dashboard.WebDashboard._storage import load_settings_config
        settings_cfg = load_settings_config(guild_id)
        
        # Resolve immune users for the frontend
        immune_user_ids = settings_cfg.get("immune_users", [])
        resolved_immune_users = []
        for uid_str in immune_user_ids:
            try:
                uid = int(uid_str)
                user_obj = self.bot.get_user(uid)
                if not user_obj:
                    user_obj = await self.bot.fetch_user(uid)
                if user_obj:
                    resolved_immune_users.append({
                        "id": str(user_obj.id),
                        "name": user_obj.name,
                        "avatar": user_obj.avatar.url if user_obj.avatar else user_obj.default_avatar.url
                    })
            except Exception:
                pass
        settings_cfg["immune_users"] = resolved_immune_users

        from Components.Commands.Appeals._storage import load_appeals_config
        appeals_cfg = load_appeals_config(guild_id)

        from Components.Database.mongodb import get_db, get_config
        db = get_db()
        guild_settings = db["GuildSettings"].find_one({"_id": guild_id}) if db is not None else {}
        prefix = guild_settings.get("prefix", "-") if guild_settings else "-"
        global_settings = get_config("Settings", guild_id)
        ai_enabled = global_settings.get("ai_enabled", True) if global_settings else True

        config_data = {
            "settings": settings_cfg,
            "extra_settings": {
                "ai_enabled": ai_enabled,
                "prefix": prefix
            },
            "autoresponder_enabled": settings_cfg.get("autoresponder_enabled", False),
            "messages_enabled": settings_cfg.get("messages_enabled", False),
            "appeals": appeals_cfg,
            "welcome": {
                "enabled": welcome_cfg.get("enabled", False),
                "channel_id": str(welcome_cfg.get("channel_id")) if welcome_cfg.get("channel_id") else "",
                "message": welcome_cfg.get("message", ""),
                "image_url": welcome_cfg.get("image_url", ""),
                "embed_image": welcome_cfg.get("embed_image", ""),
                "msg_mode": welcome_cfg.get("msg_mode", "image"),
                "embed_color": welcome_cfg.get("embed_color", "#5865F2"),
                "embed_title": welcome_cfg.get("embed_title", ""),
                "embed_description": welcome_cfg.get("embed_description", ""),
                "embed_thumbnail": welcome_cfg.get("embed_thumbnail", ""),
                "embed_footer": welcome_cfg.get("embed_footer", ""),
                "embed_author": welcome_cfg.get("embed_author", ""),
                "embed_author_icon": welcome_cfg.get("embed_author_icon", ""),
                "embed_footer_icon": welcome_cfg.get("embed_footer_icon", ""),
                "embed_fields": welcome_cfg.get("embed_fields", [])
            },
            "goodbye": {
                "enabled": goodbye_cfg.get("enabled", False),
                "channel_id": str(goodbye_cfg.get("channel_id")) if goodbye_cfg.get("channel_id") else "",
                "message": goodbye_cfg.get("message", ""),
                "image_url": goodbye_cfg.get("image_url", ""),
                "embed_image": goodbye_cfg.get("embed_image", ""),
                "msg_mode": goodbye_cfg.get("msg_mode", "image"),
                "embed_color": goodbye_cfg.get("embed_color", "#ED4245"),
                "embed_title": goodbye_cfg.get("embed_title", ""),
                "embed_description": goodbye_cfg.get("embed_description", ""),
                "embed_thumbnail": goodbye_cfg.get("embed_thumbnail", ""),
                "embed_footer": goodbye_cfg.get("embed_footer", ""),
                "embed_author": goodbye_cfg.get("embed_author", ""),
                "embed_author_icon": goodbye_cfg.get("embed_author_icon", ""),
                "embed_footer_icon": goodbye_cfg.get("embed_footer_icon", ""),
                "embed_fields": goodbye_cfg.get("embed_fields", [])
            },
            "boost": {
                "enabled": boost_cfg.get("enabled", False),
                "channel_id": str(boost_cfg.get("channel_id")) if boost_cfg.get("channel_id") else "",
                "reward_role_id": str(boost_cfg.get("reward_role_id", "")),
                "message": boost_cfg.get("message", ""),
                "image_url": boost_cfg.get("image_url", ""),
                "embed_image": boost_cfg.get("embed_image", ""),
                "msg_mode": boost_cfg.get("msg_mode", "image"),
                "embed_color": boost_cfg.get("embed_color", "#EB459E"),
                "embed_title": boost_cfg.get("embed_title", ""),
                "embed_description": boost_cfg.get("embed_description", ""),
                "embed_thumbnail": boost_cfg.get("embed_thumbnail", ""),
                "embed_footer": boost_cfg.get("embed_footer", ""),
                "embed_author": boost_cfg.get("embed_author", ""),
                "embed_author_icon": boost_cfg.get("embed_author_icon", ""),
                "embed_footer_icon": boost_cfg.get("embed_footer_icon", ""),
                "embed_fields": boost_cfg.get("embed_fields", [])
            },
            "automod": {
                "enabled": automod_cfg.get("enabled", False),
                "exempt_channels": automod_cfg.get("exempt_channels", []),
                "exempt_roles": automod_cfg.get("exempt_roles", []),
                "banned_words": {
                    "enabled": automod_cfg.get("banned_words", {}).get("enabled", False),
                    "action": automod_cfg.get("banned_words", {}).get("action", "warn"),
                    "timeout_duration_min": automod_cfg.get("banned_words", {}).get("timeout_duration_min", 5),
                    "words": automod_cfg.get("banned_words", {}).get("words", []),
                    "allowed_words": automod_cfg.get("banned_words", {}).get("allowed_words", []),
                    "filter_level": automod_cfg.get("banned_words", {}).get("filter_level", "relaxed"),
                    "exempt_channels": automod_cfg.get("banned_words", {}).get("exempt_channels", []),
                    "exempt_roles": automod_cfg.get("banned_words", {}).get("exempt_roles", [])
                },
                "anti_spam": {
                    "enabled": automod_cfg.get("anti_spam", {}).get("enabled", False),
                    "max_messages": automod_cfg.get("anti_spam", {}).get("max_messages", 5),
                    "time_window_sec": automod_cfg.get("anti_spam", {}).get("time_window_sec", 3),
                    "action": automod_cfg.get("anti_spam", {}).get("action", "warn"),
                    "timeout_duration_min": automod_cfg.get("anti_spam", {}).get("timeout_duration_min", 5),
                    "exempt_channels": automod_cfg.get("anti_spam", {}).get("exempt_channels", []),
                    "exempt_roles": automod_cfg.get("anti_spam", {}).get("exempt_roles", [])
                },
                "anti_invites": {
                    "enabled": automod_cfg.get("anti_invites", {}).get("enabled", False),
                    "action": automod_cfg.get("anti_invites", {}).get("action", "warn"),
                    "timeout_duration_min": automod_cfg.get("anti_invites", {}).get("timeout_duration_min", 5),
                    "exempt_channels": automod_cfg.get("anti_invites", {}).get("exempt_channels", []),
                    "exempt_roles": automod_cfg.get("anti_invites", {}).get("exempt_roles", [])
                },
                "anti_link": {
                    "enabled": automod_cfg.get("anti_link", {}).get("enabled", False),
                    "action": automod_cfg.get("anti_link", {}).get("action", "warn"),
                    "timeout_duration_min": automod_cfg.get("anti_link", {}).get("timeout_duration_min", 5),
                    "blocked_domains": automod_cfg.get("anti_link", {}).get("blocked_domains", ["discord.gg/", "discord.com/invite/"]),
                    "exempt_channels": automod_cfg.get("anti_link", {}).get("exempt_channels", []),
                    "exempt_roles": automod_cfg.get("anti_link", {}).get("exempt_roles", [])
                },
                "anti_caps": {
                    "enabled": automod_cfg.get("anti_caps", {}).get("enabled", False),
                    "action": automod_cfg.get("anti_caps", {}).get("action", "warn"),
                    "timeout_duration_min": automod_cfg.get("anti_caps", {}).get("timeout_duration_min", 5),
                    "exempt_channels": automod_cfg.get("anti_caps", {}).get("exempt_channels", []),
                    "exempt_roles": automod_cfg.get("anti_caps", {}).get("exempt_roles", [])
                },
                "mention_spam": {
                    "enabled": automod_cfg.get("mention_spam", {}).get("enabled", False),
                    "max_mentions": automod_cfg.get("mention_spam", {}).get("max_mentions", 4),
                    "action": automod_cfg.get("mention_spam", {}).get("action", "warn"),
                    "timeout_duration_min": automod_cfg.get("mention_spam", {}).get("timeout_duration_min", 5),
                    "exempt_channels": automod_cfg.get("mention_spam", {}).get("exempt_channels", []),
                    "exempt_roles": automod_cfg.get("mention_spam", {}).get("exempt_roles", [])
                },
                "anti_scam": {
                    "enabled": automod_cfg.get("anti_scam", {}).get("enabled", False),
                    "action": automod_cfg.get("anti_scam", {}).get("action", "warn"),
                    "timeout_duration_min": automod_cfg.get("anti_scam", {}).get("timeout_duration_min", 5)
                },
                "anti_alt": {
                    "enabled": automod_cfg.get("anti_alt", {}).get("enabled", False),
                    "min_age_days": automod_cfg.get("anti_alt", {}).get("min_age_days", 3),
                    "action": automod_cfg.get("anti_alt", {}).get("action", "kick")
                },
                "anti_bot": {
                    "enabled": automod_cfg.get("anti_bot", {}).get("enabled", False),
                    "action": automod_cfg.get("anti_bot", {}).get("action", "kick")
                },
                "ai_automod": {
                    "enabled": automod_cfg.get("ai_automod", {}).get("enabled", False),
                    "min_words": automod_cfg.get("ai_automod", {}).get("min_words", 3),
                    "action": automod_cfg.get("ai_automod", {}).get("action", "delete")
                },
                "ai_image": {
                    "enabled": automod_cfg.get("ai_image", {}).get("enabled", False),
                    "action": automod_cfg.get("ai_image", {}).get("action", "delete")
                },
                "anti_zalgo": {
                    "enabled": automod_cfg.get("anti_zalgo", {}).get("enabled", False),
                    "action": automod_cfg.get("anti_zalgo", {}).get("action", "warn"),
                    "timeout_duration_min": automod_cfg.get("anti_zalgo", {}).get("timeout_duration_min", 5)
                }
            },
            "verify": {
                "enabled": verify_cfg.get("enabled", False),
                "role_id": str(verify_cfg.get("role_id")) if verify_cfg.get("role_id") else "",
                "remove_role_id": str(verify_cfg.get("remove_role_id")) if verify_cfg.get("remove_role_id") else "",
                "verification_type": verify_cfg.get("verification_type", "captcha"),
                "timeout_action": verify_cfg.get("timeout_action", "none"),
                "timeout_minutes": verify_cfg.get("timeout_minutes", None),
                "embed_title": verify_cfg.get("embed_title", ""),
                "embed_description": verify_cfg.get("embed_description", ""),
                "embed_color": verify_cfg.get("embed_color", ""),
                "embed_image": verify_cfg.get("embed_image", "")
            },
            "autoresponder": autoresponder_cfg,
            "joinroles": {
                "enabled": joinroles_cfg.get("enabled", False),
                "user_roles_enabled": joinroles_cfg.get("user_roles_enabled", False),
                "user_roles": [str(r) for r in joinroles_cfg.get("user_roles", [])],
                "bot_roles_enabled": joinroles_cfg.get("bot_roles_enabled", False),
                "bot_roles": [str(r) for r in joinroles_cfg.get("bot_roles", [])],
                "tag_roles_enabled": joinroles_cfg.get("tag_roles_enabled", False),
                "tag_role": str(joinroles_cfg.get("tag_role", "")) if joinroles_cfg.get("tag_role") else ""
            },
            "ticket": {
                "enabled": ticket_cfg.get("enabled", False),
                "panel_title": ticket_cfg.get("panel_title", ""),
                "panel_description": ticket_cfg.get("panel_description", ""),
                "panel_instructions": ticket_cfg.get("panel_instructions", ""),
                "panel_channel_id": str(ticket_cfg.get("panel_channel_id")) if ticket_cfg.get("panel_channel_id") else "",
                "log_channel_id": str(ticket_cfg.get("log_channel_id")) if ticket_cfg.get("log_channel_id") else "",
                "options_slots": [
                    {
                        "name": slot.get("name", ""),
                        "role_id": str(slot.get("role_id")) if slot.get("role_id") else "",
                        "category_id": str(slot.get("category_id")) if slot.get("category_id") else ""
                    }
                    for slot in ticket_cfg.get("options_slots", []) if isinstance(slot, dict)
                ]
            },
            "logs": logs_cfg,
            "automation": {
                "enabled": automation_cfg.get("enabled", False),
                "media_only_channels": automation_cfg.get("media_only", {}).get("channels", []),
                "media_ignore_bots": automation_cfg.get("media_only", {}).get("ignore_bots", True),
                "command_only_channels": automation_cfg.get("command_only", {}).get("channels", []),
                "honeypot_enabled": automation_cfg.get("auto_ban", {}).get("enabled", False),
                "honeypot_channel_id": automation_cfg.get("auto_ban", {}).get("channel_id", ""),
                "honeypot_exempt_roles": automation_cfg.get("auto_ban", {}).get("exempt_roles", []),
                "honeypot_message": automation_cfg.get("auto_ban", {}).get("message", ""),
                "honeypot_msg_mode": automation_cfg.get("auto_ban", {}).get("msg_mode", "message"),
                "honeypot_action": automation_cfg.get("auto_ban", {}).get("action", "softban"),
                "honeypot_embed_title": automation_cfg.get("auto_ban", {}).get("embed_title", ""),
                "honeypot_embed_description": automation_cfg.get("auto_ban", {}).get("embed_description", ""),
                "honeypot_embed_color": automation_cfg.get("auto_ban", {}).get("embed_color", "#EF4444"),
                "honeypot_embed_thumbnail": automation_cfg.get("auto_ban", {}).get("embed_thumbnail", ""),
                "file_channels": automation_cfg.get("file_only", []),
                "reaction_channels": automation_cfg.get("auto_reaction", []),
                "counting_enabled": automation_cfg.get("counting", {}).get("enabled", False),
                "counting_channel_id": automation_cfg.get("counting", {}).get("channel_id", ""),
                "counting_whitelist_roles": automation_cfg.get("counting", {}).get("whitelisted_roles", []),
                "solo_counting": automation_cfg.get("counting", {}).get("allow_solo_counting", True),
                "current_count": automation_cfg.get("counting", {}).get("current_count", 0),
            },
            "tempvoice": tempvoice_cfg,
            "level": level_cfg,
            "economy": economy_cfg,
            "serverstats": serverstats_cfg,
            "security": security_cfg,
            "autoresponder_enabled": settings_cfg.get("autoresponder_enabled", False),
            "messages_enabled": settings_cfg.get("messages_enabled", False)
        }

        if "channels" in logs_cfg and isinstance(logs_cfg["channels"], dict):
            for k, v in logs_cfg["channels"].items():
                if v: logs_cfg["channels"][k] = str(v)
        if "roles" in logs_cfg and isinstance(logs_cfg["roles"], dict):
            for k, v in logs_cfg["roles"].items():
                if v: logs_cfg["roles"][k] = str(v)
                
        if "hubs" in tempvoice_cfg and isinstance(tempvoice_cfg["hubs"], list):
            for hub in tempvoice_cfg["hubs"]:
                if hub.get("hub_channel_id"): hub["hub_channel_id"] = str(hub["hub_channel_id"])
                if hub.get("category_id"): hub["category_id"] = str(hub["category_id"])
        
        return web.json_response({
            "permissions": user_perms,
            "channels": channels,
            "voice_channels": voice_channels,
            "categories": categories,
            "roles": roles,
            "emojis": emojis,
            "config": config_data
        })

    async def api_post_config(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        if not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild ID"}, status=400)
        guild_id = int(guild_id_str)
        
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild:
            return web.json_response({"error": "Unauthorized or not found"}, status=403)
            
        try:
            from Components.Database.mongodb import get_config
            data = await request.json()

            if user_perms.get("is_admin") and "settings" in data:
                from Components.Dashboard.WebDashboard._storage import save_settings_config, load_settings_config
                s_cfg = load_settings_config(guild_id)
                new_s = data["settings"]
                for k, v in new_s.items():
                    s_cfg[k] = v
                if "autoresponder_enabled" in new_s:
                    s_cfg["autoresponder_enabled"] = bool(new_s["autoresponder_enabled"])
                if "messages_enabled" in new_s:
                    s_cfg["messages_enabled"] = bool(new_s["messages_enabled"])
                save_settings_config(guild_id, s_cfg)

            if user_perms.get("is_admin") and "extra_settings" in data:
                ext = data["extra_settings"]
                
                # AI Enabled
                from Components.Database.mongodb import get_config, set_config, get_db
                g_cfg = get_config("Settings", guild_id) or {}
                g_cfg["ai_enabled"] = bool(ext.get("ai_enabled", True))
                set_config("Settings", guild_id, g_cfg)
                
                # Prefix
                db = get_db()
                if db is not None:
                    new_prefix = ext.get("prefix", "-").strip()
                    if not new_prefix: new_prefix = "-"
                    db["GuildSettings"].update_one({"_id": guild_id}, {"$set": {"prefix": new_prefix}}, upsert=True)
                    
                    # Try to clear bot's memory cache
                    try:
                        import bot
                        if hasattr(bot, 'PREFIX_CACHE') and guild_id in bot.PREFIX_CACHE:
                            bot.PREFIX_CACHE[guild_id] = new_prefix
                    except Exception:
                        pass
                
                # Bot Roles removed from extra_settings (now handled in Auto Roles module)

            if user_perms.get("can_channels") and "appeals" in data:
                from Components.Commands.Appeals._storage import save_appeals_config
                save_appeals_config(guild_id, data["appeals"])

            if user_perms.get("can_channels") and "serverstats" in data:
                s_data = data.get("serverstats", {})
                ss_cfg = load_serverstats_config(guild_id)
                if "enabled" in s_data:
                    ss_cfg["enabled"] = bool(s_data["enabled"])
                ss_cfg["category_id"] = str(s_data.get("category_id", "") or "")
                ss_cfg["category_name"] = str(s_data.get("category_name", " Server Stats") or " Server Stats")
                ss_cfg["users_enabled"] = bool(s_data.get("users_enabled"))
                ss_cfg["users_name"] = str(s_data.get("users_name", "Users: {count}") or "Users: {count}")
                ss_cfg["boosts_enabled"] = bool(s_data.get("boosts_enabled"))
                ss_cfg["boosts_name"] = str(s_data.get("boosts_name", "Boosts: {count}") or "Boosts: {count}")
                ss_cfg["bots_enabled"] = bool(s_data.get("bots_enabled"))
                ss_cfg["bots_name"] = str(s_data.get("bots_name", "Bots: {count}") or "Bots: {count}")
                ss_cfg["roles_enabled"] = bool(s_data.get("roles_enabled"))
                ss_cfg["roles_name"] = str(s_data.get("roles_name", "Roles: {count}") or "Roles: {count}")
                save_serverstats_config(guild_id, ss_cfg)
                cog = self.bot.get_cog("ServerStats")
                if cog:
                    import asyncio
                    asyncio.create_task(cog.sync_guild_stats(guild))

            def _clean_cloudinary(old_url: str, new_url: str):
                if old_url and old_url != new_url and "res.cloudinary.com" in old_url:
                    from Components.Database.cloudinary_storage import delete_image_by_url
                    import asyncio
                    asyncio.create_task(asyncio.to_thread(delete_image_by_url, old_url))

            if user_perms.get("can_channels") and "welcome" in data:
                welcome_cfg = load_welcome_config(guild_id)
                w_data = data.get("welcome", {})
                
                _clean_cloudinary(welcome_cfg.get("image_url", ""), w_data.get("image_url", ""))
                _clean_cloudinary(welcome_cfg.get("embed_image", ""), w_data.get("embed_image", ""))
                _clean_cloudinary(welcome_cfg.get("embed_thumbnail", ""), w_data.get("embed_thumbnail", ""))
                _clean_cloudinary(welcome_cfg.get("embed_author_icon", ""), w_data.get("embed_author_icon", ""))
                _clean_cloudinary(welcome_cfg.get("embed_footer_icon", ""), w_data.get("embed_footer_icon", ""))

                welcome_cfg["enabled"] = bool(w_data.get("enabled"))
                cid = w_data.get("channel_id")
                welcome_cfg["channel_id"] = int(cid) if cid else None
                welcome_cfg["message"] = w_data.get("message", "")
                welcome_cfg["msg_mode"] = w_data.get("msg_mode", "image")
                welcome_cfg["image_url"] = w_data.get("image_url", "")
                welcome_cfg["embed_image"] = w_data.get("embed_image", "")
                welcome_cfg["embed_color"] = w_data.get("embed_color", "#5865F2")
                welcome_cfg["embed_title"] = w_data.get("embed_title", "")
                welcome_cfg["embed_description"] = w_data.get("embed_description", "")
                welcome_cfg["embed_thumbnail"] = w_data.get("embed_thumbnail", "")
                welcome_cfg["embed_footer"] = w_data.get("embed_footer", "")
                welcome_cfg["embed_author"] = w_data.get("embed_author", "")
                welcome_cfg["embed_author_icon"] = w_data.get("embed_author_icon", "")
                welcome_cfg["embed_footer_icon"] = w_data.get("embed_footer_icon", "")
                welcome_cfg["embed_fields"] = w_data.get("embed_fields", [])
                
                save_welcome_config(guild_id, welcome_cfg)

            if user_perms.get("can_channels") and "goodbye" in data:
                goodbye_cfg = load_goodbye_config(guild_id)
                g_data = data.get("goodbye", {})

                _clean_cloudinary(goodbye_cfg.get("image_url", ""), g_data.get("image_url", ""))
                _clean_cloudinary(goodbye_cfg.get("embed_image", ""), g_data.get("embed_image", ""))
                _clean_cloudinary(goodbye_cfg.get("embed_thumbnail", ""), g_data.get("embed_thumbnail", ""))
                _clean_cloudinary(goodbye_cfg.get("embed_author_icon", ""), g_data.get("embed_author_icon", ""))
                _clean_cloudinary(goodbye_cfg.get("embed_footer_icon", ""), g_data.get("embed_footer_icon", ""))

                goodbye_cfg["enabled"] = bool(g_data.get("enabled"))
                cid = g_data.get("channel_id")
                goodbye_cfg["channel_id"] = int(cid) if cid else None
                goodbye_cfg["message"] = g_data.get("message", "")
                goodbye_cfg["msg_mode"] = g_data.get("msg_mode", "image")
                goodbye_cfg["image_url"] = g_data.get("image_url", "")
                goodbye_cfg["embed_image"] = g_data.get("embed_image", "")
                goodbye_cfg["embed_color"] = g_data.get("embed_color", "#ED4245")
                goodbye_cfg["embed_title"] = g_data.get("embed_title", "")
                goodbye_cfg["embed_description"] = g_data.get("embed_description", "")
                goodbye_cfg["embed_thumbnail"] = g_data.get("embed_thumbnail", "")
                goodbye_cfg["embed_footer"] = g_data.get("embed_footer", "")
                goodbye_cfg["embed_author"] = g_data.get("embed_author", "")
                goodbye_cfg["embed_author_icon"] = g_data.get("embed_author_icon", "")
                goodbye_cfg["embed_footer_icon"] = g_data.get("embed_footer_icon", "")
                goodbye_cfg["embed_fields"] = g_data.get("embed_fields", [])
                    
                save_goodbye_config(guild_id, goodbye_cfg)

            if user_perms.get("can_channels") and "boost" in data:
                boost_cfg = load_boost_config(guild_id)
                b_data = data.get("boost", {})

                _clean_cloudinary(boost_cfg.get("image_url", ""), b_data.get("image_url", ""))
                _clean_cloudinary(boost_cfg.get("embed_image", ""), b_data.get("embed_image", ""))
                _clean_cloudinary(boost_cfg.get("embed_thumbnail", ""), b_data.get("embed_thumbnail", ""))
                _clean_cloudinary(boost_cfg.get("embed_author_icon", ""), b_data.get("embed_author_icon", ""))
                _clean_cloudinary(boost_cfg.get("embed_footer_icon", ""), b_data.get("embed_footer_icon", ""))

                boost_cfg["enabled"] = bool(b_data.get("enabled"))
                cid = b_data.get("channel_id")
                boost_cfg["channel_id"] = int(cid) if cid else None
                boost_cfg["reward_role_id"] = str(b_data.get("reward_role_id", ""))
                boost_cfg["message"] = b_data.get("message", "")
                boost_cfg["msg_mode"] = b_data.get("msg_mode", "image")
                boost_cfg["image_url"] = b_data.get("image_url", "")
                boost_cfg["embed_image"] = b_data.get("embed_image", "")
                boost_cfg["embed_color"] = b_data.get("embed_color", "#EB459E")
                boost_cfg["embed_title"] = b_data.get("embed_title", "")
                boost_cfg["embed_description"] = b_data.get("embed_description", "")
                boost_cfg["embed_thumbnail"] = b_data.get("embed_thumbnail", "")
                boost_cfg["embed_footer"] = b_data.get("embed_footer", "")
                boost_cfg["embed_author"] = b_data.get("embed_author", "")
                boost_cfg["embed_author_icon"] = b_data.get("embed_author_icon", "")
                boost_cfg["embed_footer_icon"] = b_data.get("embed_footer_icon", "")
                boost_cfg["embed_fields"] = b_data.get("embed_fields", [])
                    
                save_boost_config(guild_id, boost_cfg)

            if user_perms.get("can_messages") and "automod" in data:
                automod_cfg = get_config("AutoMod", guild_id)
                if not isinstance(automod_cfg, dict):
                    automod_cfg = {}
                am = data["automod"]
                automod_cfg["enabled"] = bool(am.get("enabled"))
                
                gec = am.get("exempt_channels", [])
                ger = am.get("exempt_roles", [])
                if "global_exempt_channels" in automod_cfg:
                    del automod_cfg["global_exempt_channels"]
                if "global_exempt_roles" in automod_cfg:
                    del automod_cfg["global_exempt_roles"]
                
                automod_cfg["exempt_channels"] = [str(c) for c in gec] if isinstance(gec, list) else []
                automod_cfg["exempt_roles"] = [str(r) for r in ger] if isinstance(ger, list) else []

                def save_submodule(key: str, defaults: dict, extra_fields: list = None):
                    if key not in automod_cfg:
                        automod_cfg[key] = {}
                    src = am.get(key, {})
                    automod_cfg[key]["enabled"] = bool(src.get("enabled"))
                    automod_cfg[key]["action"] = src.get("action", defaults.get("action", "warn"))
                    automod_cfg[key]["timeout_duration_min"] = int(src.get("timeout_duration_min", defaults.get("timeout_duration_min", 5)))
                    
                    ec = src.get("exempt_channels", [])
                    er = src.get("exempt_roles", [])
                    automod_cfg[key]["exempt_channels"] = [str(c) for c in ec] if isinstance(ec, list) else []
                    automod_cfg[key]["exempt_roles"] = [str(r) for r in er] if isinstance(er, list) else []

                    if extra_fields:
                        for ef in extra_fields:
                            field_name = ef["name"]
                            if ef["type"] == int:
                                automod_cfg[key][field_name] = int(src.get(field_name, ef["default"]))
                            elif ef["type"] == list:
                                raw = src.get(field_name, ef["default"])
                                if isinstance(raw, str):
                                    automod_cfg[key][field_name] = [x.strip() for x in raw.split(",") if x.strip()]
                                else:
                                    automod_cfg[key][field_name] = raw
                            elif ef["type"] == str:
                                automod_cfg[key][field_name] = str(src.get(field_name, ef["default"]))

                save_submodule("banned_words", {}, [
                    {"name": "words", "type": list, "default": []},
                    {"name": "allowed_words", "type": list, "default": []},
                    {"name": "filter_level", "type": str, "default": "relaxed"}
                ])
                save_submodule("anti_spam", {}, [
                    {"name": "max_messages", "type": int, "default": 5},
                    {"name": "time_window_sec", "type": int, "default": 3}
                ])
                save_submodule("anti_invites", {}, [])
                save_submodule("anti_link", {}, [{"name": "blocked_domains", "type": list, "default": []}])
                save_submodule("anti_caps", {}, [])
                save_submodule("mention_spam", {}, [{"name": "max_mentions", "type": int, "default": 4}])
                save_submodule("anti_bot", {"action": "kick"}, [])
                save_submodule("ai_automod", {"action": "delete"}, [{"name": "min_words", "type": int, "default": 3}])
                save_submodule("ai_image", {"action": "delete"}, [])
                save_submodule("anti_zalgo", {"action": "warn"}, [])

                if "anti_alt" not in automod_cfg:
                    automod_cfg["anti_alt"] = {}
                aalt = am.get("anti_alt", {})
                automod_cfg["anti_alt"]["enabled"] = bool(aalt.get("enabled"))
                automod_cfg["anti_alt"]["min_age_days"] = int(aalt.get("min_age_days", 3))
                automod_cfg["anti_alt"]["action"] = aalt.get("action", "kick")

                save_automod_config(guild_id, automod_cfg)

            if user_perms.get("can_channels") and "security" in data:
                from Components.Commands.Security._storage import load_security_config, save_security_config
                sec_cfg = load_security_config(guild_id)
                sec_cfg["anti_nuke_enabled"] = bool(data["security"].get("anti_nuke_enabled", True))
                sec_cfg["anti_scam_enabled"] = bool(data["security"].get("anti_scam_enabled", True))
                try:
                    sec_cfg["anti_nuke_threshold"] = int(data["security"].get("anti_nuke_threshold", 3))
                except (ValueError, TypeError):
                    sec_cfg["anti_nuke_threshold"] = 3
                try:
                    sec_cfg["anti_nuke_time_window"] = int(data["security"].get("anti_nuke_time_window", 10))
                except (ValueError, TypeError):
                    sec_cfg["anti_nuke_time_window"] = 10
                save_security_config(guild_id, sec_cfg)

            if user_perms.get("can_roles") and "verify" in data:
                verify_cfg = load_verify_config(guild_id)
                verify_cfg["enabled"] = bool(data.get("verify", {}).get("enabled"))
                rid = data.get("verify", {}).get("role_id")
                verify_cfg["role_id"] = int(rid) if rid else None
                rrid = data.get("verify", {}).get("remove_role_id")
                verify_cfg["remove_role_id"] = int(rrid) if rrid else None
                verify_cfg["verification_type"] = data.get("verify", {}).get("verification_type", "captcha")
                verify_cfg["timeout_action"] = data.get("verify", {}).get("timeout_action", "none")
                try:
                    verify_cfg["timeout_minutes"] = int(data.get("verify", {}).get("timeout_minutes", 0))
                except (ValueError, TypeError):
                    verify_cfg["timeout_minutes"] = 0
                
                verify_cfg["embed_title"] = data.get("verify", {}).get("embed_title", "")
                verify_cfg["embed_description"] = data.get("verify", {}).get("embed_description", "")
                verify_cfg["embed_color"] = data.get("verify", {}).get("embed_color", "")
                verify_cfg["embed_image"] = data.get("verify", {}).get("embed_image", "")
                verify_cfg["embed_fields"] = data.get("verify", {}).get("embed_fields", [])
                
                save_verify_config(guild_id, verify_cfg)

            if user_perms.get("can_messages") and "autoresponder" in data:
                from Components.Commands.AutoResponder._storage import save_responses
                save_responses(guild_id, data["autoresponder"])

            if user_perms.get("can_roles") and "joinroles" in data:
                from Components.Commands.JoinRole._storage import save_join_roles
                jr_data = data["joinroles"]
                save_join_roles(guild_id, {
                    "enabled": bool(jr_data.get("enabled", False)),
                    "user_roles_enabled": bool(jr_data.get("user_roles_enabled", False)),
                    "user_roles": [int(r) for r in jr_data.get("user_roles", []) if r],
                    "bot_roles_enabled": bool(jr_data.get("bot_roles_enabled", False)),
                    "bot_roles": [int(r) for r in jr_data.get("bot_roles", []) if r],
                    "tag_roles_enabled": bool(jr_data.get("tag_roles_enabled", False)),
                    "tag_role": int(jr_data.get("tag_role")) if jr_data.get("tag_role") else None
                })

            if user_perms.get("can_channels") and "ticket" in data:
                from Components.Commands.Ticket._storage import load_ticket_config, save_ticket_config
                ticket_cfg = load_ticket_config(guild_id)
                ticket_cfg["enabled"] = bool(data["ticket"].get("enabled"))
                
                title = data["ticket"].get("panel_title", "").strip()
                if title:
                    ticket_cfg["panel_title"] = title
                desc = data["ticket"].get("panel_description", "").strip()
                if desc:
                    ticket_cfg["panel_description"] = desc
                instr = data["ticket"].get("panel_instructions", "").strip()
                if instr:
                    ticket_cfg["panel_instructions"] = instr
                
                tid = data["ticket"].get("panel_channel_id")
                ticket_cfg["panel_channel_id"] = int(tid) if tid else None
                
                tlid = data["ticket"].get("log_channel_id")
                ticket_cfg["log_channel_id"] = int(tlid) if tlid else None
                
                if "options_slots" in data["ticket"]:
                    parsed_slots = []
                    for slot in data["ticket"]["options_slots"]:
                        rid = slot.get("role_id")
                        cid = slot.get("category_id")
                        parsed_slots.append({
                            "name": slot.get("name", "Option"),
                            "role_id": int(rid) if rid else None,
                            "category_id": int(cid) if cid else None
                        })
                    ticket_cfg["options_slots"] = parsed_slots
                    
                    ticket_cfg["options"] = [s.get("name", "Option") for s in parsed_slots]
                
                save_ticket_config(guild_id, ticket_cfg)

            if user_perms.get("can_channels") and "automation" in data:
                from Components.Commands.ChannelAutomation._storage import load_automation_config, save_automation_config
                current_auto = load_automation_config(guild_id)
                new_flat = data["automation"]
                
                new_auto = {
                    "enabled": bool(new_flat.get("enabled", False)),
                    "media_only": {
                        "channels": new_flat.get("media_only_channels", []),
                        "ignore_bots": bool(new_flat.get("media_ignore_bots", True))
                    },
                    "command_only": {
                        "channels": new_flat.get("command_only_channels", [])
                    },
                    "auto_ban": {
                        "enabled": bool(new_flat.get("honeypot_enabled", False)),
                        "channel_id": str(new_flat.get("honeypot_channel_id", "")),
                        "exempt_roles": new_flat.get("honeypot_exempt_roles", []),
                        "message": str(new_flat.get("honeypot_message", "")),
                        "msg_mode": str(new_flat.get("honeypot_msg_mode", "message")),
                        "action": str(new_flat.get("honeypot_action", "softban")),
                        "embed_title": str(new_flat.get("honeypot_embed_title", "")),
                        "embed_description": str(new_flat.get("honeypot_embed_description", "")),
                        "embed_color": str(new_flat.get("honeypot_embed_color", "#EF4444")),
                        "embed_thumbnail": str(new_flat.get("honeypot_embed_thumbnail", "")),
                        "ban_count": current_auto.get("auto_ban", {}).get("ban_count", 0),
                        "message_id": current_auto.get("auto_ban", {}).get("message_id", "")
                    },
                    "file_only": new_flat.get("file_channels", []),
                    "auto_reaction": new_flat.get("reaction_channels", []),
                    "counting": {
                        "enabled": bool(new_flat.get("counting_enabled", False)),
                        "channel_id": str(new_flat.get("counting_channel_id", "")),
                        "whitelisted_roles": new_flat.get("counting_whitelist_roles", []),
                        "allow_solo_counting": bool(new_flat.get("solo_counting", True)),
                        "current_count": current_auto.get("counting", {}).get("current_count", 0),
                        "last_user_id": current_auto.get("counting", {}).get("last_user_id", None)
                    }
                }
                
                if new_flat.get("reset_count_requested"):
                    new_auto["counting"]["current_count"] = 0
                    new_auto["counting"]["last_user_id"] = None

                save_automation_config(guild_id, new_auto)

            if user_perms.get("can_channels") and "logs" in data:
                l_cfg = load_log_config(guild_id)
                l_data = data["logs"]
                
                l_cfg["enabled"] = bool(l_data.get("enabled", False))
                l_cfg["executor_in_logs"] = bool(l_data.get("executor_in_logs", False))
                
                gec = l_data.get("global_exempt_channels", [])
                ger = l_data.get("global_exempt_roles", [])
                l_cfg["global_exempt_channels"] = [str(c) for c in gec] if isinstance(gec, list) else []
                l_cfg["global_exempt_roles"] = [str(r) for r in ger] if isinstance(ger, list) else []
                
                from Components.Commands.Log._storage import DEFAULT_CATEGORIES
                if "channels" in l_data and isinstance(l_data["channels"], dict):
                    for k in DEFAULT_CATEGORIES:
                        c = l_data["channels"].get(k)
                        l_cfg["channels"][k] = str(c) if c else None
                
                if "roles" in l_data and isinstance(l_data["roles"], dict):
                    for k in DEFAULT_CATEGORIES:
                        r = l_data["roles"].get(k)
                        l_cfg["roles"][k] = str(r) if r else None
                
                if "categories" in l_data and isinstance(l_data["categories"], dict):
                    for k in DEFAULT_CATEGORIES:
                        l_cfg["categories"][k] = bool(l_data["categories"].get(k, False))
                
                save_log_config(guild_id, l_cfg)

            if user_perms.get("can_channels") and "tempvoice" in data:
                from Components.Commands.JoinToCreate._storage import load_jtc_config, save_jtc_config
                jtc_cfg = load_jtc_config(guild_id)
                jtc_data = data["tempvoice"]
                
                jtc_cfg["enabled"] = bool(jtc_data.get("enabled", False))
                parsed_hubs = []
                for hub in jtc_data.get("hubs", []):
                    hid = hub.get("hub_channel_id")
                    cid = hub.get("category_id")
                    limit = hub.get("default_user_limit", 0)
                    if hid:
                        parsed_hubs.append({
                            "hub_channel_id": int(hid) if str(hid).isdigit() else None,
                            "category_id": int(cid) if cid and str(cid).isdigit() else None,
                            "default_user_limit": int(limit) if str(limit).isdigit() else 0
                        })
                jtc_cfg["hubs"] = [h for h in parsed_hubs if h["hub_channel_id"]]
                save_jtc_config(guild_id, jtc_cfg)

            if "level" in data:
                level_cfg = load_level_config(guild_id)
                ld = data["level"]
                level_cfg["enabled"] = bool(ld.get("enabled", False))
                level_cfg["msg_xp_enabled"] = bool(ld.get("msg_xp_enabled", True))
                level_cfg["msg_xp_amount"] = int(ld.get("msg_xp_amount", 20))
                level_cfg["msg_xp_cooldown"] = int(ld.get("msg_xp_cooldown", 60))
                level_cfg["voice_xp_enabled"] = bool(ld.get("voice_xp_enabled", False))
                level_cfg["voice_xp_ignore_muted"] = bool(ld.get("voice_xp_ignore_muted", True))
                level_cfg["voice_xp_ignore_solo"] = bool(ld.get("voice_xp_ignore_solo", False))
                level_cfg["voice_xp_amount"] = int(ld.get("voice_xp_amount", 6))
                level_cfg["cmd_xp_enabled"] = bool(ld.get("cmd_xp_enabled", True))
                level_cfg["cmd_xp_amount"] = int(ld.get("cmd_xp_amount", 15))
                level_cfg["cmd_xp_cooldown"] = int(ld.get("cmd_xp_cooldown", 60))
                level_cfg["react_xp_enabled"] = bool(ld.get("react_xp_enabled", True))
                level_cfg["react_xp_amount"] = int(ld.get("react_xp_amount", 15))
                level_cfg["react_xp_cooldown"] = int(ld.get("react_xp_cooldown", 300))
                level_cfg["reset_on_leave"] = bool(ld.get("reset_on_leave", False))
                level_cfg["reset_on_ban"] = bool(ld.get("reset_on_ban", False))
                level_cfg["vote_boost"] = bool(ld.get("vote_boost", True))
                try:
                    level_cfg["xp_multiplier"] = float(ld.get("xp_multiplier", 1.0))
                except (ValueError, TypeError):
                    level_cfg["xp_multiplier"] = 1.0
                level_cfg["channel_mode"] = ld.get("channel_mode", "blacklist")
                level_cfg["role_mode"] = ld.get("role_mode", "blacklist")
                level_cfg["blocked_channels"] = ld.get("blocked_channels", [])
                level_cfg["blocked_roles"] = ld.get("blocked_roles", [])
                level_cfg["levelup_channel"] = ld.get("levelup_channel", "current")
                level_cfg["leaderboard_url"] = ld.get("leaderboard_url", "")
                level_cfg["leaderboard_channel"] = ld.get("leaderboard_channel", "")
                level_cfg["leaderboard_color"] = ld.get("leaderboard_color", "#3B82F6")
                level_cfg["levelup_conditional"] = ld.get("levelup_conditional", "")
                level_cfg["levelup_show_avatar"] = bool(ld.get("levelup_show_avatar", True))
                level_cfg["levelup_message_content"] = ld.get("levelup_message_content", "{user_mention}")
                level_cfg["levelup_embed_author"] = ld.get("levelup_embed_author", "")
                level_cfg["levelup_embed_title"] = ld.get("levelup_embed_title", " Level Up!")
                level_cfg["levelup_embed_description"] = ld.get("levelup_embed_description", "")
                level_cfg["levelup_embed_image"] = ld.get("levelup_embed_image", "")
                level_cfg["levelup_embed_footer"] = ld.get("levelup_embed_footer", "")
                level_cfg["level_roles_stack"] = bool(ld.get("level_roles_stack", False))
                level_cfg["level_roles_rejoin"] = bool(ld.get("level_roles_rejoin", False))
                level_cfg["level_roles"] = ld.get("level_roles", [])
                level_cfg["stat_roles_msg_stack"] = bool(ld.get("stat_roles_msg_stack", False))
                level_cfg["stat_roles_msg_cooldown"] = int(ld.get("stat_roles_msg_cooldown", 5))
                level_cfg["stat_roles_msg"] = ld.get("stat_roles_msg", [])
                level_cfg["stat_roles_voice_stack"] = bool(ld.get("stat_roles_voice_stack", False))
                level_cfg["stat_roles_voice_cooldown"] = int(ld.get("stat_roles_voice_cooldown", 5))
                level_cfg["stat_roles_voice"] = ld.get("stat_roles_voice", [])
                level_cfg["stat_roles_react_stack"] = bool(ld.get("stat_roles_react_stack", False))
                level_cfg["stat_roles_react_cooldown"] = int(ld.get("stat_roles_react_cooldown", 5))
                level_cfg["stat_roles_react"] = ld.get("stat_roles_react", [])
                level_cfg["role_boosters_stack"] = bool(ld.get("role_boosters_stack", True))
                level_cfg["role_boosters"] = ld.get("role_boosters", [])
                level_cfg["channel_boosters"] = ld.get("channel_boosters", [])
                save_level_config(guild_id, level_cfg)

            if "economy" in data:
                from Components.Commands.Economy._storage import load_economy_config, save_economy_config
                e_cfg = load_economy_config(guild_id)
                ed = data["economy"]
                e_cfg["enabled"] = bool(ed.get("enabled", True))
                e_cfg["currency_symbol"] = str(ed.get("currency_symbol", "") or "")
                try:
                    e_cfg["money_multiplier"] = float(ed.get("money_multiplier", 1.0))
                except (ValueError, TypeError):
                    e_cfg["money_multiplier"] = 1.0
                e_cfg["bet_limit_enabled"] = bool(ed.get("bet_limit_enabled", True))
                e_cfg["bet_limit_amount"] = int(ed.get("bet_limit_amount", 10000))
                e_cfg["reset_on_leave"] = bool(ed.get("reset_on_leave", False))

                e_cfg["msg_money_enabled"] = bool(ed.get("msg_money_enabled", True))
                e_cfg["msg_money_amount"] = int(ed.get("msg_money_amount", 8))
                e_cfg["msg_money_cooldown"] = int(ed.get("msg_money_cooldown", 60))

                e_cfg["voice_money_enabled"] = bool(ed.get("voice_money_enabled", False))
                e_cfg["voice_money_ignore_muted"] = bool(ed.get("voice_money_ignore_muted", True))
                e_cfg["voice_money_ignore_solo"] = bool(ed.get("voice_money_ignore_solo", False))
                e_cfg["voice_money_amount"] = int(ed.get("voice_money_amount", 4))

                e_cfg["cmd_money_enabled"] = bool(ed.get("cmd_money_enabled", True))
                e_cfg["cmd_money_amount"] = int(ed.get("cmd_money_amount", 8))
                e_cfg["cmd_money_cooldown"] = int(ed.get("cmd_money_cooldown", 60))

                e_cfg["react_money_enabled"] = bool(ed.get("react_money_enabled", True))
                e_cfg["react_money_amount"] = int(ed.get("react_money_amount", 20))
                e_cfg["react_money_cooldown"] = int(ed.get("react_money_cooldown", 300))

                e_cfg["daily_base_reward_enabled"] = bool(ed.get("daily_base_reward_enabled", True))
                e_cfg["daily_base_reward"] = int(ed.get("daily_base_reward", 250))
                e_cfg["daily_tier_reward_enabled"] = bool(ed.get("daily_tier_reward_enabled", True))
                e_cfg["daily_streak_limit"] = int(ed.get("daily_streak_limit", 5))
                e_cfg["daily_streak_bonus"] = int(ed.get("daily_streak_bonus", 10))

                e_cfg["work_enabled"] = bool(ed.get("work_enabled", True))
                e_cfg["work_min_amount"] = int(ed.get("work_min_amount", 300))
                e_cfg["work_max_amount"] = int(ed.get("work_max_amount", 500))
                e_cfg["work_cooldown_min"] = int(ed.get("work_cooldown_min", 240))
                e_cfg["work_use_default_responses"] = bool(ed.get("work_use_default_responses", True))
                if "work_custom_responses" in ed:
                    e_cfg["work_custom_responses"] = ed["work_custom_responses"]

                e_cfg["baltop_custom_url"] = str(ed.get("baltop_custom_url", "") or "")
                baltop_ch = ed.get("baltop_auto_channel_id")
                e_cfg["baltop_auto_channel_id"] = int(baltop_ch) if baltop_ch else None
                e_cfg["baltop_embed_color"] = str(ed.get("baltop_embed_color", "#5865F2") or "#5865F2")

                e_cfg["role_boosters_stack"] = bool(ed.get("role_boosters_stack", True))
                if "role_boosters" in ed:
                    e_cfg["role_boosters"] = ed["role_boosters"]
                if "channel_boosters" in ed:
                    e_cfg["channel_boosters"] = ed["channel_boosters"]
                if "items" in ed:
                    e_cfg["items"] = ed["items"]
                if "chests" in ed:
                    e_cfg["chests"] = ed["chests"]
                if "rarities" in ed:
                    e_cfg["rarities"] = ed["rarities"]
                if "recipes" in ed:
                    e_cfg["recipes"] = ed["recipes"]

                save_economy_config(guild_id, e_cfg)



            if user_perms.get("can_channels") and "ticket" in data:
                from Components.Commands.Ticket._storage import load_ticket_config
                ticket_cfg = load_ticket_config(guild_id)
                pid = ticket_cfg.get("panel_channel_id")
                mid = ticket_cfg.get("panel_message_id")
                if pid and mid:
                    ch = guild.get_channel(pid)
                    if ch:
                        try:
                            msg = await ch.fetch_message(mid)
                            from Components.Commands.Ticket._views import PersistentTicketPanelLayout
                            view = PersistentTicketPanelLayout(
                                title=ticket_cfg.get("panel_title", "Support Ticket Desk"),
                                description=ticket_cfg.get("panel_description", "Click the button below to open a direct support channel with our team."),
                                instructions=ticket_cfg.get("panel_instructions", "> Select your desired inquiry category in the dropdown menu below, then click **Create Ticket** to open your private channel."),
                                options_slots=ticket_cfg.get("options_slots", [])
                            )
                            embed = discord.Embed(
                                title=view.panel_title,
                                description=f"{view.panel_desc}\n\n{view.panel_instructions}",
                                color=discord.Color.teal()
                            )
                            await msg.edit(embed=embed, view=view, allowed_mentions=discord.AllowedMentions.none())
                        except Exception:
                            pass
            
            if user_perms.get("can_channels") and "security" in data:
                from Components.Commands.Security._storage import load_security_config, save_security_config
                sec_cfg = load_security_config(guild_id)
                sec_data = data["security"]
                sec_cfg["enabled"] = bool(sec_data.get("enabled", sec_cfg.get("enabled", False)))
                sec_cfg["anti_nuke_enabled"] = bool(sec_data.get("anti_nuke_enabled", True))
                sec_cfg["anti_scam_enabled"] = bool(sec_data.get("anti_scam_enabled", True))
                sec_cfg["anti_nuke_threshold"] = int(sec_data.get("anti_nuke_threshold", 3))
                sec_cfg["anti_nuke_time_window"] = int(sec_data.get("anti_nuke_time_window", 10))
                save_security_config(guild_id, sec_cfg)

            if user_perms.get("can_channels") and "autoresponder" in data:
                import Components.Commands.AutoResponder._storage as ar_storage
                ar_storage.save_responses(guild_id, data["autoresponder"])

            if "autoresponder_enabled" in data or "messages_enabled" in data:
                from Components.Dashboard.WebDashboard._storage import load_settings_config, save_settings_config
                s_cfg = load_settings_config(guild_id)
                if "autoresponder_enabled" in data:
                    s_cfg["autoresponder_enabled"] = bool(data["autoresponder_enabled"])
                if "messages_enabled" in data:
                    s_cfg["messages_enabled"] = bool(data["messages_enabled"])
                save_settings_config(guild_id, s_cfg)

            return web.json_response({"success": True})
        except Exception as e:
            import traceback
            traceback.print_exc()
            return web.json_response({"error": str(e)}, status=400)