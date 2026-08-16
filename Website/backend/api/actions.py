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
from aiohttp import web
import discord
import os
import secrets
import aiohttp

class ActionsMixin:
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
                
            from Commands.Ticket._views import PersistentTicketPanelLayout
            from Commands.Ticket._storage import load_ticket_config, save_ticket_config
            
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
            
        from Database.mongodb import get_db
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
                
            message_template = data.get("message", "")
            if not message_template:
                return web.json_response({"error": "No message provided"}, status=400)
                
            from Commands.ChannelAutomation._storage import load_automation_config, save_automation_config
            config = load_automation_config(guild_id)
            auto_ban_cfg = config.get("auto_ban", {})
            ban_count = auto_ban_cfg.get("ban_count", 0)
            
            text = message_template.replace("{count}", str(ban_count))
            msg = await channel.send(content=text)
            
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
            
            from Database.mongodb import get_db
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
        from Database.mongodb import get_db
        db = get_db()
        db["CustomMessages"].delete_one({"id": msg_id, "guild_id": str(guild_id)})
        return web.json_response({"success": True})

    async def api_get_reactionroles(self, request: web.Request):
        user = await self.get_user_session(request)
        if not user: return web.json_response({"error": "Unauthorized"}, status=401)
        guild_id = int(request.match_info['id'])
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild: return web.json_response({"error": "Forbidden"}, status=403)
        from Commands.ReactionRole._storage import load_reaction_roles
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
            from Commands.ReactionRole._storage import save_reaction_role
            save_reaction_role(guild_id, data)
            return web.json_response({"success": True, "id": msg_id})
        except Exception as e:
            return web.json_response({"error": str(e)}, status=400)

    async def api_delete_reactionrole(self, request: web.Request):
        user = await self.get_user_session(request)
        if not user: return web.json_response({"error": "Unauthorized"}, status=401)
        guild_id = int(request.match_info['id'])
        guild, user_perms = await self._check_guild_access(request, guild_id)
        if not guild: return web.json_response({"error": "Forbidden"}, status=403)
        msg_id = request.match_info['msg_id']
        from Commands.ReactionRole._storage import delete_reaction_role
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
            
            from Commands.ReactionRole._storage import load_reaction_roles
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
                
            await channel.send(**msg_kwargs)
            return web.json_response({"success": True})
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

            from Database.cloudinary_storage import upload_image_bytes
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
                from Commands.ServerStats.serverstats import ServerStats
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
        from Commands.Appeals._storage import get_appeals_config_by_url
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
        from Commands.Appeals._storage import get_appeals_config_by_url
        cfg = get_appeals_config_by_url(custom_url)
        if not cfg:
            return web.json_response({"error": "Not found"}, status=404)
            
        try:
            data = await request.json()
            reason = data.get("reason", "")
            
            from Commands.Appeals.appeals import process_new_appeal
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
            from Commands.Verify._captcha import generate_captcha
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
            
            if user_code != session.get("code"):
                return web.json_response({"error": "Incorrect code"}, status=400)
                
            guild_id = session["guild_id"]
            user_id = session["user_id"]
            role_id = session["role_id"]
            remove_role_id = session.get("remove_role_id")
            
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
                return web.json_response({"success": True})
            else:
                return web.json_response({"error": "Verification role not found in server"}, status=400)
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

def setup_web_app(bot: discord.ext.commands.Bot) -> web.Application:
    dashboard = WebDashboard(bot)
    app = web.Application(client_max_size=10 * 1024 * 1024)  
    
    app.router.add_get("/auth/login", dashboard.handle_login)
    app.router.add_get("/auth/callback", dashboard.handle_callback)
    app.router.add_get("/auth/logout", dashboard.handle_logout)
    
    app.router.add_get("/api/captcha/{token}", dashboard.handle_api_captcha)
    app.router.add_post("/api/verify/{token}", dashboard.handle_api_verify)
    
    app.router.add_get("/api/user", dashboard.api_user)
    app.router.add_get("/api/user/{id}", dashboard.api_resolve_user)
    app.router.add_get("/api/public_leaderboard/{id}", dashboard.api_public_leaderboard)
    app.router.add_get("/api/stats", dashboard.api_stats)
    app.router.add_get("/api/guilds", dashboard.api_guilds)
    app.router.add_get("/api/config/{id}", dashboard.api_get_config)
    app.router.add_get("/api/guild_stats/{id}", dashboard.api_guild_stats)
    app.router.add_post("/api/config/{id}", dashboard.api_post_config)
    app.router.add_post("/api/action/{id}/setup_serverstats", dashboard.api_action_setup_serverstats)
    app.router.add_post("/api/action/{id}/send_verify_panel", dashboard.api_action_send_verify)
    app.router.add_post("/api/action/{id}/send_ticket_panel", dashboard.api_action_send_ticket)
    app.router.add_post("/api/action/{id}/send_embed", dashboard.api_action_send_embed)
    app.router.add_post("/api/action/{id}/send_honeypot", dashboard.api_action_send_honeypot)
    app.router.add_get("/api/messages/{id}", dashboard.api_get_messages)
    app.router.add_post("/api/messages/{id}", dashboard.api_save_message)
    app.router.add_delete("/api/messages/{id}/{msg_id}", dashboard.api_delete_message)
    app.router.add_post("/api/server/{id}/test-levelup", dashboard.api_action_test_levelup)
    app.router.add_post("/api/upload/image", dashboard.api_upload_image)
    app.router.add_get("/api/reactionroles/{id}", dashboard.api_get_reactionroles)
    app.router.add_post("/api/reactionroles/{id}", dashboard.api_save_reactionrole)
    app.router.add_delete("/api/reactionroles/{id}/{msg_id}", dashboard.api_delete_reactionrole)
    app.router.add_post("/api/action/{id}/send_reactionrole", dashboard.api_action_send_reactionrole)
    app.router.add_get("/api/appeal_info/{custom_url}", dashboard.api_appeal_info)
    app.router.add_post("/api/submit_appeal/{custom_url}", dashboard.api_submit_appeal)

    # SPA Catch-all Route must be added LAST
    app.router.add_get("/{tail:.*}", dashboard.handle_spa)

    return app

