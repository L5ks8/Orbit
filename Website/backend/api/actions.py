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
from Components.Dashboard.Roles._storage import load_join_roles, save_join_roles
from Components.Dashboard.Automoderation.log_storage import load_log_config, save_log_config
from Components.Commands.ChannelAutomation._storage import load_automation_config, save_automation_config
from Components.Commands.Boost._storage import load_boost_config, save_boost_config
from Components.Commands.Level._storage import load_level_config, save_level_config
from Components.Commands.ServerStats._storage import load_serverstats_config, save_serverstats_config

from Components.Dashboard.EmbedBuilder._storage import load_embeds_config, save_embeds_config

class ActionsMixin:
    async def api_action_get_saved_embeds(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        if not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild ID"}, status=400)
        guild_id = int(guild_id_str)
        
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild or not user_perms.get("is_admin"):
            return web.json_response({"error": "Unauthorized"}, status=403)
            
        data = load_embeds_config(guild_id)
        return web.json_response(data.get("embeds", []))

    async def api_action_save_embed(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        if not guild_id_str.isdigit():
            return web.json_response({"error": "Invalid guild ID"}, status=400)
        guild_id = int(guild_id_str)
        
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild or not user_perms.get("is_admin"):
            return web.json_response({"error": "Unauthorized"}, status=403)
            
        try:
            payload = await request.json()
            data = load_embeds_config(guild_id)
            embeds = data.get("embeds", [])
            
            # If payload has an 'id', update it, else create a new one
            embed_id = payload.get("id")
            if embed_id:
                for idx, emb in enumerate(embeds):
                    if emb.get("id") == embed_id:
                        # Update fields but preserve id
                        embeds[idx] = payload
                        break
                else:
                    embeds.append(payload)
            else:
                payload["id"] = secrets.token_hex(8)
                if not payload.get("name"):
                    payload["name"] = "Neue Nachricht"
                embeds.append(payload)
                
            data["embeds"] = embeds
            save_embeds_config(guild_id, data)
            
            return web.json_response({"success": True, "id": payload.get("id")})
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    async def api_action_delete_saved_embed(self, request: web.Request):
        guild_id_str = request.match_info.get("id")
        embed_id = request.match_info.get("embed_id")
        
        if not guild_id_str.isdigit() or not embed_id:
            return web.json_response({"error": "Invalid parameters"}, status=400)
        guild_id = int(guild_id_str)
        
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild or not user_perms.get("is_admin"):
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
        if not guild or (not user_perms.get("can_channels") and not user_perms.get("is_admin")):
            return web.json_response({"error": "Unauthorized or missing Manage Channels permission"}, status=403)
            
        try:
            data = await request.json()
            channel_id = data.get("channel_id")
            if not channel_id:
                return web.json_response({"error": "No channel_id provided"}, status=400)
                
            channel = guild.get_channel(int(channel_id))
            if not channel:
                return web.json_response({"error": "Channel not found"}, status=400)
                
            content = data.get("content", "").strip()
            title = data.get("title", "").strip()
            url = data.get("url", "").strip()
            description = data.get("description", "").strip()
            color = data.get("color", "")
            image = data.get("image", "").strip()
            thumbnail = data.get("thumbnail", "").strip()
            
            author_name = data.get("author_name", "").strip()
            author_url = data.get("author_url", "").strip()
            author_icon = data.get("author_icon", "").strip()
            
            footer_text = data.get("footer_text", "").strip()
            footer_icon = data.get("footer_icon", "").strip()
            
            fields = data.get("fields", [])
            
            if not title and not description and not image and not thumbnail and not author_name and not fields and not footer_text and not content:
                return web.json_response({"error": "Message cannot be completely empty"}, status=400)
                
            embed = discord.Embed()
            
            # Helper to replace basic variables and emojis
            def replace_vars(text):
                if not text: return text
                t = text.replace("{user}", request.headers.get("X-User-ID", "Unknown User"))
                t = t.replace("{server}", guild.name)
                t = t.replace("{membercount}", str(guild.member_count))
                return t
                
            if title: embed.title = replace_vars(title)
            if url: embed.url = url
            if description: embed.description = replace_vars(description)
            
            if color:
                try: embed.color = discord.Color(int(color.replace("#", ""), 16))
                except Exception: pass
            
            if author_name:
                author_kwargs = {"name": replace_vars(author_name)}
                if author_url: author_kwargs["url"] = author_url
                if author_icon: author_kwargs["icon_url"] = author_icon
                embed.set_author(**author_kwargs)
                
            if footer_text:
                footer_kwargs = {"text": replace_vars(footer_text)}
                if footer_icon: footer_kwargs["icon_url"] = footer_icon
                embed.set_footer(**footer_kwargs)
                
            for field in fields:
                fname = field.get("name", "").strip()
                fval = field.get("value", "").strip()
                finline = field.get("inline", False)
                if fname or fval:
                    embed.add_field(name=replace_vars(fname) or "\u200b", value=replace_vars(fval) or "\u200b", inline=finline)
            
            if image: embed.set_image(url=image)
            if thumbnail: embed.set_thumbnail(url=thumbnail)
            
            send_kwargs = {}
            has_embed = bool(embed.title or embed.description or embed.image or embed.thumbnail or embed.author or embed.fields or embed.footer)
            if has_embed:
                send_kwargs["embed"] = embed
            if content:
                send_kwargs["content"] = replace_vars(content)
                
            await channel.send(**send_kwargs)
            return web.json_response({"success": True})
        except discord.Forbidden:
            return web.json_response({"error": "Bot missing permissions to send messages in that channel"}, status=403)
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
        if not guild or not user_perms.get("can_roles"):
            return web.json_response({"error": "Unauthorized or missing Manage Roles permission"}, status=403)
            
        try:
            data = await request.json()
            channel_id = data.get("channel_id")
            if not channel_id:
                return web.json_response({"error": "No channel_id provided"}, status=400)
                
            channel = guild.get_channel(int(channel_id))
            if not channel:
                return web.json_response({"error": "Channel not found"}, status=400)
                
            verify_cfg = load_verify_config(guild_id)
            
            emb_title = verify_cfg.get("embed_title") if verify_cfg.get("embed_title") is not None else ""
            emb_desc = verify_cfg.get("embed_description") if verify_cfg.get("embed_description") is not None else "This server requires you to verify yourself to get access to other channels, you can simply verify by clicking on the verify button."
            
            try:
                emb_color = discord.Color(int(verify_cfg.get("embed_color", "").lstrip('#'), 16)) if verify_cfg.get("embed_color") else discord.Color.blue()
            except:
                emb_color = discord.Color.blue()
                
            embed = discord.Embed(
                title=emb_title,
                description=emb_desc,
                color=emb_color
            )
            
            emb_image = verify_cfg.get("embed_image", "") or "https://raw.githubusercontent.com/L5ks8/Orbit/main/Web/static/default_verify.png"
            if emb_image:
                embed.set_image(url=emb_image)
                
            from discord.ui import Button, View
            btn_verify = Button(label="Verify", style=discord.ButtonStyle.success, custom_id="orbit:verify_start")
            view = View(timeout=None)
            view.add_item(btn_verify)
            await channel.send(embed=embed, view=view, allowed_mentions=discord.AllowedMentions.none())

            verify_cfg = load_verify_config(guild_id)
            verify_cfg["channel_id"] = channel.id
            save_verify_config(guild_id, verify_cfg)
            
            return web.json_response({"success": True})
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
            channel_id = data.get("channel_id")
            if not channel_id:
                return web.json_response({"error": "No channel_id provided"}, status=400)
                
            channel = guild.get_channel(int(channel_id))
            if not channel:
                return web.json_response({"error": "Channel not found"}, status=400)
                
            from Components.Commands.Ticket._views import PersistentTicketPanelLayout
            from Components.Commands.Ticket._storage import load_ticket_config, save_ticket_config
            
            ticket_cfg = load_ticket_config(guild_id)
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
            msg = await channel.send(embed=embed, view=view, allowed_mentions=discord.AllowedMentions.none())

            ticket_cfg["panel_channel_id"] = channel.id
            ticket_cfg["panel_message_id"] = msg.id
            save_ticket_config(guild_id, ticket_cfg)
            
            return web.json_response({"success": True})
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
                        if comp.get("style") == 5: # URL Button
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
            
            # If no channel selected or 'current', try to find a valid text channel
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
            # Default name if missing
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
        from Components.Dashboard.Roles.reaction_panels import load_reaction_roles
        return web.json_response(load_reaction_roles(guild_id))

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
            from Components.Dashboard.Roles.reaction_panels import save_reaction_role

            post_to_discord = data.get("post_to_discord", False)
            channel_id_str = data.get("channel_id")
            msg_sent_id = None
            if post_to_discord and channel_id_str:
                channel = self.bot.get_channel(int(channel_id_str))
                if channel:
                    import discord
                    embed_data = data.get("embed", {})
                    embed = discord.Embed(
                        title=embed_data.get("title") or "Reaction Role",
                        description=embed_data.get("description") or "",
                        color=discord.Color.from_str(embed_data.get("color", "#5865F2") or "#5865F2")
                    )
                    view = discord.ui.View(timeout=None)
                    for comp in data.get("components", []):
                        role_id = comp.get("role_id")
                        if not role_id: continue
                        custom_id = f"rr_{role_id}_{data.get('mode', 'toggle')}"
                        btn = discord.ui.Button(
                            style=discord.ButtonStyle.secondary,
                            label=comp.get("label") or "Role",
                            emoji=comp.get("emoji") or "❓",
                            custom_id=custom_id
                        )
                        view.add_item(btn)
                    
                    try:
                        msg = await channel.send(embed=embed, view=view)
                        msg_sent_id = str(msg.id)
                        data["msg_id"] = msg_sent_id
                    except discord.Forbidden:
                        return web.json_response({"error": "Bot does not have permission to send messages in that channel."}, status=403)
                    except Exception as e:
                        return web.json_response({"error": f"Failed to send to Discord: {str(e)}"}, status=400)

            save_reaction_role(guild_id, data)
            return web.json_response({"success": True, "id": msg_id, "msg_id": msg_sent_id})
        except Exception as e:
            return web.json_response({"error": str(e)}, status=400)

    async def api_delete_reactionrole(self, request: web.Request):
        user = await self.get_user_session(request)
        if not user: return web.json_response({"error": "Unauthorized"}, status=401)
        guild_id = int(request.match_info['id'])
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild: return web.json_response({"error": "Forbidden"}, status=403)
        msg_id = request.match_info['msg_id']
        from Components.Dashboard.Roles.reaction_panels import delete_reaction_role
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
            msg_id = req_data.get("id")
            channel_id = req_data.get("channel_id")
            if not channel_id: return web.json_response({"error": "No channel_id provided"}, status=400)
            channel = guild.get_channel(int(channel_id))
            if not channel: return web.json_response({"error": "Channel not found"}, status=404)
            
            from Components.Dashboard.Roles.reaction_panels import load_reaction_roles
            rrs = load_reaction_roles(guild_id)
            rr = next((r for r in rrs if r.get("id") == msg_id), None)
            if not rr: return web.json_response({"error": "Reaction Role not found in database"}, status=404)
            
            import discord
            content = rr.get("content", "")
            embed_data = rr.get("embed", {})
            title = embed_data.get("title", "")
            desc = embed_data.get("description", "")
            url = embed_data.get("url", "")
            color = embed_data.get("color", "")
            author_name = embed_data.get("author_name", "")
            author_icon = embed_data.get("author_icon_url", "")
            image = embed_data.get("image_url", "")
            thumbnail = embed_data.get("thumbnail_url", "")
            footer_text = embed_data.get("footer_text", "")
            footer_icon = embed_data.get("footer_icon_url", "")
            fields = embed_data.get("fields", [])
            
            embed = discord.Embed()
            if title: embed.title = title
            if desc: embed.description = desc
            if url: embed.url = url
            if color:
                try: embed.color = discord.Color(int(color.replace("#", ""), 16))
                except: pass
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
                embed.add_field(name=f.get("name","​") or "​", value=f.get("value","​") or "​", inline=f.get("inline",False))
                
            msg_kwargs = {}
            if embed.title or embed.description or embed.author or embed.image or embed.footer or embed.fields:
                msg_kwargs["embed"] = embed
            if content: msg_kwargs["content"] = content
            
            button_mode = rr.get("button_type", "toggle")
            buttons_data = rr.get("components", [])
            
            view = discord.ui.View(timeout=None)
            for btn in buttons_data:
                label = btn.get("label", "Role")
                emoji = btn.get("emoji")
                color_str = btn.get("color", "blue")
                role_id = btn.get("role_id")
                if not role_id: continue
                
                style = discord.ButtonStyle.primary
                if color_str == "gray": style = discord.ButtonStyle.secondary
                elif color_str == "green": style = discord.ButtonStyle.success
                elif color_str == "red": style = discord.ButtonStyle.danger
                
                custom_id = f"rr_{role_id}_{button_mode}"
                kwargs = {"style": style, "label": label, "custom_id": custom_id}
                if emoji: kwargs["emoji"] = emoji
                
                view.add_item(discord.ui.Button(**kwargs))
            
            if len(view.children) > 0:
                msg_kwargs["view"] = view
            
            if not msg_kwargs:
                return web.json_response({"error": "Message cannot be empty"}, status=400)
                
            msg = await channel.send(**msg_kwargs)
            
            # Update database with message_id
            rr["message_id"] = str(msg.id)
            rr["channel_id"] = str(channel_id)
            from Components.Dashboard.Roles.reaction_panels import save_reaction_role
            save_reaction_role(guild_id, rr)
            
            return web.json_response({"success": True, "message_id": str(msg.id)})
        except discord.Forbidden:
            return web.json_response({"error": "Bot missing permissions to send message in that channel"}, status=403)
        except Exception as e:
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
                return web.json_response({"error": "Upload failed"}, status=500)
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
        from Components.Commands.Appeals._storage import get_appeals_config_by_url
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
        from Components.Commands.Appeals._storage import get_appeals_config_by_url
        cfg = get_appeals_config_by_url(custom_url)
        if not cfg:
            return web.json_response({"error": "Not found"}, status=404)
            
        try:
            data = await request.json()
            reason = data.get("reason", "")
            
            from Components.Commands.Appeals.appeals import process_new_appeal
            success, msg = await process_new_appeal(self.bot, int(cfg["_id"]), int(session["id"]), reason, cfg)
            
            if success:
                return web.json_response({"success": True})
            else:
                return web.json_response({"error": msg}, status=400)
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    # SPA handles /verify/:token

    async def handle_api_captcha(self, request: web.Request):
        token = request.match_info.get("token")
        if not token or token not in WEB_VERIFY_SESSIONS:
            return web.Response(text="Invalid or expired token", status=400)
            
        try:
            from Components.Commands.Verify._captcha import generate_captcha
            code, img_bytes = generate_captcha()
            WEB_VERIFY_SESSIONS[token]["code"] = code
            return web.Response(body=img_bytes, content_type="image/png")
        except Exception as e:
            return web.Response(text=str(e), status=500)

    async def handle_api_verify(self, request: web.Request):
        token = request.match_info.get("token")
        if not token or token not in WEB_VERIFY_SESSIONS:
            return web.json_response({"error": "Invalid or expired token"}, status=400)
            
        try:
            data = await request.json()
            user_code = str(data.get("code", "")).strip().upper()
            session = WEB_VERIFY_SESSIONS[token]
            
            if "code" in session and user_code != session.get("code"):
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



