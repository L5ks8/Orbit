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

from Components.Systems.EmbedBuilder._storage import load_embeds_config, save_embeds_config
from Components.Commands._utils import (
    HAS_V2,
    Container,
    TextDisplay,
    ActionRow,
    LayoutView,
    ORBIT_COLOR
)

class ActionsMixin:
    async def api_action_get_saved_embeds(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        if not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild ID"}, status=400)
        guild_id = int(guild_id_str)
        
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild or not (user_perms.get("is_admin") or user_perms.get("can_channels") or user_perms.get("can_messages")):
            return web.json_response({"error": "Unauthorized"}, status=403)
            
        data = load_embeds_config(guild_id)
        return web.json_response(data.get("embeds", []))

    async def api_action_save_embed(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        if not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild ID"}, status=400)
        guild_id = int(guild_id_str)
        
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild or not (user_perms.get("is_admin") or user_perms.get("can_channels") or user_perms.get("can_messages")):
            return web.json_response({"error": "Unauthorized"}, status=403)
            
        try:
            payload = await request.json()
            data = load_embeds_config(guild_id)
            embeds = data.get("embeds", [])
            
            embed_id = payload.get("id")
            if embed_id:
                for idx, emb in enumerate(embeds):
                    if emb.get("id") == embed_id:
                        embeds[idx] = payload
                        break
                else:
                    embeds.append(payload)
            else:
                payload["id"] = secrets.token_hex(8)
                if not payload.get("name"):
                    payload["name"] = "Untitled message"
                embeds.append(payload)
                
            data["embeds"] = embeds
            save_embeds_config(guild_id, data)
            
            return web.json_response({"success": True, "id": payload.get("id"), "embed": payload})
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    async def api_action_delete_saved_embed(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        embed_id = request.match_info.get("embed_id")
        
        if not guild_id_str.isdigit() or not embed_id:
            return web.json_response({"error": "Invalid parameters"}, status=400)
        guild_id = int(guild_id_str)
        
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild or not (user_perms.get("is_admin") or user_perms.get("can_channels") or user_perms.get("can_messages")):
            return web.json_response({"error": "Unauthorized"}, status=403)
            
        data = load_embeds_config(guild_id)
        embeds = data.get("embeds", [])
        
        data["embeds"] = [e for e in embeds if e.get("id") != embed_id]
        save_embeds_config(guild_id, data)
        
        return web.json_response({"success": True})

    async def api_action_send_custom_embed(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        if not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild ID"}, status=400)
        guild_id = int(guild_id_str)
        
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild or not (user_perms.get("can_channels") or user_perms.get("can_messages") or user_perms.get("is_admin")):
            return web.json_response({"error": "Unauthorized or missing Manage Channels permission"}, status=403)
            
        try:
            data = await request.json()
            channel_id = data.get("channel_id")
            if not channel_id:
                return web.json_response({"error": "Bitte wähle zuerst einen Kanal aus."}, status=400)
                
            channel = guild.get_channel(int(channel_id))
            if not channel:
                return web.json_response({"error": "Kanal wurde nicht gefunden."}, status=400)
                
            content = str(data.get("content") or "").strip()
            has_embed_flag = data.get("has_embed", True)
            title = str(data.get("title") or "").strip()
            url = str(data.get("url") or "").strip()
            description = str(data.get("description") or "").strip()
            color = str(data.get("color") or "").strip()
            image = str(data.get("image") or "").strip()
            thumbnail = str(data.get("thumbnail") or "").strip()
            
            author_name = str(data.get("author_name") or "").strip()
            author_url = str(data.get("author_url") or "").strip()
            author_icon = str(data.get("author_icon") or "").strip()
            
            footer_text = str(data.get("footer_text") or "").strip()
            footer_icon = str(data.get("footer_icon") or "").strip()
            include_timestamp = bool(data.get("timestamp", False))
            
            fields = data.get("fields", []) if isinstance(data.get("fields"), list) else []
            buttons = data.get("buttons", []) if isinstance(data.get("buttons"), list) else []
            
            session_user = await self.get_user_session(request)
            uid_str = str(session_user.get("id")) if session_user else ""
            uname_str = str(session_user.get("global_name") or session_user.get("username") or "User") if session_user else "User"
            member_count = guild.member_count or len(guild.members)

            def replace_vars(text):
                if not text:
                    return text
                t = str(text)
                t = t.replace("{user}", f"<@{uid_str}>" if uid_str else uname_str)
                t = t.replace("{user.mention}", f"<@{uid_str}>" if uid_str else uname_str)
                t = t.replace("{user.name}", uname_str)
                t = t.replace("{username}", uname_str)
                t = t.replace("{server}", guild.name)
                t = t.replace("{server.name}", guild.name)
                t = t.replace("{membercount}", str(member_count))
                t = t.replace("{server.members}", str(member_count))
                t = t.replace("{count}", str(member_count))
                return t

            embed = discord.Embed()
            if has_embed_flag:
                if title:
                    embed.title = replace_vars(title)[:256]
                if url and url.startswith("http"):
                    embed.url = url
                if description:
                    embed.description = replace_vars(description)[:4096]
                
                if color:
                    try:
                        if color.startswith("rgb"):
                            inner = color[color.find("(") + 1:color.find(")")]
                            parts = [int(x.strip()) for x in inner.split(",")[:3]]
                            embed.color = discord.Color.from_rgb(parts[0], parts[1], parts[2])
                        else:
                            embed.color = discord.Color(int(color.replace("#", ""), 16))
                    except Exception:
                        pass
                
                if author_name:
                    author_kwargs = {"name": replace_vars(author_name)[:256]}
                    if author_url and author_url.startswith("http"):
                        author_kwargs["url"] = author_url
                    if author_icon and author_icon.startswith("http"):
                        author_kwargs["icon_url"] = author_icon
                    embed.set_author(**author_kwargs)
                    
                if footer_text:
                    footer_kwargs = {"text": replace_vars(footer_text)[:2048]}
                    if footer_icon and footer_icon.startswith("http"):
                        footer_kwargs["icon_url"] = footer_icon
                    embed.set_footer(**footer_kwargs)

                if include_timestamp:
                    embed.timestamp = discord.utils.utcnow()
                    
                for field in fields[:25]:
                    if not isinstance(field, dict):
                        continue
                    fname = str(field.get("name") or "").strip()
                    fval = str(field.get("value") or "").strip()
                    finline = bool(field.get("inline", False))
                    if fname or fval:
                        embed.add_field(
                            name=(replace_vars(fname) or "\u200b")[:256],
                            value=(replace_vars(fval) or "\u200b")[:1024],
                            inline=finline
                        )
                
                if image and image.startswith("http"):
                    embed.set_image(url=image)
                if thumbnail and thumbnail.startswith("http"):
                    embed.set_thumbnail(url=thumbnail)
            
            has_embed = bool(
                has_embed_flag and (
                    embed.title or embed.description or embed.image or embed.thumbnail
                    or embed.author or embed.fields or embed.footer
                )
            )

            if not has_embed and not content:
                return web.json_response({"error": "Die Nachricht darf nicht komplett leer sein."}, status=400)

            view = None
            if buttons:
                v = discord.ui.View(timeout=None)
                for btn in buttons[:5]:
                    if not isinstance(btn, dict):
                        continue
                    b_label = str(btn.get("label") or "Link").strip()[:80]
                    b_url = str(btn.get("url") or "").strip()
                    if b_label and b_url.startswith("http"):
                        v.add_item(discord.ui.Button(style=discord.ButtonStyle.link, label=b_label, url=b_url))
                if len(v.children) > 0:
                    view = v

            send_kwargs = {}
            if has_embed:
                send_kwargs["embed"] = embed
            if content:
                send_kwargs["content"] = replace_vars(content)
            if view:
                send_kwargs["view"] = view

            send_as = str(data.get("send_as") or "bot")
            sender_name = str(data.get("sender_name") or "").strip()
            sender_avatar = str(data.get("sender_avatar") or "").strip()

            sent_via_webhook = False
            if send_as == "webhook" and sender_name:
                try:
                    webhooks = await channel.webhooks()
                    wh = next((w for w in webhooks if w.name == "Orbit Message Sender"), None)
                    if not wh:
                        wh = await channel.create_webhook(name="Orbit Message Sender")
                    wh_kwargs = dict(send_kwargs)
                    wh_kwargs["username"] = sender_name[:80]
                    if sender_avatar and sender_avatar.startswith("http"):
                        wh_kwargs["avatar_url"] = sender_avatar
                    wh_kwargs["wait"] = True
                    await wh.send(**wh_kwargs)
                    sent_via_webhook = True
                except Exception:
                    sent_via_webhook = False

            if not sent_via_webhook:
                await channel.send(**send_kwargs)

            return web.json_response({"success": True})
        except discord.Forbidden:
            return web.json_response({"error": "Dem Bot fehlen die Berechtigungen, um in diesem Kanal Nachrichten zu senden."}, status=403)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return web.json_response({"error": str(e)}, status=500)

    async def api_action_send_verify(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        if not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild ID"}, status=400)
        guild_id = int(guild_id_str)
        
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild or not (user_perms.get("can_roles") or user_perms.get("can_channels") or user_perms.get("is_admin")):
            return web.json_response({"error": "Unauthorized or missing Manage Roles permission"}, status=403)
            
        try:
            data = await request.json()
            verify_cfg = load_verify_config(guild_id)
            sys_payload = data.get("system") if isinstance(data.get("system"), dict) else data

            created_verified_role = None
            created_unverified_role = None
            created_channel = None

            # 1. Create Verified Role if requested
            if data.get("create_verified_role") or sys_payload.get("create_verified_role"):
                r_name = str(data.get("verified_role_name") or sys_payload.get("verified_role_name") or "Verified").strip()[:60]
                r_col_str = str(data.get("verified_role_color") or sys_payload.get("verified_role_color") or "#22c55e").strip()
                try:
                    if r_col_str.startswith("rgb"):
                        inner = r_col_str[r_col_str.find("(") + 1:r_col_str.find(")")]
                        parts = [int(x.strip()) for x in inner.split(",")[:3]]
                        r_color = discord.Color.from_rgb(parts[0], parts[1], parts[2])
                    else:
                        r_color = discord.Color(int(r_col_str.lstrip("#"), 16))
                except Exception:
                    r_color = discord.Color.from_rgb(34, 197, 94)

                existing_r = discord.utils.get(guild.roles, name=r_name)
                if existing_r and not existing_r.managed and existing_r != guild.default_role:
                    created_verified_role = existing_r
                else:
                    created_verified_role = await guild.create_role(
                        name=r_name,
                        color=r_color,
                        reason="Orbit Verification Quick Setup"
                    )
                sys_payload["role_id"] = str(created_verified_role.id)

            # 2. Create Unverified Role if requested
            if data.get("create_unverified_role") or sys_payload.get("create_unverified_role"):
                ur_name = str(data.get("unverified_role_name") or sys_payload.get("unverified_role_name") or "Unverified").strip()[:60]
                existing_ur = discord.utils.get(guild.roles, name=ur_name)
                if existing_ur and not existing_ur.managed and existing_ur != guild.default_role:
                    created_unverified_role = existing_ur
                else:
                    created_unverified_role = await guild.create_role(
                        name=ur_name,
                        color=discord.Color.from_rgb(115, 115, 115),
                        reason="Orbit Verification Quick Setup"
                    )
                sys_payload["remove_role_id"] = str(created_unverified_role.id)

            # 3. Resolve or Create Channel
            channel_id = sys_payload.get("channel_id") or data.get("channel_id")
            channel = None
            if (data.get("create_channel") or sys_payload.get("create_channel")) or not channel_id:
                if data.get("create_channel") or sys_payload.get("create_channel"):
                    ch_name = str(data.get("channel_name") or sys_payload.get("channel_name") or "verify").strip().lower().replace(" ", "-")[:50] or "verify"
                    existing_ch = discord.utils.get(guild.text_channels, name=ch_name)
                    if existing_ch:
                        channel = existing_ch
                    else:
                        overwrites = {
                            guild.default_role: discord.PermissionOverwrite(view_channel=True, send_messages=False, add_reactions=False),
                            guild.me: discord.PermissionOverwrite(view_channel=True, send_messages=True, embed_links=True, attach_files=True, manage_messages=True)
                        }
                        rid_val = sys_payload.get("role_id") or verify_cfg.get("role_id")
                        if rid_val and str(rid_val).isdigit():
                            v_role = guild.get_role(int(rid_val))
                            if v_role:
                                overwrites[v_role] = discord.PermissionOverwrite(view_channel=False)
                        channel = await guild.create_text_channel(
                            name=ch_name,
                            overwrites=overwrites,
                            topic="Verify your account here to unlock access to the server.",
                            reason="Orbit Verification Quick Setup"
                        )
                    created_channel = channel
                    channel_id = str(channel.id)
                    sys_payload["channel_id"] = channel_id

            if not channel and channel_id and str(channel_id).isdigit():
                channel = guild.get_channel(int(channel_id))
            if not channel:
                return web.json_response({"error": "Bitte wähle einen gültigen Kanal aus oder lasse den Bot einen neuen erstellen."}, status=400)

            # Optional: lock other channels so @everyone only sees #verify until verified
            if data.get("lock_channels") or sys_payload.get("lock_channels"):
                rid_val = sys_payload.get("role_id") or verify_cfg.get("role_id")
                v_role = guild.get_role(int(rid_val)) if (rid_val and str(rid_val).isdigit()) else None
                try:
                    await channel.set_permissions(guild.default_role, view_channel=True, send_messages=False)
                    if v_role:
                        await channel.set_permissions(v_role, view_channel=False)
                except Exception:
                    pass

            emb_title = sys_payload.get("embed_title") or verify_cfg.get("embed_title") or "Server Verification"
            emb_desc = sys_payload.get("embed_description") or verify_cfg.get("embed_description") or "Please click the button below to verify your account and gain access to the server."
            raw_color = str(sys_payload.get("embed_color") or verify_cfg.get("embed_color") or "#5865F2").strip()
            try:
                if raw_color.startswith("rgb"):
                    inner = raw_color[raw_color.find("(") + 1:raw_color.find(")")]
                    parts = [int(x.strip()) for x in inner.split(",")[:3]]
                    emb_color = discord.Color.from_rgb(parts[0], parts[1], parts[2])
                else:
                    emb_color = discord.Color(int(raw_color.lstrip('#'), 16))
            except Exception:
                emb_color = discord.Color.blue()

            embed = discord.Embed(
                title=emb_title,
                description=emb_desc,
                color=emb_color
            )

            emb_image = sys_payload.get("embed_image") if "embed_image" in sys_payload else verify_cfg.get("embed_image", "")
            file_to_send = None
            import pathlib
            file_candidates = [
                pathlib.Path("Website/static/img/default_verify.png"),
                pathlib.Path(__file__).resolve().parent.parent.parent / "static" / "img" / "default_verify.png",
                pathlib.Path("Website/frontend/public/img/default_verify.png"),
                pathlib.Path("Website/frontend/dist/img/default_verify.png"),
            ]
            local_default_img = next((p for p in file_candidates if p.exists()), None)

            if emb_image == "none":
                pass
            elif (not emb_image or emb_image == "/img/default_verify.png" or emb_image.startswith("/") or "default_verify" in str(emb_image)) and local_default_img:
                file_to_send = discord.File(fp=str(local_default_img), filename="verify_banner.png")
                embed.set_image(url="attachment://verify_banner.png")
            elif emb_image and str(emb_image).startswith("http") and "Web/static/default_verify.png" not in str(emb_image):
                embed.set_image(url=str(emb_image))

            sys_id = str(sys_payload.get("id") or data.get("system_id") or "default")
            btn_label = str(sys_payload.get("button_label") or verify_cfg.get("button_label") or "Verify").strip()[:80] or "Verify"
            btn_style_str = str(sys_payload.get("button_style") or verify_cfg.get("button_style") or "success").lower()
            style_map = {
                "success": discord.ButtonStyle.success,
                "primary": discord.ButtonStyle.primary,
                "secondary": discord.ButtonStyle.secondary,
                "danger": discord.ButtonStyle.danger
            }
            btn_style = style_map.get(btn_style_str, discord.ButtonStyle.success)
            custom_id = f"orbit:verify_start:{sys_id}" if sys_id else "orbit:verify_start"

            view = discord.ui.View(timeout=None)
            view.add_item(discord.ui.Button(label=btn_label, style=btn_style, custom_id=custom_id))

            send_kwargs = {
                "embed": embed,
                "view": view,
                "allowed_mentions": discord.AllowedMentions.none()
            }
            if file_to_send:
                send_kwargs["file"] = file_to_send

            sent_msg = await channel.send(**send_kwargs)

            # Update system & primary verify_cfg
            import time
            systems = verify_cfg.get("systems", [])
            if not isinstance(systems, list):
                systems = []

            raw_vtype = str(sys_payload.get("verification_type") or verify_cfg.get("verification_type") or "captcha").strip().lower()
            if raw_vtype not in ["oneclick", "captcha", "web_captcha", "questionnaire"]:
                raw_vtype = "captcha"

            updated_sys = {
                "id": sys_id,
                "name": str(sys_payload.get("name") or emb_title or "Verification System"),
                "enabled": True,
                "deployed": True,
                "deployed_at": time.time(),
                "message_id": str(sent_msg.id),
                "channel_id": str(channel.id),
                "role_id": str(sys_payload.get("role_id") or verify_cfg.get("role_id") or ""),
                "remove_role_id": str(sys_payload.get("remove_role_id") if "remove_role_id" in sys_payload else (verify_cfg.get("remove_role_id") or "")),
                "verification_type": raw_vtype,
                "timeout_action": str(sys_payload.get("timeout_action") or verify_cfg.get("timeout_action") or "none"),
                "timeout_minutes": int(sys_payload.get("timeout_minutes") if "timeout_minutes" in sys_payload else (verify_cfg.get("timeout_minutes") or 0)),
                "questionnaire_enabled": bool(sys_payload.get("questionnaire_enabled") or sys_payload.get("verification_type") == "questionnaire"),
                "questions": sys_payload.get("questions") if isinstance(sys_payload.get("questions"), list) else (verify_cfg.get("questions") or []),
                "embed_title": emb_title,
                "embed_description": emb_desc,
                "embed_color": raw_color,
                "embed_image": emb_image or "/img/default_verify.png",
                "button_label": btn_label,
                "button_style": btn_style_str
            }

            replaced = False
            for idx, s in enumerate(systems):
                if isinstance(s, dict) and str(s.get("id")) == sys_id:
                    systems[idx] = updated_sys
                    replaced = True
                    break
            if not replaced:
                systems.append(updated_sys)

            verify_cfg["systems"] = systems
            verify_cfg["channel_id"] = channel.id
            verify_cfg["enabled"] = True
            if updated_sys["role_id"] and updated_sys["role_id"].isdigit():
                verify_cfg["role_id"] = int(updated_sys["role_id"])
            if updated_sys["remove_role_id"] and updated_sys["remove_role_id"].isdigit():
                verify_cfg["remove_role_id"] = int(updated_sys["remove_role_id"])
            else:
                verify_cfg["remove_role_id"] = None
            verify_cfg["verification_type"] = updated_sys["verification_type"]
            verify_cfg["timeout_action"] = updated_sys["timeout_action"]
            verify_cfg["timeout_minutes"] = updated_sys["timeout_minutes"]
            verify_cfg["embed_title"] = updated_sys["embed_title"]
            verify_cfg["embed_description"] = updated_sys["embed_description"]
            verify_cfg["embed_color"] = updated_sys["embed_color"]
            verify_cfg["embed_image"] = updated_sys["embed_image"]
            verify_cfg["button_label"] = updated_sys["button_label"]
            verify_cfg["button_style"] = updated_sys["button_style"]
            verify_cfg["questionnaire_enabled"] = updated_sys["questionnaire_enabled"]
            verify_cfg["questions"] = updated_sys["questions"]
            save_verify_config(guild_id, verify_cfg)

            return web.json_response({
                "success": True,
                "system": updated_sys,
                "systems": systems,
                "created_verified_role": {"id": str(created_verified_role.id), "name": created_verified_role.name} if created_verified_role else None,
                "created_unverified_role": {"id": str(created_unverified_role.id), "name": created_unverified_role.name} if created_unverified_role else None,
                "created_channel": {"id": str(created_channel.id), "name": created_channel.name} if created_channel else None
            })
        except discord.Forbidden:
            return web.json_response({"error": "Dem Bot fehlen die Berechtigungen (Rollen/Kanäle verwalten oder Nachrichten senden)."}, status=403)
        except Exception as e:
            return web.json_response({"error": str(e)}, status=400)

    async def api_action_send_ticket(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        if not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild ID"}, status=400)
        guild_id = int(guild_id_str)
        
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild or not user_perms.get("can_channels"):
            return web.json_response({"error": "Unauthorized or missing Manage Channels permission"}, status=403)
            
        try:
            data = await request.json()
            from Components.Systems.Tickets._views import PersistentTicketPanelLayout
            from Components.Systems.Tickets._storage import load_ticket_config, save_ticket_config
            
            ticket_cfg = load_ticket_config(guild_id)
            ticket_cfg["enabled"] = True

            channel_id = data.get("channel_id") or ticket_cfg.get("panel_channel_id")
            if not channel_id:
                return web.json_response({"error": "No channel_id provided and no panel_channel_id configured"}, status=400)
                
            channel = guild.get_channel(int(channel_id))
            if not channel:
                return web.json_response({"error": "Channel not found"}, status=400)

            if "panel_title" in data and data["panel_title"]:
                ticket_cfg["panel_title"] = data["panel_title"]
            if "panel_description" in data and data["panel_description"]:
                ticket_cfg["panel_description"] = data["panel_description"]
            if "panel_instructions" in data and data["panel_instructions"]:
                ticket_cfg["panel_instructions"] = data["panel_instructions"]
            
            slot_id = data.get("slot_id")
            slot_name = data.get("slot_name")
            send_full_panel = data.get("send_full_panel", False)
            matched_slot = None
            if (slot_id or slot_name) and not send_full_panel:
                for s in ticket_cfg.get("options_slots", []):
                    if isinstance(s, dict) and (str(s.get("id")) == str(slot_id) or s.get("name") == slot_name):
                        matched_slot = s
                        break

            panel_options = data.get("options") or data.get("options_slots") or ticket_cfg.get("options_slots", [])
            p_title = data.get("panel_title") or ticket_cfg.get("panel_title", "Support Ticket Desk")
            p_desc = data.get("panel_description") or ticket_cfg.get("panel_description", "Click the button below to open a direct support channel with our team.")
            p_instr = data.get("panel_instructions") or ticket_cfg.get("panel_instructions", "> Select your desired inquiry category in the dropdown menu below, then click **Create Ticket** to open your private channel.")

            p_color = ORBIT_COLOR
            raw_c = data.get("color")
            if raw_c:
                try:
                    if isinstance(raw_c, str) and raw_c.startswith("#"):
                        p_color = int(raw_c.lstrip("#"), 16)
                    elif isinstance(raw_c, str) and "rgb" in raw_c:
                        import re
                        m = re.findall(r"\d+", raw_c)
                        if len(m) >= 3:
                            p_color = discord.Color.from_rgb(int(m[0]), int(m[1]), int(m[2])).value
                except Exception:
                    pass

            if matched_slot and matched_slot.get("mode") != "panel" and not send_full_panel:
                s_name = matched_slot.get("name") or "Support Ticket"
                s_desc = matched_slot.get("description") or "Klicken Sie auf den Button unten, um ein Ticket oder Formular zu öffnen."
                btn_lbl = matched_slot.get("button_label") or s_name
                embed = discord.Embed(
                    title=s_name,
                    description=s_desc,
                    color=p_color
                )
                view = discord.ui.View(timeout=None)
                view.add_item(discord.ui.Button(
                    label=btn_lbl[:80],
                    style=discord.ButtonStyle.primary,
                    custom_id=f"orbit:ticket_opt:{s_name}"[:100]
                ))
                msg = await channel.send(embed=embed, view=view, allowed_mentions=discord.AllowedMentions.none())
            else:
                view = PersistentTicketPanelLayout(
                    title=p_title,
                    description=p_desc,
                    instructions=p_instr,
                    options_slots=panel_options
                )
                desc_text = f"{view.panel_desc}\n\n{view.panel_instructions}" if view.panel_instructions else view.panel_desc
                embed = discord.Embed(
                    title=view.panel_title,
                    description=desc_text,
                    color=p_color
                )
                msg = await channel.send(embed=embed, view=view, allowed_mentions=discord.AllowedMentions.none())

            ticket_cfg["panel_channel_id"] = channel.id
            ticket_cfg["panel_message_id"] = msg.id
            if panel_options:
                ticket_cfg["options_slots"] = panel_options
                ticket_cfg["options"] = [s.get("name", "Support") if isinstance(s, dict) else str(s) for s in panel_options]
            
            panel_id = data.get("panel_id")
            if panel_id and isinstance(ticket_cfg.get("ticket_panels"), list):
                for p in ticket_cfg["ticket_panels"]:
                    if isinstance(p, dict) and str(p.get("id")) == str(panel_id):
                        p["panel_channel_id"] = channel.id
                        p["panel_message_id"] = msg.id
                        break
            save_ticket_config(guild_id, ticket_cfg)
            
            return web.json_response({"success": True, "message_id": str(msg.id)})
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)


    async def api_action_send_embed(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        if not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild ID"}, status=400)
        guild_id = int(guild_id_str)
        
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild or not user_perms.get("can_channels"):
            return web.json_response({"error": "Unauthorized or missing Manage Channels permission"}, status=403)
            
        try:
            data = await request.json()
            channel_id = data.get("channel_id")
            if not channel_id:
                return web.json_response({"error": "No channel_id provided"}, status=400)
                
            channel = guild.get_channel(int(channel_id))
            if not channel:
                return web.json_response({"error": "Channel not found"}, status=400)
                
            mode = data.get("mode", "normal")
            components = data.get("components", [])
            content_text = data.get("content", "").strip()
            
            title = data.get("title", "").strip()
            desc = data.get("description", "").strip()
            url = data.get("url", "").strip()
            color = data.get("color", "")
            author_name = data.get("author_name", "").strip()
            author_icon = data.get("author_icon", "").strip()
            image = data.get("image", "").strip()
            thumbnail = data.get("thumbnail", "").strip()
            footer_text = data.get("footer_text", "").strip()
            footer_icon = data.get("footer_icon", "").strip()
            fields = data.get("fields", [])
            
            member_count = guild.member_count or len(guild.members)
            server_name = guild.name
            
            def replace_vars(text: str, target_user=None) -> str:
                if not text: return text
                u = target_user or guild.me
                text = text.replace("{user}", u.mention if u else "")
                text = text.replace("{user.mention}", u.mention if u else "")
                text = text.replace("{user.name}", u.name if u else "")
                text = text.replace("{user.id}", str(u.id) if u else "")
                text = text.replace("{user.avatar}", u.display_avatar.url if (u and getattr(u, "display_avatar", None)) else "")
                text = text.replace("{user.tag}", str(u) if u else "")
                text = text.replace("{username}", u.name if u else "")
                text = text.replace("{mention}", u.mention if u else "")
                text = text.replace("{id}", str(u.id) if u else "")
                text = text.replace("{user_globalname}", getattr(u, "global_name", None) or (u.display_name if u else ""))
                text = text.replace("{count}", str(member_count))
                text = text.replace("{server}", server_name)
                text = text.replace("{server.name}", server_name)
                text = text.replace("{server.id}", str(guild.id))
                text = text.replace("{server.members}", str(member_count))
                text = text.replace("{server.icon}", guild.icon.url if guild.icon else "")
                return text

            content_text = replace_vars(content_text)
            title = replace_vars(title)
            desc = replace_vars(desc)
            author_name = replace_vars(author_name)
            footer_text = replace_vars(footer_text)
            
            for f in fields:
                if "name" in f: f["name"] = replace_vars(f["name"])
                if "value" in f: f["value"] = replace_vars(f["value"])
            
            msg_kwargs = {}
            if content_text:
                msg_kwargs["content"] = content_text

            if mode == "components":
                from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button
                view = LayoutView(timeout=None)
                elements = []
                
                if author_name:
                    elements.append(TextDisplay(content=f"**{author_name}**"))
                if title:
                    elements.append(TextDisplay(content=f"### {title}"))
                if desc:
                    elements.append(TextDisplay(content=desc))
                    
                if fields:
                    if elements: elements.append(Separator(spacing=discord.SeparatorSpacing.small))
                    for f in fields:
                        fname = f.get("name", "").strip() or "​"
                        fvalue = f.get("value", "").strip() or "​"
                        elements.append(TextDisplay(content=f"**{fname}**\\n{fvalue}"))
                        
                if footer_text:
                    if elements: elements.append(Separator(spacing=discord.SeparatorSpacing.small))
                    elements.append(TextDisplay(content=f"-# {footer_text}"))
                    
                if elements:
                    view.add_item(Container(*elements))
                    
                if components:
                    for comp in components:
                        if comp.get("style") == 5:
                            url_str = comp.get("url")
                            label = comp.get("label", "Link")
                            if url_str and url_str.startswith("http"):
                                view.add_item(ActionRow(Button(style=discord.ButtonStyle.link, url=url_str, label=label)))
                                
                if len(view.children) > 0:
                    msg_kwargs["view"] = view
                    
                if not content_text and not elements:
                    return web.json_response({"error": "Message cannot be completely empty"}, status=400)
                    
                await channel.send(**msg_kwargs)
                return web.json_response({"success": True})
            else:
                embed = discord.Embed()
                if title: embed.title = title
                if desc: embed.description = desc
                if url: embed.url = url
                if color:
                    try: embed.color = discord.Color(int(color.replace("#", ""), 16))
                    except Exception: pass
                if author_name:
                    kwargs = {"name": author_name}
                    if author_icon: kwargs["icon_url"] = author_icon
                    embed.set_author(**kwargs)
                if image: embed.set_image(url=image)
                if thumbnail: embed.set_thumbnail(url=thumbnail)
                if footer_text:
                    kwargs = {"text": footer_text}
                    if footer_icon: kwargs["icon_url"] = footer_icon
                    embed.set_footer(**kwargs)
                for f in fields:
                    fname = f.get("name", "").strip() or "​"
                    fvalue = f.get("value", "").strip() or "​"
                    finline = f.get("inline", False)
                    embed.add_field(name=fname, value=fvalue, inline=finline)
                    
                if embed.title or embed.description or embed.author or embed.image or embed.footer or embed.fields:
                    msg_kwargs["embed"] = embed
                    
                if components:
                    view = discord.ui.View(timeout=None)
                    for comp in components:
                        if comp.get("style") == 5:
                            url_str = comp.get("url")
                            label = comp.get("label", "Link")
                            if url_str and url_str.startswith("http"):
                                view.add_item(discord.ui.Button(style=discord.ButtonStyle.link, url=url_str, label=label))
                    if len(view.children) > 0:
                        msg_kwargs["view"] = view
                        
                if not content_text and "embed" not in msg_kwargs:
                    return web.json_response({"error": "Message cannot be completely empty"}, status=400)
                    
                await channel.send(**msg_kwargs)
                return web.json_response({"success": True})
        except discord.Forbidden:
            return web.json_response({"error": "Bot missing permissions to send message in that channel"}, status=403)
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)


    async def api_action_test_dm(self, request: web.Request):
        from aiohttp import web
        guild_id_str = request.match_info.get("id")
        if not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild ID"}, status=400)
        guild_id = int(guild_id_str)
        
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild or not user_perms.get("can_channels"):
            return web.json_response({"error": "Unauthorized"}, status=403)
            
        try:
            data = await request.json()
            dm_type = data.get("type", "welcome")
            
            user = await self.get_user_session(request)
            user_id = user["id"] if user else None
            
            member = None
            if user_id:
                member = guild.get_member(int(user_id))
            
            if not member:
                return web.json_response({"error": "Could not find you in the server to DM."}, status=400)
            
            from Components.Systems.WelcomeGoodbye._views import format_welcome_string
            from Components.Systems.WelcomeGoodbye._views import format_goodbye_string
            import discord
            import re
            
            def replace_emoji(match):
                token = match.group(0)
                m_no_name = re.match(r'<(a?):(\d+)>', token)
                if m_no_name:
                    is_anim = m_no_name.group(1) == 'a'
                    eid = int(m_no_name.group(2))
                    em = discord.utils.get(guild.emojis, id=eid)
                    if em:
                        return str(em)
                    prefix = "a" if is_anim else ""
                    return f"<{prefix}:e:{eid}>"
                
                m_colon = re.match(r':([a-zA-Z0-9_-]+):', token)
                if m_colon:
                    key = m_colon.group(1)
                    if key.isdigit():
                        em = discord.utils.get(guild.emojis, id=int(key))
                        if em:
                            return str(em)
                        return f"<:e:{key}>"
                    else:
                        em = discord.utils.get(guild.emojis, name=key)
                        if em:
                            return str(em)
                return token

            if dm_type == "welcome":
                from Components.Systems.WelcomeGoodbye._storage import load_welcome_config
                config = load_welcome_config(guild_id)
                msg = (data.get("dm_message") if "dm_message" in data else config.get("dm_message", "")) or ""
                msg = msg.strip() or "👋 Welcome to {server}"
                formatted = format_welcome_string(msg, member)
                formatted = re.sub(r'<a?:(\d+)>|(?<!<):([a-zA-Z0-9_-]+):(?![\d>])', replace_emoji, formatted)
                if f"-# Sent from {guild.name}" not in formatted:
                    formatted = f"{formatted}\n-# Sent from {guild.name}"
                await member.send(formatted)
                    
            elif dm_type == "goodbye":
                from Components.Systems.WelcomeGoodbye._storage import load_goodbye_config
                config = load_goodbye_config(guild_id)
                msg = (data.get("dm_message") if "dm_message" in data else config.get("dm_message", "")) or ""
                msg = msg.strip() or "👋 You left {server}"
                formatted = format_goodbye_string(msg, member)
                formatted = re.sub(r'<a?:(\d+)>|(?<!<):([a-zA-Z0-9_-]+):(?![\d>])', replace_emoji, formatted)
                if f"-# Sent from {guild.name}" not in formatted:
                    formatted = f"{formatted}\n-# Sent from {guild.name}"
                await member.send(formatted)
                    
            return web.json_response({"success": True})
        except discord.Forbidden:
            return web.json_response({"error": "I cannot send DMs to you. Please enable DMs from server members."}, status=400)
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    async def api_action_test_welcome(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        if not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild ID"}, status=400)
        guild_id = int(guild_id_str)
        
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild or not user_perms.get("can_channels"):
            return web.json_response({"error": "Unauthorized"}, status=403)
            
        try:
            data = await request.json()
            test_type = data.get("type", "welcome")
            
            user = await self.get_user_session(request)
            user_id = user["id"] if user else None
            member = guild.get_member(int(user_id)) if user_id else None
            if not member:
                member = guild.me or (guild.get_member(self.bot.user.id) if self.bot.user else None)
            if not member:
                return web.json_response({"error": "Member not found in server."}, status=500)

            from Components.Systems.WelcomeGoodbye._storage import load_welcome_config, load_goodbye_config
            import asyncio

            if test_type == "welcome":
                cog = self.bot.get_cog("WelcomeListener")
                if not cog:
                    return web.json_response({"error": "Welcome module is not loaded."}, status=500)
                config = load_welcome_config(guild_id)
                if isinstance(data.get("config"), dict):
                    config.update(data["config"])
                if data.get("channel_id"):
                    config["channel_id"] = data["channel_id"]

                if not config.get("channel_id"):
                    return web.json_response({"error": "Please select a channel for the welcome message first."}, status=400)

                config["dm_enabled"] = False
                if hasattr(cog, "send_welcome"):
                    success, msg = await cog.send_welcome(member, config=config, force_test=True)
                    if not success:
                        return web.json_response({"error": msg}, status=400)
                    return web.json_response({"success": True, "message": msg})
                else:
                    await cog.on_member_join(member, override_config=config, force_test=True)
                    return web.json_response({"success": True, "message": "Test welcome sent."})

            elif test_type == "goodbye":
                cog = self.bot.get_cog("GoodbyeListener")
                if not cog:
                    return web.json_response({"error": "Goodbye module is not loaded."}, status=500)
                config = load_goodbye_config(guild_id)
                if isinstance(data.get("config"), dict):
                    config.update(data["config"])
                if data.get("channel_id"):
                    config["channel_id"] = data["channel_id"]

                if not config.get("channel_id"):
                    return web.json_response({"error": "Please select a channel for the goodbye message first."}, status=400)

                config["dm_enabled"] = False
                if hasattr(cog, "send_goodbye"):
                    success, msg = await cog.send_goodbye(member, config=config, force_test=True)
                    if not success:
                        return web.json_response({"error": msg}, status=400)
                    return web.json_response({"success": True, "message": msg})
                else:
                    await cog.on_member_remove(member, override_config=config, force_test=True)
                    return web.json_response({"success": True, "message": "Test goodbye sent."})

            elif test_type == "boost":
                cog = self.bot.get_cog("BoostListener")
                if not cog:
                    return web.json_response({"error": "Boost module is not loaded."}, status=500)
                from Components.Commands.Boost._storage import load_boost_config
                config = load_boost_config(guild_id)
                if data.get("channel_id"):
                    config["channel_id"] = data["channel_id"]
                if not config.get("channel_id"):
                    return web.json_response({"error": "No boost channel is configured and saved."}, status=400)
                cog._recent_boosts.pop((guild.id, member.id), None)
                await cog._handle_boost(guild, member)
                return web.json_response({"success": True, "message": "Test boost message sent."})
            else:
                return web.json_response({"error": f"Unknown test type: {test_type}"}, status=400)
                
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    async def api_action_test_levelup(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        if not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild ID"}, status=400)
        guild_id = int(guild_id_str)
        
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild or not user_perms.get("can_channels"):
            return web.json_response({"error": "Unauthorized or missing Manage Channels permission"}, status=403)
            
        try:
            data = await request.json()
            channel_id = data.get("channel_id")
            
            target_ch = None
            if channel_id and channel_id != "current":
                target_ch = guild.get_channel(int(channel_id))
            
            if not target_ch:
                target_ch = next((ch for ch in guild.text_channels if ch.permissions_for(guild.me).send_messages), None)
                
            if not target_ch:
                return web.json_response({"error": "No valid channel found to send the test message"}, status=400)
                
            import discord
            import re
            
            member = guild.me
            
            content = data.get("message", "{user_mention}")
            title = data.get("embed_title", " Level Up!")
            desc = data.get("embed_description", "")
            author = data.get("embed_author", "")
            footer = data.get("embed_footer", "")
            image = data.get("embed_image", "")
            show_avatar = data.get("show_avatar", True)
            
            def replace_vars(text):
                text = text.replace("{user_mention}", member.mention)
                text = text.replace("{user_globalname}", member.global_name or member.display_name)
                text = text.replace("{level}", "99")
                text = text.replace("{roles}", "None")
                return text
                
            content = replace_vars(content)
            title = replace_vars(title)
            desc = replace_vars(desc)
            
            embed = discord.Embed(title=title, description=desc, color=0x3B82F6)
            if author:
                embed.set_author(name=replace_vars(author))
            if footer:
                embed.set_footer(text=replace_vars(footer))
            if image:
                embed.set_image(url=image)
            if show_avatar:
                embed.set_thumbnail(url=member.display_avatar.url)
                
            await target_ch.send(content=content if content else None, embed=embed)
            
            return web.json_response({"success": True})
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    async def api_get_recent_appeals(self, request: web.Request):
        guild_id = int(request.match_info["id"])
        guild, perms = await self._check_guild_access(request, guild_id)
        if not guild: return web.json_response({"error": "Unauthorized"}, status=401)
        
        from Components.Systems.BanAppeals._storage import get_open_appeals
        appeals = get_open_appeals(guild_id)
        return web.json_response(appeals)

    async def api_resolve_appeal(self, request: web.Request):
        guild_id = int(request.match_info["id"])
        guild, perms = await self._check_guild_access(request, guild_id)
        if not guild: return web.json_response({"error": "Unauthorized"}, status=401)
        
        data = await request.json()
        user_id = data.get("user_id")
        action = data.get("action")
        if not user_id or action not in ["accept", "decline"]:
            return web.json_response({"error": "Invalid payload"}, status=400)
            
        session = await self.get_user_session(request)
        user_discord_id = int(session["id"])
        
        from Components.Systems.BanAppeals._storage import load_appeals_config
        cfg = load_appeals_config(guild_id)
        
        member = guild.get_member(user_discord_id)
        if not member:
            try:
                member = await guild.fetch_member(user_discord_id)
            except:
                pass
                
        mod_name = "a Moderator"
        if not cfg.get("anonymous_mods", False) and member:
            mod_name = member.name
            
        from Components.Systems.BanAppeals.appeals import resolve_appeal_logic
        is_accept = (action == "accept")
        success, msg = await resolve_appeal_logic(
            self.bot, 
            guild_id, 
            int(user_id), 
            user_discord_id, 
            is_accept, 
            mod_name
        )
        
        if success:
            return web.json_response({"success": True, "message": msg})
        else:
            return web.json_response({"error": msg}, status=400)

    async def api_get_messages(self, request: web.Request):
        user = await self.get_user_session(request)
        if not user: return web.json_response({"error": "Unauthorized"}, status=401)
        guild_id = int(request.match_info['id'])
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild:
            return web.json_response({"error": "Forbidden"}, status=403)
            
        from Components.Database.mongodb import get_db
        db = get_db()
        cursor = db["CustomMessages"].find({"guild_id": str(guild_id)}, {"_id": 0})
        messages = list(cursor)
        return web.json_response(messages)
        
    async def api_action_send_honeypot(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        if not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild ID"}, status=400)
        guild_id = int(guild_id_str)
        
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild or not user_perms.get("can_channels"):
            return web.json_response({"error": "Unauthorized or missing Manage Channels permission"}, status=403)
            
        try:
            data = await request.json()
            channel_id = data.get("channel_id")
            if not channel_id:
                return web.json_response({"error": "No channel_id provided"}, status=400)
                
            channel = guild.get_channel(int(channel_id))
            if not channel:
                return web.json_response({"error": "Channel not found in this guild"}, status=404)
                
            msg_mode = data.get("msg_mode", "message")
            
            from Components.Commands.ChannelAutomation._storage import load_automation_config, save_automation_config
            config = load_automation_config(guild_id)
            auto_ban_cfg = config.get("auto_ban", {})
            ban_count = auto_ban_cfg.get("ban_count", 0)
            
            action = data.get("action")
            if not isinstance(action, str) or not action:
                action = "softban"
            action_label = action.capitalize() + "s"
            
            content_kw = {}
            if msg_mode == "embed":
                embed_title = data.get("embed_title") or "DO NOT SEND MESSAGES IN THIS CHANNEL"
                embed_desc = data.get("embed_description") or "This channel is used to catch spam bots. Any messages sent here will result in a **softban**."
                embed_color = data.get("embed_color") or "#EF4444"
                embed_thumb = data.get("embed_thumbnail") or ""
                
                try:
                    color_val = int(str(embed_color).lstrip('#'), 16)
                except ValueError:
                    color_val = 0xEF4444
                    
                embed = discord.Embed(title=embed_title, description=embed_desc, color=color_val)
                if embed_thumb:
                    try:
                        embed.set_thumbnail(url=str(embed_thumb))
                    except Exception:
                        pass
                    
                view = discord.ui.View()
                view.add_item(discord.ui.Button(label=f"{action_label}: {ban_count:,}", emoji="🍯", disabled=True, style=discord.ButtonStyle.secondary))
                
                content_kw["embed"] = embed
                content_kw["view"] = view
            else:
                message_template = data.get("message")
                if not message_template:
                    return web.json_response({"error": "No message provided"}, status=400)
                content_kw["content"] = str(message_template).replace("{count}", str(ban_count))
                
            msg = await channel.send(**content_kw)
            
            auto_ban_cfg["message_id"] = str(msg.id)
            config["auto_ban"] = auto_ban_cfg
            save_automation_config(guild_id, config)
            
            return web.json_response({"success": True})
        except discord.Forbidden:
            return web.json_response({"error": "Bot lacks permission to send messages in that channel"}, status=403)
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    async def api_save_message(self, request: web.Request):
        user = await self.get_user_session(request)
        if not user: return web.json_response({"error": "Unauthorized"}, status=401)
        guild_id = int(request.match_info['id'])
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild:
            return web.json_response({"error": "Forbidden"}, status=403)
            
        try:
            data = await request.json()
            import uuid
            msg_id = data.get("id")
            if not msg_id:
                msg_id = str(uuid.uuid4())
                data["id"] = msg_id
                
            data["guild_id"] = str(guild_id)
            if not data.get("name"):
                data["name"] = "Untitled Message"
            
            from Components.Database.mongodb import get_db
            db = get_db()
            db["CustomMessages"].replace_one({"id": msg_id, "guild_id": str(guild_id)}, data, upsert=True)
            return web.json_response({"success": True, "id": msg_id})
        except Exception as e:
            return web.json_response({"error": str(e)}, status=400)
            
    async def api_delete_message(self, request: web.Request):
        user = await self.get_user_session(request)
        if not user: return web.json_response({"error": "Unauthorized"}, status=401)
        guild_id = int(request.match_info['id'])
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild:
            return web.json_response({"error": "Forbidden"}, status=403)
            
        msg_id = request.match_info['msg_id']
        from Components.Database.mongodb import get_db
        db = get_db()
        db["CustomMessages"].delete_one({"id": msg_id, "guild_id": str(guild_id)})
        return web.json_response({"success": True})

    async def api_get_reactionroles(self, request: web.Request):
        user = await self.get_user_session(request)
        if not user: return web.json_response({"error": "Unauthorized"}, status=401)
        guild_id = int(request.match_info['id'])
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild: return web.json_response({"error": "Forbidden"}, status=403)
        from Components.Systems.Roles.reaction_panels import load_reaction_roles
        return web.json_response(load_reaction_roles(guild_id))

    def _resolve_discord_emoji(self, guild: discord.Guild, emoji_val: str):
        if not emoji_val or not isinstance(emoji_val, str):
            return None
        emoji_str = emoji_val.strip()
        if not emoji_str:
            return None

        import re
        # Custom emoji <:name:id> or <a:name:id>
        match = re.match(r"^<(a?):([a-zA-Z0-9_]+):(\d+)>$", emoji_str)
        if match:
            is_anim = bool(match.group(1))
            e_name = match.group(2)
            e_id = int(match.group(3))
            return discord.PartialEmoji(name=e_name, id=e_id, animated=is_anim)

        # Pure emoji ID
        if emoji_str.isdigit():
            e_id = int(emoji_str)
            return self.bot.get_emoji(e_id) or discord.PartialEmoji(name="emoji", id=e_id)

        # Shortcodes like :moyai:
        if emoji_str.startswith(":") and emoji_str.endswith(":") and len(emoji_str) > 2:
            raw_name = emoji_str[1:-1].lower()
            if guild:
                custom_e = discord.utils.find(lambda e: e.name.lower() == raw_name, guild.emojis)
                if custom_e:
                    return custom_e
            global_e = discord.utils.find(lambda e: e.name.lower() == raw_name, self.bot.emojis)
            if global_e:
                return global_e

            SHORTCODES = {
                "moyai": "🗿", "skull": "💀", "fire": "🔥", "heart": "❤️", "star": "⭐",
                "check": "✅", "white_check_mark": "✅", "x": "❌", "warning": "⚠️",
                "tada": "🎉", "sparkles": "✨", "wave": "👋", "thumbsup": "👍", "+1": "👍",
                "thumbsdown": "👎", "-1": "👎", "eyes": "👀", "100": "💯", "rocket": "🚀",
                "bell": "🔔", "video_game": "🎮", "game": "🎮", "shield": "🛡️", "crown": "👑",
                "gem": "💎", "gift": "🎁", "loudspeaker": "📢", "mega": "📣", "question": "❓",
                "red_circle": "🔴", "blue_circle": "🔵", "green_circle": "🟢", "yellow_circle": "🟡",
                "purple_circle": "🟣", "white_circle": "⚪", "black_circle": "⚫"
            }
            if raw_name in SHORTCODES:
                return SHORTCODES[raw_name]

            import unicodedata
            try:
                char = unicodedata.lookup(raw_name.replace("_", " ").upper())
                return char
            except Exception:
                pass
            return None

        # Unicode character
        return emoji_str

    def _build_reactionrole_v2_view(self, guild, panel_id: str, title: str, description: str, emb_color: discord.Color, components: list, mode: str):
        if not HAS_V2:
            return None
        view = LayoutView(timeout=None)

        action_rows = []
        current_buttons = []

        for idx, comp in enumerate(components):
            role_id = comp.get("role_id")
            if not role_id:
                continue
            color_str = comp.get("color", "blue")
            style = discord.ButtonStyle.primary
            if color_str in ("gray", "grey", "secondary"):
                style = discord.ButtonStyle.secondary
            elif color_str in ("green", "success"):
                style = discord.ButtonStyle.success
            elif color_str in ("red", "danger"):
                style = discord.ButtonStyle.danger

            custom_id = f"rr_{panel_id}_{role_id}_{mode}"
            btn_kwargs = {
                "style": style,
                "label": comp.get("label") or "Role",
                "custom_id": custom_id
            }
            if comp.get("emoji"):
                resolved_e = self._resolve_discord_emoji(guild, comp.get("emoji"))
                if resolved_e:
                    btn_kwargs["emoji"] = resolved_e

            btn = discord.ui.Button(**btn_kwargs)
            current_buttons.append(btn)
            if len(current_buttons) == 5:
                action_rows.append(ActionRow(*current_buttons))
                current_buttons = []

        if current_buttons:
            action_rows.append(ActionRow(*current_buttons))

        card_title = f"# {title}" if title else "# Role Selection"
        card_body = f"{card_title}\n\n{description}".strip() if description else card_title

        container = Container(
            TextDisplay(content=card_body),
            *action_rows,
            accent_color=emb_color
        )
        view.add_item(container)
        return view

    async def api_save_reactionrole(self, request: web.Request):
        user = await self.get_user_session(request)
        if not user: return web.json_response({"error": "Unauthorized"}, status=401)
        guild_id = int(request.match_info['id'])
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild: return web.json_response({"error": "Forbidden"}, status=403)
        try:
            data = await request.json()
            import uuid
            msg_id = data.get("id")
            if not msg_id:
                msg_id = str(uuid.uuid4())
                data["id"] = msg_id
            data["guild_id"] = str(guild_id)
            if not data.get("name"): data["name"] = "Untitled Reaction Role"
            from Components.Systems.Roles.reaction_panels import save_reaction_role

            panel_type = data.get("panel_type", "buttons")
            mode = data.get("mode", "multi")
            post_to_discord = data.get("post_to_discord", False)
            channel_id_str = data.get("channel_id")
            msg_sent_id = None

            if post_to_discord and channel_id_str:
                channel = self.bot.get_channel(int(channel_id_str))
                if channel:
                    import discord
                    embed_data = data.get("embed", {})
                    color_hex = embed_data.get("color", "#5865F2") or "#5865F2"
                    try:
                        emb_color = discord.Color.from_str(color_hex)
                    except Exception:
                        emb_color = discord.Color(0x5865F2)

                    title = embed_data.get("title") or "Reaction Role"
                    description = embed_data.get("description") or ""

                    embed = discord.Embed(
                        title=title,
                        description=description,
                        color=emb_color
                    )

                    components = data.get("components", [])

                    if panel_type == "reactions":
                        if not description:
                            role_lines = []
                            for comp in components:
                                rid = comp.get("role_id")
                                if rid:
                                    em = comp.get("emoji") or "▫️"
                                    lbl = comp.get("label") or ""
                                    lbl_str = f" - **{lbl}**" if lbl and lbl != "Role" and lbl != "New Role" else ""
                                    role_lines.append(f"{em}  <@&{rid}>{lbl_str}")
                            embed.description = "\n".join(role_lines)

                        try:
                            msg = await channel.send(embed=embed)
                            msg_sent_id = str(msg.id)
                            data["message_id"] = msg_sent_id
                            data["msg_id"] = msg_sent_id

                            for comp in components:
                                emoji_raw = comp.get("emoji")
                                if emoji_raw:
                                    resolved = self._resolve_discord_emoji(guild, emoji_raw)
                                    if resolved:
                                        try:
                                            await msg.add_reaction(resolved)
                                        except Exception:
                                            pass
                        except discord.Forbidden:
                            return web.json_response({"error": "Bot does not have permission to send messages or add reactions in that channel."}, status=403)
                        except Exception as e:
                            return web.json_response({"error": f"Failed to send to Discord: {str(e)}"}, status=400)

                    else:
                        # Buttons mode - components v2 container (like calculator, giveaway, poll) with fallback
                        msg = None
                        if HAS_V2:
                            try:
                                v2_view = self._build_reactionrole_v2_view(guild, msg_id, title, description, emb_color, components, mode)
                                if v2_view:
                                    msg = await channel.send(view=v2_view)
                            except Exception as v2_err:
                                print(f"[ReactionRoles] Components V2 send failed: {v2_err}, falling back to standard embed.")

                        if not msg:
                            view = discord.ui.View(timeout=None)
                            for idx, comp in enumerate(components):
                                role_id = comp.get("role_id")
                                if not role_id: continue
                                color_str = comp.get("color", "blue")
                                style = discord.ButtonStyle.primary
                                if color_str in ("gray", "grey", "secondary"):
                                    style = discord.ButtonStyle.secondary
                                elif color_str in ("green", "success"):
                                    style = discord.ButtonStyle.success
                                elif color_str in ("red", "danger"):
                                    style = discord.ButtonStyle.danger

                                custom_id = f"rr_{msg_id}_{role_id}_{mode}"
                                btn_kwargs = {
                                    "style": style,
                                    "label": comp.get("label") or "Role",
                                    "custom_id": custom_id,
                                    "row": min(idx // 5, 4)
                                }
                                if comp.get("emoji"):
                                    resolved_e = self._resolve_discord_emoji(guild, comp.get("emoji"))
                                    if resolved_e:
                                        btn_kwargs["emoji"] = resolved_e

                                view.add_item(discord.ui.Button(**btn_kwargs))

                            try:
                                msg = await channel.send(embed=embed, view=view if len(view.children) > 0 else None)
                            except discord.Forbidden:
                                return web.json_response({"error": "Bot does not have permission to send messages in that channel."}, status=403)
                            except Exception as e:
                                return web.json_response({"error": f"Failed to send to Discord: {str(e)}"}, status=400)

                        msg_sent_id = str(msg.id)
                        data["message_id"] = msg_sent_id
                        data["msg_id"] = msg_sent_id

            save_reaction_role(guild_id, data)
            return web.json_response({"success": True, "id": msg_id, "msg_id": msg_sent_id, "message_id": msg_sent_id})
        except Exception as e:
            import traceback
            traceback.print_exc()
            return web.json_response({"error": str(e)}, status=400)

    async def api_delete_reactionrole(self, request: web.Request):
        user = await self.get_user_session(request)
        if not user: return web.json_response({"error": "Unauthorized"}, status=401)
        guild_id = int(request.match_info['id'])
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild: return web.json_response({"error": "Forbidden"}, status=403)
        msg_id = request.match_info['msg_id']
        from Components.Systems.Roles.reaction_panels import delete_reaction_role
        delete_reaction_role(guild_id, msg_id)
        return web.json_response({"success": True})
        
    async def api_action_send_reactionrole(self, request: web.Request):
        user = await self.get_user_session(request)
        if not user: return web.json_response({"error": "Unauthorized"}, status=401)
        guild_id = int(request.match_info['id'])
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild or not user_perms.get("can_channels"):
            return web.json_response({"error": "Unauthorized or missing Manage Channels permission"}, status=403)
        try:
            req_data = await request.json()
            panel_id = req_data.get("id")
            channel_id = req_data.get("channel_id")
            if not channel_id: return web.json_response({"error": "No channel_id provided"}, status=400)
            channel = guild.get_channel(int(channel_id))
            if not channel: return web.json_response({"error": "Channel not found"}, status=404)
            
            from Components.Systems.Roles.reaction_panels import load_reaction_roles
            rrs = load_reaction_roles(guild_id)
            rr = next((r for r in rrs if r.get("id") == panel_id), None)
            if not rr: return web.json_response({"error": "Reaction Role not found in database"}, status=404)
            
            import discord
            content = rr.get("content", "")
            embed_data = rr.get("embed", {})
            title = embed_data.get("title", "")
            desc = embed_data.get("description", "")
            url = embed_data.get("url", "")
            color = embed_data.get("color", "#5865F2")
            
            embed = discord.Embed()
            if title: embed.title = title
            if desc: embed.description = desc
            if url: embed.url = url
            if color:
                try: embed.color = discord.Color.from_str(color)
                except Exception: pass

            components = rr.get("components", [])
            panel_type = rr.get("panel_type", "buttons")
            mode = rr.get("mode", "multi")

            if panel_type == "reactions":
                if not desc:
                    role_lines = []
                    for comp in components:
                        rid = comp.get("role_id")
                        if rid:
                            em = comp.get("emoji") or "▫️"
                            lbl = comp.get("label") or ""
                            lbl_str = f" - **{lbl}**" if lbl and lbl != "Role" and lbl != "New Role" else ""
                            role_lines.append(f"{em}  <@&{rid}>{lbl_str}")
                    embed.description = "\n".join(role_lines)

                msg_kwargs = {}
                if embed.title or embed.description: msg_kwargs["embed"] = embed
                if content: msg_kwargs["content"] = content
                if not msg_kwargs:
                    return web.json_response({"error": "Message cannot be empty"}, status=400)

                msg = await channel.send(**msg_kwargs)

                for comp in components:
                    emoji_raw = comp.get("emoji")
                    if emoji_raw:
                        resolved = self._resolve_discord_emoji(guild, emoji_raw)
                        if resolved:
                            try:
                                await msg.add_reaction(resolved)
                            except Exception:
                                pass
            else:
                msg = None
                if HAS_V2:
                    try:
                        emb_color = getattr(embed, "color", discord.Color(0x5865F2)) or discord.Color(0x5865F2)
                        v2_view = self._build_reactionrole_v2_view(guild, panel_id, title, desc, emb_color, components, mode)
                        if v2_view:
                            msg = await channel.send(view=v2_view)
                    except Exception as v2_err:
                        print(f"[ReactionRoles] Components V2 post failed: {v2_err}, falling back to standard embed.")

                if not msg:
                    view = discord.ui.View(timeout=None)
                    for idx, btn in enumerate(components):
                        role_id = btn.get("role_id")
                        if not role_id: continue
                        label = btn.get("label", "Role")
                        color_str = btn.get("color", "blue")
                        
                        style = discord.ButtonStyle.primary
                        if color_str in ("gray", "grey", "secondary"): style = discord.ButtonStyle.secondary
                        elif color_str in ("green", "success"): style = discord.ButtonStyle.success
                        elif color_str in ("red", "danger"): style = discord.ButtonStyle.danger
                        
                        custom_id = f"rr_{panel_id}_{role_id}_{mode}"
                        kwargs = {
                            "style": style,
                            "label": label,
                            "custom_id": custom_id,
                            "row": min(idx // 5, 4)
                        }
                        if btn.get("emoji"):
                            resolved_e = self._resolve_discord_emoji(guild, btn.get("emoji"))
                            if resolved_e:
                                kwargs["emoji"] = resolved_e
                        view.add_item(discord.ui.Button(**kwargs))

                    msg_kwargs = {}
                    if embed.title or embed.description: msg_kwargs["embed"] = embed
                    if content: msg_kwargs["content"] = content
                    if len(view.children) > 0:
                        msg_kwargs["view"] = view
                    if not msg_kwargs:
                        return web.json_response({"error": "Message cannot be empty"}, status=400)
                        
                    msg = await channel.send(**msg_kwargs)
            
            rr["message_id"] = str(msg.id)
            rr["msg_id"] = str(msg.id)
            rr["channel_id"] = str(channel_id)
            from Components.Systems.Roles.reaction_panels import save_reaction_role
            save_reaction_role(guild_id, rr)
            
            return web.json_response({"success": True, "message_id": str(msg.id), "msg_id": str(msg.id)})
        except discord.Forbidden:
            return web.json_response({"error": "Bot missing permissions to send message in that channel"}, status=403)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return web.json_response({"error": str(e)}, status=500)

    async def api_upload_image(self, request: web.Request):
        user = await self.get_user_session(request)
        if not user:
            return web.json_response({"error": "Unauthorized"}, status=401)

        try:
            import uuid, pathlib, mimetypes
            reader = await request.multipart()
            field = await reader.next()
            if not field or field.name != "file":
                return web.json_response({"error": "No file field"}, status=400)

            content_type = field.headers.get("Content-Type", "image/png")
            ext = mimetypes.guess_extension(content_type) or ".png"
            if ext == ".jpe":
                ext = ".jpg"

            file_bytes = b""
            while True:
                chunk = await field.read_chunk(8192)
                if not chunk:
                    break
                file_bytes += chunk

            from Components.Database.cloudinary_storage import upload_image_bytes
            import asyncio
            url = await asyncio.to_thread(upload_image_bytes, file_bytes, "Orbit")
            
            if url:
                return web.json_response({"success": True, "url": url})
            else:
                import base64
                b64 = base64.b64encode(file_bytes).decode("ascii")
                data_url = f"data:{content_type};base64,{b64}"
                return web.json_response({"success": True, "url": data_url})
        except Exception as e:
            return web.json_response({"error": str(e)}, status=400)

    async def api_action_setup_serverstats(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        if not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild ID"}, status=400)
        guild_id = int(guild_id_str)
        
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild:
            return web.json_response({"error": "Unauthorized or not found"}, status=403)
            
        try:
            cog = self.bot.get_cog("ServerStats")
            if not cog:
                from Components.Commands.ServerStats.serverstats import ServerStats
                cog = ServerStats(self.bot)
            
            updated_config = await cog.sync_guild_stats(guild)
            return web.json_response({"success": True, "config": updated_config})
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    async def api_support_invite(self, request: web.Request):
        return web.json_response({"url": "https://discord.gg/wekuhwCsUg"})

    async def handle_appeal_page(self, request: web.Request):
        return web.Response(text=self._render_template(os.path.join("Web", "appeal_page.html")), content_type="text/html")

    async def api_appeal_info(self, request: web.Request):
        custom_url = request.match_info.get("custom_url")
        from Components.Systems.BanAppeals._storage import get_appeals_config_by_url
        cfg = get_appeals_config_by_url(custom_url)
        if not cfg:
            return web.json_response({"error": "Not found"}, status=404)
        
        guild = self.bot.get_guild(int(cfg["_id"]))
        if not guild:
            return web.json_response({"error": "Server not found"}, status=404)
            
        return web.json_response({
            "guild_name": guild.name,
            "guild_icon": guild.icon.url if guild.icon else None,
            "allowed_punishments": cfg.get("allowed_punishments", []),
            "questions": cfg.get("questions", ["Why should your punishment be revoked?"])
        })

    async def api_submit_appeal(self, request: web.Request):
        session = await self.get_user_session(request)
        if not session:
            return web.json_response({"error": "Unauthorized"}, status=401)
            
        custom_url = request.match_info.get("custom_url")
        from Components.Systems.BanAppeals._storage import get_appeals_config_by_url
        cfg = get_appeals_config_by_url(custom_url)
        if not cfg:
            return web.json_response({"error": "Not found"}, status=404)
            
        try:
            data = await request.json()
            reason = data.get("reason", "")
            
            from Components.Systems.BanAppeals.appeals import process_new_appeal
            success, msg = await process_new_appeal(self.bot, int(cfg["_id"]), int(session["id"]), reason, cfg)
            
            if success:
                return web.json_response({"success": True})
            else:
                return web.json_response({"error": msg}, status=400)
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)


    async def handle_api_captcha(self, request: web.Request):
        token = request.match_info.get("token")
        if not token or token not in WEB_VERIFY_SESSIONS:
            return web.json_response({"error": "Invalid or expired token"}, status=400)
            
        try:
            session = WEB_VERIFY_SESSIONS[token]
            guild = self.bot.get_guild(session.get("guild_id"))
            guild_name = guild.name if guild else "Server Verification"
            
            from Components.Systems.Verify._captcha import generate_captcha
            import base64
            code, img_bytes = generate_captcha()
            WEB_VERIFY_SESSIONS[token]["code"] = code.strip().upper()
            
            accept = request.headers.get("Accept", "")
            if "image" in accept and "application/json" not in accept:
                return web.Response(body=img_bytes, content_type="image/png")
                
            b64_img = base64.b64encode(img_bytes).decode("utf-8")
            return web.json_response({
                "guild_name": guild_name,
                "is_captcha": True,
                "captcha_image": f"data:image/png;base64,{b64_img}"
            })
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    async def handle_api_verify(self, request: web.Request):
        token = request.match_info.get("token")
        if not token or token not in WEB_VERIFY_SESSIONS:
            return web.json_response({"error": "Invalid or expired token"}, status=400)
            
        try:
            data = await request.json()
            user_code = str(data.get("code") or data.get("solution") or "").strip().upper()
            session = WEB_VERIFY_SESSIONS[token]
            
            expected_code = session.get("code")
            if expected_code and expected_code != "OK" and user_code != expected_code.upper():
                return web.json_response({"error": "Incorrect code"}, status=400)
                
            guild_id = session["guild_id"]
            user_id = session["user_id"]
            role_id = session["role_id"]
            remove_role_id = session.get("remove_role_id")
            
            client_ip = request.headers.get("X-Forwarded-For", request.remote)
            if client_ip:
                client_ip = client_ip.split(",")[0].strip()
                
            verify_cfg = load_verify_config(guild_id)
            verified_ips = verify_cfg.get("verified_ips", [])
            
            is_blocked = False
            already_linked = False
            
            if client_ip:
                for entry in verified_ips:
                    if isinstance(entry, dict) and entry.get("ip") == client_ip:
                        if entry.get("user_id") != user_id:
                            is_blocked = True
                        else:
                            already_linked = True
                        break
                    elif isinstance(entry, str) and entry == client_ip:
                        is_blocked = True
                        break
            
            if is_blocked:
                return web.json_response({"error": "An account has already been verified from this IP address in this server."}, status=400)
            
            guild = self.bot.get_guild(guild_id)
            if not guild:
                return web.json_response({"error": "Guild not found"}, status=400)
                
            member = guild.get_member(user_id)
            if not member:
                return web.json_response({"error": "You must be in the server to verify"}, status=400)
                
            role = guild.get_role(role_id)
            if role:
                await member.add_roles(role, reason="Web CAPTCHA verification")
                if remove_role_id:
                    rem_role = guild.get_role(remove_role_id)
                    if rem_role and rem_role in member.roles:
                        try:
                            await member.remove_roles(rem_role, reason="Web CAPTCHA verification")
                        except Exception:
                            pass
                remove_pending_kick(guild_id, user_id)
                del WEB_VERIFY_SESSIONS[token]
                
                if client_ip and not already_linked:
                    verified_ips.append({"ip": client_ip, "user_id": user_id})
                    verify_cfg["verified_ips"] = verified_ips
                    save_verify_config(guild_id, verify_cfg)
                    
                return web.json_response({"success": True})
            else:
                return web.json_response({"error": "Verification role not found in server"}, status=400)
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)


    async def api_get_recent_appeals(self, request: web.Request):
        guild_id = int(request.match_info["id"])
        guild, perms = await self._check_guild_access(request, guild_id)
        if not guild: return web.json_response({"error": "Unauthorized"}, status=401)
        
        from Components.Systems.BanAppeals._storage import get_open_appeals
        appeals = get_open_appeals(guild_id)
        return web.json_response(appeals)

    async def api_resolve_appeal(self, request: web.Request):
        guild_id = int(request.match_info["id"])
        guild, perms = await self._check_guild_access(request, guild_id)
        if not guild: return web.json_response({"error": "Unauthorized"}, status=401)
        
        data = await request.json()
        user_id = data.get("user_id")
        action = data.get("action")
        if not user_id or action not in ["accept", "decline"]:
            return web.json_response({"error": "Invalid payload"}, status=400)
            
        session = await self.get_user_session(request)
        user_discord_id = int(session["id"])
        
        from Components.Systems.BanAppeals._storage import load_appeals_config
        cfg = load_appeals_config(guild_id)
        
        member = guild.get_member(user_discord_id)
        if not member:
            try:
                member = await guild.fetch_member(user_discord_id)
            except:
                pass
                
        mod_name = "a Moderator"
        if not cfg.get("anonymous_mods", False) and member:
            mod_name = member.name
            
        from Components.Systems.BanAppeals.appeals import resolve_appeal_logic
        is_accept = (action == "accept")
        success, msg = await resolve_appeal_logic(
            self.bot, 
            guild_id, 
            int(user_id), 
            user_discord_id, 
            is_accept, 
            mod_name
        )
        
        if success:
            return web.json_response({"success": True, "message": msg})
        else:
            return web.json_response({"error": msg}, status=400)

    async def api_action_post_invite_leaderboard(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        if not guild_id_str or not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild ID"}, status=400)
        guild_id = int(guild_id_str)

        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild or not (user_perms.get("can_channels") or user_perms.get("is_admin")):
            return web.json_response({"error": "Unauthorized"}, status=403)

        try:
            import time
            from Components.Database.mongodb import get_config, set_config
            from Components.Commands.Invite.invitelistener import build_invite_leaderboard_embed

            data = await request.json()
            inv_cfg = get_config("InviteConfig", guild_id) or {}
            auto_post = inv_cfg.get("auto_post") or {}
            if isinstance(data, dict):
                for k in ["enabled", "channel_id", "title", "color", "interval", "top_limit", "show_podium", "show_numbers"]:
                    if k in data:
                        auto_post[k] = data[k]

            cid = auto_post.get("channel_id")
            if not cid or not str(cid).isdigit():
                return web.json_response({"error": "Bitte wähle zuerst einen Kanal aus."}, status=400)

            channel = guild.get_channel(int(cid))
            if not channel:
                return web.json_response({"error": "Kanal wurde auf dem Server nicht gefunden."}, status=404)

            embed = build_invite_leaderboard_embed(
                guild,
                self.bot,
                auto_post,
                show_inviter_count=bool(inv_cfg.get("show_inviter_count", True))
            )
            msg = await channel.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

            auto_post["last_posted_at"] = time.time()
            auto_post["last_message_id"] = str(msg.id)
            inv_cfg["auto_post"] = auto_post
            set_config("InviteConfig", guild_id, inv_cfg)

            return web.json_response({"success": True, "message_id": str(msg.id)})
        except discord.Forbidden:
            return web.json_response({"error": "Dem Bot fehlen die Berechtigungen, um in diesem Kanal Nachrichten zu senden."}, status=403)
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    async def api_action_create_invite_source(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        if not guild_id_str or not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild ID"}, status=400)
        guild_id = int(guild_id_str)

        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild or not (user_perms.get("can_channels") or user_perms.get("is_admin")):
            return web.json_response({"error": "Unauthorized"}, status=403)

        try:
            import time
            from Components.Database.mongodb import get_config, set_config
            from Components.Commands.Invite._storage import refresh_invite_cache

            data = await request.json()
            name = str(data.get("name") or "YouTube").strip()[:40]
            color = str(data.get("color") or "rgb(239, 68, 68)").strip()
            channel_id = str(data.get("channel_id") or "").strip()
            custom_code = str(data.get("code") or "").strip()

            target_channel = None
            if channel_id and channel_id.isdigit():
                target_channel = guild.get_channel(int(channel_id))
            if not target_channel and guild.text_channels:
                target_channel = guild.text_channels[0]

            if not target_channel:
                return web.json_response({"error": "Kein gültiger Textkanal für den Einladungslink gefunden."}, status=400)

            invite_code = custom_code
            if not invite_code:
                try:
                    inv = await target_channel.create_invite(
                        max_age=0,
                        max_uses=0,
                        unique=True,
                        reason=f"Orbit Quellen-Tracker: {name}"
                    )
                    invite_code = inv.code
                    await refresh_invite_cache(guild)
                except discord.Forbidden:
                    return web.json_response({"error": "Dem Bot fehlt die Berechtigung 'Einladung erstellen' in diesem Kanal."}, status=403)
                except Exception as e:
                    return web.json_response({"error": f"Fehler beim Erstellen der Discord-Einladung: {e}"}, status=400)

            source_obj = {
                "id": secrets.token_hex(6),
                "name": name,
                "color": color,
                "channel_id": str(target_channel.id),
                "channel_name": target_channel.name,
                "code": invite_code,
                "url": f"https://discord.gg/{invite_code}",
                "uses": 0,
                "active": 0,
                "left": 0,
                "created_at": time.time()
            }

            inv_cfg = get_config("InviteConfig", guild_id) or {}
            sources = inv_cfg.get("sources", [])
            if not isinstance(sources, list):
                sources = []
            sources.append(source_obj)
            inv_cfg["sources"] = sources
            set_config("InviteConfig", guild_id, inv_cfg)

            return web.json_response({"success": True, "source": source_obj})
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    async def api_action_delete_invite_source(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        source_id = request.match_info.get("source_id")
        if not guild_id_str or not guild_id_str.isdigit() or not source_id:
            return web.json_response({"error": "Invalid parameters"}, status=400)
        guild_id = int(guild_id_str)

        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild or not (user_perms.get("can_channels") or user_perms.get("is_admin")):
            return web.json_response({"error": "Unauthorized"}, status=403)

        try:
            from Components.Database.mongodb import get_config, set_config
            inv_cfg = get_config("InviteConfig", guild_id) or {}
            sources = inv_cfg.get("sources", [])
            if isinstance(sources, list):
                removed = next((s for s in sources if isinstance(s, dict) and str(s.get("id")) == str(source_id)), None)
                inv_cfg["sources"] = [s for s in sources if isinstance(s, dict) and str(s.get("id")) != str(source_id)]
                set_config("InviteConfig", guild_id, inv_cfg)
                if removed and removed.get("code"):
                    try:
                        guild_invites = await guild.invites()
                        for ginv in guild_invites:
                            if ginv.code == removed["code"]:
                                await ginv.delete(reason="Orbit Quellen-Tracker Quelle gelöscht")
                                break
                    except Exception:
                        pass
            return web.json_response({"success": True})
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    def _normalize_poll_entry(self, guild: discord.Guild, pid: str, entry: dict) -> dict:
        import time
        now = int(time.time())
        options = entry.get("options") if isinstance(entry.get("options"), list) else []
        raw_votes = entry.get("votes") if isinstance(entry.get("votes"), dict) else {}
        option_votes = []
        for idx in range(len(options)):
            v_list = raw_votes.get(str(idx), [])
            option_votes.append(len(v_list) if isinstance(v_list, list) else 0)
        total_votes = sum(option_votes)

        is_draft = bool(entry.get("draft")) or entry.get("status") == "draft"
        end_ts = int(entry.get("end_timestamp") or 0)
        no_time_limit = bool(entry.get("no_time_limit")) or (not is_draft and end_ts == 0)
        is_closed = bool(entry.get("closed")) or entry.get("status") == "ended" or (not is_draft and not no_time_limit and end_ts > 0 and now >= end_ts)

        if is_draft:
            status = "draft"
        elif is_closed:
            status = "ended"
        else:
            status = "active"

        cid_val = entry.get("channel_id")
        cid_str = str(cid_val) if cid_val and str(cid_val) != "0" else ""
        ch_name = ""
        if cid_str and cid_str.isdigit() and guild:
            ch_obj = guild.get_channel(int(cid_str)) or (self.bot.get_channel(int(cid_str)) if hasattr(self, 'bot') and self.bot else None)
            if ch_obj:
                ch_name = ch_obj.name

        dur_mins = int(entry.get("duration_minutes") or 1440)
        created_at = int(entry.get("created_at") or 0)
        if not created_at:
            if end_ts > 0 and dur_mins > 0:
                created_at = max(1, end_ts - dur_mins * 60)
            else:
                created_at = now

        dur_val = entry.get("duration_value")
        dur_unit = entry.get("duration_unit")
        if not dur_val or not dur_unit:
            if dur_mins % 10080 == 0:
                dur_val = max(1, dur_mins // 10080)
                dur_unit = "weeks"
            elif dur_mins % 1440 == 0:
                dur_val = max(1, dur_mins // 1440)
                dur_unit = "days"
            elif dur_mins % 60 == 0:
                dur_val = max(1, dur_mins // 60)
                dur_unit = "hours"
            else:
                dur_val = max(1, dur_mins)
                dur_unit = "minutes"

        return {
            "id": str(entry.get("poll_id") or pid),
            "poll_id": str(entry.get("poll_id") or pid),
            "question": str(entry.get("question") or ""),
            "options": [str(o) for o in options],
            "option_votes": option_votes,
            "total_votes": total_votes,
            "channel_id": cid_str,
            "channel_name": ch_name,
            "message_id": str(entry.get("message_id") or "") if entry.get("message_id") else "",
            "status": status,
            "closed": is_closed,
            "draft": is_draft,
            "created_at": created_at,
            "end_timestamp": end_ts,
            "duration_minutes": dur_mins,
            "duration_value": int(dur_val),
            "duration_unit": str(dur_unit),
            "no_time_limit": no_time_limit,
            "allow_multiple_votes": bool(entry.get("allow_multiple_votes", False)),
            "anonymous": bool(entry.get("anonymous", False)),
            "required_role_id": str(entry.get("required_role_id") or ""),
            "color": str(entry.get("color") or "#5865F2")
        }

    async def api_get_polls(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        if not guild_id_str or not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild ID"}, status=400)
        guild_id = int(guild_id_str)

        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild:
            return web.json_response({"error": "Unauthorized"}, status=403)

        try:
            from Components.Commands.Poll._storage import load_polls
            raw_polls = load_polls(guild_id)
            polls_list = []
            if isinstance(raw_polls, dict):
                for pid, entry in raw_polls.items():
                    if pid == "_id" or not isinstance(entry, dict):
                        continue
                    polls_list.append(self._normalize_poll_entry(guild, str(pid), entry))

            polls_list.sort(key=lambda x: x.get("created_at", 0), reverse=True)
            return web.json_response({"polls": polls_list})
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    async def api_save_poll(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        if not guild_id_str or not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild ID"}, status=400)
        guild_id = int(guild_id_str)

        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild or not (user_perms.get("can_messages") or user_perms.get("can_channels") or user_perms.get("is_admin")):
            return web.json_response({"error": "Unauthorized"}, status=403)

        try:
            import time
            from Components.Commands.Poll._storage import (
                load_polls,
                save_polls,
                generate_poll_id,
                update_poll_entry
            )
            from Components.Commands.Poll.poll import build_poll_kwargs, build_poll_embed, build_poll_view

            data = await request.json()
            is_draft = bool(data.get("draft", False))
            poll_id = str(data.get("poll_id") or data.get("id") or "").strip()

            question = str(data.get("question") or "").strip()[:256]
            raw_opts = data.get("options") if isinstance(data.get("options"), list) else []
            clean_opts = [str(o).strip()[:100] for o in raw_opts if str(o).strip()]

            if not is_draft:
                if not question:
                    return web.json_response({"error": "Bitte gib eine Frage für die Umfrage ein."}, status=400)
                if len(clean_opts) < 2:
                    return web.json_response({"error": "Bitte gib mindestens 2 Optionen an."}, status=400)
            else:
                if not question:
                    question = "Unbenannte Umfrage"
                while len(clean_opts) < 2:
                    clean_opts.append(f"Option {len(clean_opts) + 1}")

            clean_opts = clean_opts[:10]

            channel_id_str = str(data.get("channel_id") or "").strip()
            target_channel = None
            if channel_id_str and channel_id_str.isdigit():
                cid = int(channel_id_str)
                target_channel = guild.get_channel(cid) or (self.bot.get_channel(cid) if hasattr(self, 'bot') and self.bot else None)
                if not target_channel:
                    try:
                        target_channel = await guild.fetch_channel(cid)
                    except Exception:
                        try:
                            if hasattr(self, 'bot') and self.bot:
                                target_channel = await self.bot.fetch_channel(cid)
                        except Exception:
                            target_channel = None

            if not is_draft and not target_channel:
                target_channel = guild.system_channel
                if not target_channel:
                    me_user = guild.me or (guild.get_member(self.bot.user.id) if hasattr(self, 'bot') and self.bot and self.bot.user else None)
                    for ch in guild.text_channels:
                        if me_user:
                            perms = ch.permissions_for(me_user)
                            if perms.send_messages and perms.embed_links:
                                target_channel = ch
                                break
                        else:
                            target_channel = ch
                            break

            if not is_draft and not target_channel:
                return web.json_response({"error": "Bitte wähle einen gültigen Kanal aus."}, status=400)

            # Check bot permissions in target channel
            if not is_draft and target_channel:
                me_user = guild.me or (guild.get_member(self.bot.user.id) if hasattr(self, 'bot') and self.bot and self.bot.user else None)
                if me_user:
                    ch_perms = target_channel.permissions_for(me_user)
                    if not ch_perms.send_messages:
                        return web.json_response({"error": f"Dem Bot fehlt die Berechtigung 'Nachrichten senden' in #{target_channel.name}."}, status=403)
                    if not ch_perms.embed_links:
                        return web.json_response({"error": f"Dem Bot fehlt die Berechtigung 'Links einbetten' in #{target_channel.name}."}, status=403)

            try:
                dur_val = max(1, min(999, int(data.get("duration_value") or 1)))
            except (ValueError, TypeError):
                dur_val = 1

            dur_unit = str(data.get("duration_unit") or "days").lower()
            unit_multipliers = {
                "minutes": 1,
                "hours": 60,
                "days": 1440,
                "weeks": 10080
            }
            if dur_unit not in unit_multipliers:
                dur_unit = "days"
            duration_minutes = dur_val * unit_multipliers[dur_unit]

            no_time_limit = bool(data.get("no_time_limit", False))
            allow_multiple_votes = bool(data.get("allow_multiple_votes", False))
            anonymous = bool(data.get("anonymous", False))
            required_role_id = str(data.get("required_role_id") or "").strip()
            color = str(data.get("color") or "#5865F2").strip() or "#5865F2"

            session = await self.get_user_session(request)
            author_id = int(session["id"]) if session and str(session.get("id", "")).isdigit() else (self.bot.user.id if self.bot.user else 0)

            all_polls = load_polls(guild_id)
            if not isinstance(all_polls, dict):
                all_polls = {}

            existing_entry = all_polls.get(poll_id) if poll_id and poll_id in all_polls else None
            if not poll_id or not existing_entry:
                poll_id = generate_poll_id(guild_id)

            now = int(time.time())
            end_timestamp = 0 if (no_time_limit or is_draft) else (now + duration_minutes * 60)

            prev_votes = existing_entry.get("votes", {}) if isinstance(existing_entry, dict) else {}
            new_votes = {}
            for idx in range(len(clean_opts)):
                old_list = prev_votes.get(str(idx), [])
                new_votes[str(idx)] = old_list if isinstance(old_list, list) else []

            entry = {
                "poll_id": poll_id,
                "channel_id": target_channel.id if target_channel else (int(channel_id_str) if channel_id_str.isdigit() else 0),
                "message_id": int(existing_entry.get("message_id") or 0) if isinstance(existing_entry, dict) else 0,
                "question": question,
                "options": clean_opts,
                "author_id": existing_entry.get("author_id", author_id) if isinstance(existing_entry, dict) else author_id,
                "created_at": existing_entry.get("created_at", now) if isinstance(existing_entry, dict) else now,
                "duration_minutes": duration_minutes,
                "duration_value": dur_val,
                "duration_unit": dur_unit,
                "end_timestamp": end_timestamp,
                "no_time_limit": no_time_limit,
                "allow_multiple_votes": allow_multiple_votes,
                "anonymous": anonymous,
                "required_role_id": required_role_id,
                "color": color,
                "votes": new_votes,
                "closed": False,
                "closed_by": None,
                "draft": is_draft,
                "status": "draft" if is_draft else "active"
            }

            if not is_draft and target_channel:
                fb_embed = build_poll_embed(entry, ended=False)
                fb_view = build_poll_view(entry, ended=False)
                msg = None
                existing_msg_id = entry.get("message_id")
                if existing_msg_id:
                    try:
                        old_msg = await target_channel.fetch_message(int(existing_msg_id))
                        try:
                            await old_msg.edit(content=None, embed=fb_embed, view=fb_view)
                            msg = old_msg
                        except Exception as edit_err:
                            print(f"[Poll] Failed editing existing message {existing_msg_id}: {edit_err}")
                    except Exception:
                        msg = None

                if not msg:
                    try:
                        msg = await target_channel.send(embed=fb_embed, view=fb_view, allowed_mentions=discord.AllowedMentions.none())
                    except Exception as send_err:
                        print(f"[Poll] Error sending poll message to #{target_channel.name}: {send_err}")
                        raise send_err

                if msg:
                    entry["message_id"] = msg.id
                    entry["channel_id"] = target_channel.id

            all_polls[poll_id] = entry
            save_polls(guild_id, all_polls)

            return web.json_response({
                "success": True,
                "poll": self._normalize_poll_entry(guild, poll_id, entry)
            })
        except discord.Forbidden:
            return web.json_response({"error": "Dem Bot fehlen die Berechtigungen, um in diesem Kanal Nachrichten zu senden."}, status=403)
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    async def api_end_poll(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        poll_id = request.match_info.get("poll_id")
        if not guild_id_str or not guild_id_str.isdigit() or not poll_id:
            return web.json_response({"error": "Invalid parameters"}, status=400)
        guild_id = int(guild_id_str)

        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild or not (user_perms.get("can_messages") or user_perms.get("can_channels") or user_perms.get("is_admin")):
            return web.json_response({"error": "Unauthorized"}, status=403)

        try:
            from Components.Commands.Poll._storage import get_poll_entry
            from Components.Commands.Poll.poll import end_poll_logic

            entry = get_poll_entry(guild_id, poll_id)
            if not entry:
                return web.json_response({"error": "Umfrage wurde nicht gefunden."}, status=404)

            session = await self.get_user_session(request)
            closed_by = int(session["id"]) if session and str(session.get("id", "")).isdigit() else None

            await end_poll_logic(self.bot, guild_id, entry, closed_by=closed_by)
            updated = get_poll_entry(guild_id, poll_id) or entry
            updated["closed"] = True
            updated["status"] = "ended"

            return web.json_response({
                "success": True,
                "poll": self._normalize_poll_entry(guild, str(updated.get("poll_id") or poll_id), updated)
            })
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    async def api_delete_poll(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        poll_id = request.match_info.get("poll_id")
        if not guild_id_str or not guild_id_str.isdigit() or not poll_id:
            return web.json_response({"error": "Invalid parameters"}, status=400)
        guild_id = int(guild_id_str)

        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild or not (user_perms.get("can_messages") or user_perms.get("can_channels") or user_perms.get("is_admin")):
            return web.json_response({"error": "Unauthorized"}, status=403)

        try:
            from Components.Commands.Poll._storage import delete_poll_entry
            removed = delete_poll_entry(guild_id, poll_id)
            if removed and isinstance(removed, dict):
                cid = removed.get("channel_id")
                mid = removed.get("message_id")
                if cid and mid and not removed.get("closed"):
                    try:
                        ch = guild.get_channel(int(cid))
                        if ch:
                            msg = await ch.fetch_message(int(mid))
                            await msg.delete()
                    except Exception:
                        pass
            return web.json_response({"success": True})
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    def _normalize_giveaway_entry(self, guild, gw_id: str, entry: dict) -> dict:
        channel_id = str(entry.get("channel_id") or "")
        channel_name = entry.get("channel_name")
        if not channel_name and guild and channel_id.isdigit():
            ch = guild.get_channel(int(channel_id))
            channel_name = ch.name if ch else "unbekannt"
        if not channel_name:
            channel_name = "unbekannt"

        role_id = str(entry.get("required_role_id") or "")
        role_name = entry.get("required_role_name")
        if not role_name and guild and role_id.isdigit():
            r = guild.get_role(int(role_id))
            role_name = r.name if r else ""
        if not role_name:
            role_name = ""

        is_ended = bool(entry.get("ended") or entry.get("closed"))
        is_draft = bool(entry.get("draft") or entry.get("is_draft"))
        status = "draft" if is_draft else ("ended" if is_ended else "active")

        entries = entry.get("entries") or entry.get("participants") or []
        picked_winners = entry.get("picked_winners") or entry.get("winners_list") or []

        resolved_winners = []
        for winner in picked_winners:
            if isinstance(winner, dict):
                resolved_winners.append(winner)
            else:
                wid_str = str(winner)
                uname = wid_str
                avatar = None
                if guild and wid_str.isdigit():
                    mem = guild.get_member(int(wid_str))
                    if mem:
                        uname = mem.display_name or mem.name
                        avatar = mem.display_avatar.url if mem.display_avatar else None
                resolved_winners.append({
                    "id": wid_str,
                    "name": uname,
                    "avatar": avatar
                })

        resolved_participants = []
        for p in entries:
            if isinstance(p, dict):
                resolved_participants.append(p)
            else:
                pid_str = str(p)
                uname = pid_str
                avatar = None
                if guild and pid_str.isdigit():
                    mem = guild.get_member(int(pid_str))
                    if mem:
                        uname = mem.display_name or mem.name
                        avatar = mem.display_avatar.url if mem.display_avatar else None
                resolved_participants.append({
                    "id": pid_str,
                    "name": uname,
                    "avatar": avatar
                })

        msg_id = str(entry.get("message_id") or "")
        jump_url = None
        if guild and channel_id and msg_id and msg_id != "0":
            jump_url = f"https://discord.com/channels/{guild.id}/{channel_id}/{msg_id}"

        raw_color = entry.get("color", 0x5865F2)
        if isinstance(raw_color, int):
            color_hex = f"#{raw_color:06x}"
        elif isinstance(raw_color, str) and not raw_color.startswith("#"):
            color_hex = f"#{raw_color}"
        else:
            color_hex = str(raw_color or "#5865F2")

        end_ts = entry.get("end_timestamp") or entry.get("end_time") or 0

        return {
            "id": str(entry.get("giveaway_id") or gw_id),
            "giveaway_id": str(entry.get("giveaway_id") or gw_id),
            "guild_id": str(guild.id if guild else ""),
            "prize": str(entry.get("prize") or "Giveaway"),
            "description": str(entry.get("description") or ""),
            "channel_id": channel_id,
            "channel_name": channel_name,
            "message_id": msg_id,
            "winners_count": int(entry.get("winners") or entry.get("winners_count") or 1),
            "status": status,
            "ended": is_ended,
            "draft": is_draft,
            "color": color_hex,
            "required_role_id": role_id,
            "required_role_name": role_name,
            "end_timestamp": int(end_ts) if end_ts else 0,
            "created_at": entry.get("created_at") or int(time.time()),
            "author_id": str(entry.get("author_id") or ""),
            "participants": resolved_participants,
            "participants_count": len(entries),
            "picked_winners": resolved_winners,
            "jump_url": jump_url
        }

    async def api_get_giveaways(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        if not guild_id_str or not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild id"}, status=400)
        guild_id = int(guild_id_str)

        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild or not (user_perms.get("can_channels") or user_perms.get("can_messages") or user_perms.get("is_admin")):
            return web.json_response({"error": "Unauthorized"}, status=403)

        try:
            from Components.Commands.Giveaway._storage import load_giveaways
            data = load_giveaways(guild_id) or {}
            giveaways = []
            for gw_id, entry in data.items():
                if isinstance(entry, dict):
                    giveaways.append(self._normalize_giveaway_entry(guild, str(gw_id), entry))

            giveaways.sort(key=lambda x: x.get("created_at") or x.get("end_timestamp") or 0, reverse=True)
            return web.json_response({"success": True, "giveaways": giveaways})
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    async def api_save_giveaway(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        if not guild_id_str or not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild id"}, status=400)
        guild_id = int(guild_id_str)

        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild or not (user_perms.get("can_messages") or user_perms.get("can_channels") or user_perms.get("is_admin")):
            return web.json_response({"error": "Unauthorized"}, status=403)

        try:
            body = await request.json()
        except Exception:
            return web.json_response({"error": "Ungültiger JSON-Body."}, status=400)

        prize = str(body.get("prize", "")).strip()
        if not prize:
            return web.json_response({"error": "Preis darf nicht leer sein."}, status=400)

        is_draft = bool(body.get("draft") or body.get("is_draft"))
        channel_id_raw = body.get("channel_id")
        winners_count = max(1, min(25, int(body.get("winners_count") or body.get("winners") or 1)))
        color_raw = body.get("color") or "#5865F2"
        required_role_id = body.get("required_role_id")
        req_role_int = int(required_role_id) if required_role_id and str(required_role_id).isdigit() else None
        description = str(body.get("description", "")).strip()

        duration_seconds = int(body.get("duration_seconds") or 3600)
        if duration_seconds < 10:
            duration_seconds = 10
        if duration_seconds > 86400 * 30:
            duration_seconds = 86400 * 30

        now = int(time.time())
        end_time = now + duration_seconds

        session = await self.get_user_session(request)
        author_id = int(session["id"]) if session and str(session.get("id", "")).isdigit() else 0

        from Components.Commands.Giveaway._storage import generate_giveaway_id, save_giveaways, load_giveaways
        from Components.Commands.Giveaway.giveaway import send_giveaway_message

        gw_id = str(body.get("giveaway_id") or generate_giveaway_id(guild_id))

        try:
            if isinstance(color_raw, str):
                c_clean = color_raw.lstrip("#")
                color_int = int(c_clean, 16)
            else:
                color_int = int(color_raw)
        except Exception:
            color_int = 0x5865F2

        entry = {
            "giveaway_id": gw_id,
            "channel_id": int(channel_id_raw) if channel_id_raw and str(channel_id_raw).isdigit() else 0,
            "message_id": 0,
            "prize": prize,
            "description": description,
            "winners": winners_count,
            "winners_count": winners_count,
            "end_timestamp": end_time,
            "entries": [],
            "ended": False,
            "draft": is_draft,
            "author_id": author_id,
            "required_role_id": req_role_int,
            "color": color_int,
            "created_at": now
        }

        if is_draft:
            data = load_giveaways(guild_id) or {}
            data[gw_id] = entry
            save_giveaways(guild_id, data)
            return web.json_response({
                "success": True,
                "giveaway": self._normalize_giveaway_entry(guild, gw_id, entry)
            })

        if not entry["channel_id"]:
            return web.json_response({"error": "Bitte wähle einen Zielkanal für das Giveaway aus."}, status=400)

        channel = guild.get_channel(entry["channel_id"])
        if not channel:
            try:
                channel = await guild.fetch_channel(entry["channel_id"])
            except Exception:
                channel = None

        if not channel:
            return web.json_response({"error": "Kanal wurde auf dem Discord-Server nicht gefunden."}, status=404)

        try:
            msg = await send_giveaway_message(channel, entry, guild_id)
            if msg:
                entry["message_id"] = msg.id
                entry["channel_id"] = msg.channel.id
        except Exception as e:
            return web.json_response({"error": f"Fehler beim Senden in Discord: {str(e)}"}, status=500)

        data = load_giveaways(guild_id) or {}
        data[gw_id] = entry
        save_giveaways(guild_id, data)

        return web.json_response({
            "success": True,
            "giveaway": self._normalize_giveaway_entry(guild, gw_id, entry)
        })

    async def api_end_giveaway(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        gw_id = request.match_info.get("gw_id")
        if not guild_id_str or not guild_id_str.isdigit() or not gw_id:
            return web.json_response({"error": "Invalid parameters"}, status=400)
        guild_id = int(guild_id_str)

        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild or not (user_perms.get("can_messages") or user_perms.get("can_channels") or user_perms.get("is_admin")):
            return web.json_response({"error": "Unauthorized"}, status=403)

        try:
            from Components.Commands.Giveaway._storage import get_giveaway
            from Components.Commands.Giveaway.giveaway import end_giveaway_logic

            entry = get_giveaway(guild_id, gw_id)
            if not entry:
                return web.json_response({"error": "Giveaway wurde nicht gefunden."}, status=404)

            await end_giveaway_logic(self.bot, guild_id, entry)
            updated = get_giveaway(guild_id, gw_id) or entry
            updated["ended"] = True

            return web.json_response({
                "success": True,
                "giveaway": self._normalize_giveaway_entry(guild, gw_id, updated)
            })
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    async def api_reroll_giveaway(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        gw_id = request.match_info.get("gw_id")
        if not guild_id_str or not guild_id_str.isdigit() or not gw_id:
            return web.json_response({"error": "Invalid parameters"}, status=400)
        guild_id = int(guild_id_str)

        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild or not (user_perms.get("can_messages") or user_perms.get("can_channels") or user_perms.get("is_admin")):
            return web.json_response({"error": "Unauthorized"}, status=403)

        try:
            from Components.Commands.Giveaway._storage import get_giveaway
            from Components.Commands.Giveaway.giveaway import reroll_giveaway_logic

            entry = get_giveaway(guild_id, gw_id)
            if not entry:
                return web.json_response({"error": "Giveaway wurde nicht gefunden."}, status=404)

            winners_count = entry.get("winners", 1)
            try:
                body = await request.json()
                if body and "winners" in body:
                    winners_count = int(body["winners"])
            except Exception:
                pass

            res = await reroll_giveaway_logic(self.bot, guild_id, entry, winners_count=winners_count)
            if "error" in res:
                return web.json_response({"error": res["error"]}, status=400)

            updated = get_giveaway(guild_id, gw_id) or entry
            return web.json_response({
                "success": True,
                "winners": res.get("picked_winners", []),
                "giveaway": self._normalize_giveaway_entry(guild, gw_id, updated)
            })
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    async def api_delete_giveaway(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        gw_id = request.match_info.get("gw_id")
        if not guild_id_str or not guild_id_str.isdigit() or not gw_id:
            return web.json_response({"error": "Invalid parameters"}, status=400)
        guild_id = int(guild_id_str)

        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild or not (user_perms.get("can_messages") or user_perms.get("can_channels") or user_perms.get("is_admin")):
            return web.json_response({"error": "Unauthorized"}, status=403)

        try:
            from Components.Commands.Giveaway._storage import delete_giveaway_entry
            removed = delete_giveaway_entry(guild_id, gw_id)
            if removed and isinstance(removed, dict):
                cid = removed.get("channel_id")
                mid = removed.get("message_id")
                if cid and mid and not removed.get("ended"):
                    try:
                        ch = guild.get_channel(int(cid))
                        if ch:
                            msg = await ch.fetch_message(int(mid))
                            await msg.delete()
                    except Exception:
                        pass
            return web.json_response({"success": True})
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)
