import io
import time
import asyncio
import discord
from discord.ui import Button, Modal, TextInput, Select, ChannelSelect, RoleSelect
from Components.Systems.Tickets._storage import load_ticket_config, create_active_ticket, claim_ticket, close_active_ticket
from Components.Commands._utils import make_embed, ORBIT_COLOR

_user_ticket_selections = {}

async def close_ticket_flow(guild: discord.Guild, channel: discord.TextChannel, closed_by: discord.abc.User, reason: str = "No reason provided"):
    config = load_ticket_config(guild.id)
    ticket_data = config.get("active_tickets", {}).get(str(channel.id))
    
    if not ticket_data:
        creator_id = "Unknown"
        subject = "Unknown"
    else:
        creator_id = str(ticket_data.get("creator_id", "Unknown"))
        subject = ticket_data.get("subject", "Unknown")

    try:
        await channel.send("### Ticket Closing\nGenerating transcript and shutting down channel in 3 seconds...")
    except Exception:
        pass

    messages = []
    try:
        async for m in channel.history(limit=500, oldest_first=True):
            messages.append(m)
    except Exception:
        pass

    def _resolve_mentions(text: str, g: discord.Guild) -> str:
        if not text:
            return ""
        import re
        from datetime import datetime, timezone

        def replace_user(match):
            uid = int(match.group(1))
            mem = g.get_member(uid) if g else None
            if mem:
                return f"@{mem.display_name}"
            usr = g._state.get_user(uid) if (g and hasattr(g, "_state")) else None
            if usr:
                return f"@{usr.display_name}"
            return f"@{uid}"

        def replace_role(match):
            rid = int(match.group(1))
            role = g.get_role(rid) if g else None
            if role:
                return f"@{role.name}"
            return f"@role-{rid}"

        def replace_channel(match):
            cid = int(match.group(1))
            ch = g.get_channel(cid) if g else None
            if ch:
                return f"#{ch.name}"
            return f"#channel-{cid}"

        def replace_ts(match):
            ts = int(match.group(1))
            dt = datetime.fromtimestamp(ts, tz=timezone.utc)
            return dt.strftime("%Y-%m-%d %H:%M:%S UTC")

        text = re.sub(r'<@!?(\d+)>', replace_user, text)
        text = re.sub(r'<@&(\d+)>', replace_role, text)
        text = re.sub(r'<#(\d+)>', replace_channel, text)
        text = re.sub(r'<t:(\d+)(?::[a-zA-Z])?>', replace_ts, text)
        return text

    html_template = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Ticket Transcript: #{channel.name}</title>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #313338; color: #dbdee1; margin: 0; padding: 24px; }}
        .header {{ background-color: #2b2d31; padding: 20px; border-radius: 8px; margin-bottom: 24px; border: 1px solid #383a40; }}
        .header h1 {{ margin: 0 0 10px 0; color: #f2f3f5; font-size: 24px; }}
        .header p {{ margin: 6px 0; font-size: 14px; color: #b5bac1; }}
        .header p strong {{ color: #f2f3f5; }}
        .message {{ display: flex; margin-bottom: 18px; line-height: 1.4; }}
        .avatar {{ width: 44px; height: 44px; border-radius: 50%; margin-right: 16px; background-color: #5865F2; flex-shrink: 0; overflow: hidden; }}
        .avatar img {{ width: 100%; height: 100%; object-fit: cover; }}
        .msg-content {{ display: flex; flex-direction: column; flex-grow: 1; max-width: calc(100% - 60px); }}
        .msg-header {{ display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }}
        .msg-author {{ font-weight: 600; color: #f2f3f5; font-size: 16px; }}
        .bot-badge {{ background-color: #5865F2; color: #ffffff; font-size: 10px; font-weight: 700; padding: 2px 5px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px; vertical-align: middle; }}
        .msg-time {{ font-size: 12px; color: #949ba4; }}
        .msg-text {{ font-size: 15px; word-wrap: break-word; white-space: pre-wrap; color: #dbdee1; }}
        .mention {{ background-color: rgba(88, 101, 242, 0.3); color: #c9cdfb; border-radius: 4px; padding: 1px 4px; font-weight: 500; }}
        .embed {{ background-color: #2b2d31; border-left: 4px solid #5865f2; border-radius: 4px; padding: 12px 16px; margin-top: 8px; max-width: 600px; display: flex; flex-direction: column; gap: 6px; }}
        .embed-author {{ font-size: 13px; font-weight: 600; color: #f2f3f5; display: flex; align-items: center; gap: 8px; }}
        .embed-author-icon {{ width: 20px; height: 20px; border-radius: 50%; object-fit: cover; }}
        .embed-title {{ font-size: 16px; font-weight: 700; color: #f2f3f5; }}
        .embed-desc {{ font-size: 14px; color: #dbdee1; white-space: pre-wrap; line-height: 1.4; }}
        .embed-fields {{ display: flex; flex-wrap: wrap; gap: 10px; margin-top: 4px; }}
        .embed-field {{ flex: 1 1 100%; }}
        .embed-field-inline {{ flex: 1 1 calc(50% - 10px); min-width: 140px; }}
        .embed-field-name {{ font-size: 13px; font-weight: 600; color: #f2f3f5; margin-bottom: 2px; }}
        .embed-field-value {{ font-size: 13px; color: #dbdee1; white-space: pre-wrap; }}
        .embed-thumbnail {{ max-width: 80px; max-height: 80px; border-radius: 4px; float: right; margin-left: 10px; object-fit: cover; }}
        .embed-image {{ max-width: 100%; max-height: 320px; border-radius: 4px; margin-top: 6px; object-fit: contain; }}
        .embed-footer {{ font-size: 12px; color: #949ba4; display: flex; align-items: center; gap: 6px; margin-top: 4px; }}
        .embed-footer-icon {{ width: 16px; height: 16px; border-radius: 50%; object-fit: cover; }}
        .attachment {{ margin-top: 6px; }}
        .attachment img {{ max-width: 400px; max-height: 280px; border-radius: 6px; object-fit: contain; }}
        .attachment a {{ color: #00a8fc; text-decoration: none; font-size: 14px; }}
        .attachment a:hover {{ text-decoration: underline; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>Ticket Transcript: #{channel.name}</h1>
        <p><strong>Server:</strong> {guild.name} ({guild.id})</p>
        <p><strong>Creator ID:</strong> {creator_id}</p>
        <p><strong>Subject:</strong> {subject}</p>
        <p><strong>Closed By:</strong> {closed_by} ({getattr(closed_by, 'id', 'Unknown')})</p>
        <p><strong>Reason:</strong> {reason}</p>
    </div>
    <div class="messages">
"""
    import html
    msgs_html = []
    for m in messages:
        t_str = m.created_at.strftime("%Y-%m-%d %H:%M:%S")

        author_member = guild.get_member(m.author.id) if guild else None
        if not author_member and isinstance(m.author, discord.Member):
            author_member = m.author

        display_name = author_member.display_name if author_member else m.author.display_name
        is_bot = bool(m.author.bot)

        author_color = ""
        if author_member and author_member.color and author_member.color.value != 0:
            author_color = f"#{author_member.color.value:06x}"

        avatar_url = "https://cdn.discordapp.com/embed/avatars/0.png"
        if author_member and hasattr(author_member, "display_avatar") and author_member.display_avatar:
            avatar_url = author_member.display_avatar.with_format("png").with_size(128).url
        elif hasattr(m.author, "display_avatar") and m.author.display_avatar:
            avatar_url = m.author.display_avatar.with_format("png").with_size(128).url

        # Process content
        raw_content = m.content or ""
        resolved_content = _resolve_mentions(raw_content, guild)
        safe_content = html.escape(resolved_content)

        # Process embeds
        embeds_html = []
        for emb in m.embeds:
            color_hex = f"#{emb.color.value:06x}" if (emb.color and emb.color.value != 0) else "#5865F2"
            emb_parts = []

            # Thumbnail
            if emb.thumbnail and emb.thumbnail.url:
                emb_parts.append(f'<img class="embed-thumbnail" src="{emb.thumbnail.url}" alt="thumbnail">')

            # Author
            if emb.author and emb.author.name:
                author_icon = f'<img class="embed-author-icon" src="{emb.author.icon_url}">' if emb.author.icon_url else ""
                emb_parts.append(f'<div class="embed-author">{author_icon}<span>{html.escape(emb.author.name)}</span></div>')

            # Title
            if emb.title:
                emb_parts.append(f'<div class="embed-title">{html.escape(emb.title)}</div>')

            # Description
            if emb.description:
                emb_desc = html.escape(_resolve_mentions(emb.description, guild))
                emb_parts.append(f'<div class="embed-desc">{emb_desc}</div>')

            # Fields
            if emb.fields:
                emb_parts.append('<div class="embed-fields">')
                for f in emb.fields:
                    f_name = html.escape(f.name or "")
                    f_val = html.escape(_resolve_mentions(f.value or "", guild))
                    inline_cls = " embed-field-inline" if f.inline else ""
                    emb_parts.append(f'<div class="embed-field{inline_cls}"><div class="embed-field-name">{f_name}</div><div class="embed-field-value">{f_val}</div></div>')
                emb_parts.append('</div>')

            # Image
            if emb.image and emb.image.url:
                emb_parts.append(f'<img class="embed-image" src="{emb.image.url}" alt="image">')

            # Footer & timestamp
            footer_text = html.escape(emb.footer.text) if (emb.footer and emb.footer.text) else ""
            emb_ts = emb.timestamp.strftime("%Y-%m-%d %H:%M:%S") if emb.timestamp else ""
            footer_line = ""
            if footer_text and emb_ts:
                footer_line = f"{footer_text} • {emb_ts}"
            elif footer_text:
                footer_line = footer_text
            elif emb_ts:
                footer_line = emb_ts

            if footer_line or (emb.footer and emb.footer.icon_url):
                footer_icon = f'<img class="embed-footer-icon" src="{emb.footer.icon_url}">' if (emb.footer and emb.footer.icon_url) else ""
                emb_parts.append(f'<div class="embed-footer">{footer_icon}<span>{footer_line}</span></div>')

            embed_body = "".join(emb_parts)
            embeds_html.append(f'<div class="embed" data-color="{color_hex}" style="border-left-color: {color_hex};">{embed_body}</div>')

        # Process attachments
        attachments_html = []
        for att in m.attachments:
            is_img = any(att.filename.lower().endswith(ext) for ext in [".png", ".jpg", ".jpeg", ".gif", ".webp"])
            if is_img:
                attachments_html.append(f'<div class="attachment image-attachment"><img src="{att.url}" alt="{html.escape(att.filename)}"></div>')
            else:
                attachments_html.append(f'<div class="attachment file-attachment"><a href="{att.url}" target="_blank">{html.escape(att.filename)}</a></div>')

        author_style = f' style="color: {author_color};"' if author_color else ""
        bot_badge = '<span class="bot-badge">BOT</span>' if is_bot else ""
        text_block = f'<div class="msg-text">{safe_content}</div>' if safe_content else ""

        msgs_html.append(f'''        <div class="message" data-author-id="{m.author.id}" data-is-bot="{str(is_bot).lower()}">
            <div class="avatar"><img src="{avatar_url}" alt="avatar"></div>
            <div class="msg-content">
                <div class="msg-header">
                    <span class="msg-author"{author_style}>{html.escape(display_name)}</span>
                    {bot_badge}
                    <span class="msg-time">{t_str}</span>
                </div>
                {text_block}
                {"".join(embeds_html)}
                {"".join(attachments_html)}
            </div>
        </div>''')

    transcript_text = html_template + "\n".join(msgs_html) + "\n    </div>\n</body>\n</html>"
    transcript_bytes = transcript_text.encode("utf-8")

    log_ch_id = config.get("log_channel_id")
    if log_ch_id:
        log_channel = guild.get_channel(log_ch_id)
        if log_channel:
            creator_obj = None
            if creator_id != "Unknown":
                try:
                    creator_obj = guild.get_member(int(creator_id))
                except Exception:
                    pass

            creator_mention = creator_obj.mention if creator_obj else f"<@{creator_id}>"
            creator_username = f"@{creator_obj.name}" if creator_obj else f"@{creator_id}"
            creator_id_str = str(creator_obj.id) if creator_obj else str(creator_id)

            executor_mention = closed_by.mention
            executor_username = f"@{closed_by.name}" if hasattr(closed_by, "name") and closed_by.name else str(closed_by)
            executor_id_str = str(getattr(closed_by, "id", "Unknown"))

            embed = discord.Embed(title="Ticket Closed", description=f"{executor_mention} closed a ticket.", color=discord.Color.dark_red())
            embed.add_field(name="Ticket Info", value=f"Name: {channel.name}\nID: {channel.id}\nReason: {reason}", inline=False)
            embed.add_field(name="Creator Info", value=f"Creator: {creator_mention}\nUsername: {creator_username}\nID: {creator_id_str}", inline=False)
            embed.add_field(name="Executor Info", value=f"Executor: {executor_mention}\nUsername: {executor_username}\nID: {executor_id_str}", inline=False)
            kwargs = {"embed": embed}
            try:
                await log_channel.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())
                file = discord.File(fp=io.BytesIO(transcript_bytes), filename=f"transcript-{channel.name}.html")
                await log_channel.send(file=file)
            except Exception:
                pass

    close_active_ticket(guild.id, channel.id)
    await asyncio.sleep(3)
    try:
        await channel.delete(reason=f"Ticket closed by {closed_by}: {reason}")
    except Exception:
        pass

class TicketOpenModal(Modal):
    def __init__(self, category_option: str = "General Support", slot_config: dict | None = None):
        modal_title = (slot_config.get("name") if isinstance(slot_config, dict) else category_option) or "Open Support Ticket"
        super().__init__(title=str(modal_title)[:45])
        self.category_option = category_option
        self.slot_config = slot_config if isinstance(slot_config, dict) else {}
        self.custom_inputs: list[tuple[str, TextInput]] = []

        questions = self.slot_config.get("questions", [])
        if isinstance(questions, list) and len(questions) > 0:
            for q in questions[:5]:
                if not isinstance(q, dict):
                    continue
                lbl = str(q.get("label") or "Question")[:45]
                ph = str(q.get("placeholder") or "")[:100]
                is_para = q.get("style") == "paragraph"
                is_req = q.get("required", True) is not False
                ti = TextInput(
                    label=lbl,
                    placeholder=ph or None,
                    style=discord.TextStyle.paragraph if is_para else discord.TextStyle.short,
                    min_length=1 if is_req else 0,
                    max_length=1000 if is_para else 200,
                    required=is_req
                )
                self.add_item(ti)
                self.custom_inputs.append((lbl, ti))
        else:
            ti_subj = TextInput(
                label="Ticket Subject",
                placeholder="Brief summary of your inquiry...",
                min_length=2,
                max_length=100,
                required=True
            )
            ti_desc = TextInput(
                label="Detailed Description",
                placeholder="Please explain your situation or question in full detail...",
                style=discord.TextStyle.paragraph,
                min_length=3,
                max_length=1000,
                required=True
            )
            self.add_item(ti_subj)
            self.add_item(ti_desc)
            self.custom_inputs.append(("Ticket Subject", ti_subj))
            self.custom_inputs.append(("Detailed Description", ti_desc))

        if self.slot_config.get("require_proof") and len(self.custom_inputs) < 5:
            has_proof_q = any("beweis" in lbl.lower() or "proof" in lbl.lower() for lbl, _ in self.custom_inputs)
            if not has_proof_q:
                ti_proof = TextInput(
                    label="Proof / Evidence (Links or Info)",
                    placeholder="Paste screenshot/video links or proof details...",
                    style=discord.TextStyle.short,
                    min_length=3,
                    max_length=300,
                    required=True
                )
                self.add_item(ti_proof)
                self.custom_inputs.append(("Proof / Evidence", ti_proof))

    async def on_submit(self, interaction: discord.Interaction):
        await interaction.response.defer(ephemeral=True)
        from Components.Systems.Tickets._storage import is_blacklisted, save_ticket_config
        if is_blacklisted(interaction.guild.id, interaction.user.id):
            return await interaction.followup.send(embed=make_embed("You are blacklisted from opening support tickets on this server.", discord.Color.red()), ephemeral=True)

        config = load_ticket_config(interaction.guild.id)

        category_id = config.get("category_id")
        support_role_id = config.get("support_role_id")

        category = None
        support_roles = []
        matched_slot = self.slot_config or {}
        if not matched_slot:
            for slot in config.get("options_slots", []):
                if isinstance(slot, dict) and slot.get("name") == self.category_option:
                    matched_slot = slot
                    break

        if matched_slot.get("category_id") and str(matched_slot["category_id"]).isdigit():
            category = interaction.guild.get_channel(int(matched_slot["category_id"]))

        # Gather all support roles (from matched slot or panel defaults)
        raw_rids = matched_slot.get("role_ids") or []
        if not raw_rids and matched_slot.get("role_id"):
            raw_rids = [matched_slot.get("role_id")]
        if not raw_rids:
            raw_rids = config.get("support_role_ids") or []
        if not raw_rids and support_role_id:
            raw_rids = [support_role_id]

        for rid in raw_rids:
            if rid and str(rid).isdigit():
                r_obj = interaction.guild.get_role(int(rid))
                if r_obj and r_obj not in support_roles:
                    support_roles.append(r_obj)

        support_role = support_roles[0] if support_roles else None

        if not category and category_id and str(category_id).isdigit():
            category = interaction.guild.get_channel(int(category_id))
        if not category and interaction.channel and getattr(interaction.channel, "category", None):
            category = interaction.channel.category

        subject = self.custom_inputs[0][1].value.strip() if self.custom_inputs else self.category_option
        if len(self.custom_inputs) > 1:
            desc_lines = [f"**{lbl}:**\n{inp.value.strip()}" for lbl, inp in self.custom_inputs if inp.value.strip()]
            description = "\n\n".join(desc_lines)
        else:
            description = subject

        active_tickets = config.get("active_tickets", {})
        max_open_tickets = int(config.get("max_open_tickets", 3) or 3)
        user_open_count = sum(1 for t in active_tickets.values() if t.get("creator_id") == interaction.user.id)
        if user_open_count >= max_open_tickets:
            return await interaction.followup.send(embed=make_embed(f"You already have {max_open_tickets} open tickets! Please close an existing ticket before opening a new one.", discord.Color.red()), ephemeral=True)

        slot_mode = matched_slot.get("mode", "channel")

        # Form-only mode: record submission and post to log/staff channel without creating a channel
        if slot_mode == "form":
            sub_id = f"sub_{int(time.time() * 1000)}"
            counter = create_active_ticket(
                interaction.guild.id,
                sub_id,
                interaction.user.id,
                subject,
                description,
                self.category_option
            )
            log_ch_id = matched_slot.get("log_channel_id") or config.get("log_channel_id") or matched_slot.get("panel_channel_id") or config.get("panel_channel_id")
            if log_ch_id and str(log_ch_id).isdigit():
                log_ch = interaction.guild.get_channel(int(log_ch_id))
                if log_ch:
                    sub_embed = discord.Embed(
                        title=f"Form Submission #{counter}: {self.category_option}",
                        color=ORBIT_COLOR
                    )
                    sub_embed.add_field(name="Submitted By", value=f"{interaction.user.mention} (`{interaction.user.id}`)", inline=True)
                    sub_embed.add_field(name="Type", value=self.category_option, inline=True)
                    for lbl, inp in self.custom_inputs:
                        val = inp.value.strip() or "—"
                        sub_embed.add_field(name=lbl[:256], value=val[:1024], inline=False)
                    try:
                        await log_ch.send(embed=sub_embed)
                    except Exception:
                        pass
            return await interaction.followup.send(
                embed=make_embed(f"Your **{self.category_option}** submission (`#{counter}`) has been sent to the staff team!", discord.Color.green()),
                ephemeral=True
            )

        counter = config.get("ticket_counter", 0) + 1
        clean_name = "".join(c for c in interaction.user.name.lower().replace(" ", "-") if c.isalnum() or c in "-_")[:15] or "user"
        clean_option = "".join(c for c in self.category_option.lower().replace(" ", "-") if c.isalnum() or c in "-_")[:20] or "ticket"

        naming_fmt = (config.get("naming_format") or "").strip()
        if naming_fmt:
            formatted_raw = (
                naming_fmt
                .replace("{Typ}", clean_option)
                .replace("{type}", clean_option)
                .replace("{Nummer}", str(counter))
                .replace("{number}", str(counter))
                .replace("{Benutzer}", clean_name)
                .replace("{user}", clean_name)
            )
            base_channel_name = "".join(c for c in formatted_raw.lower().replace(" ", "-") if c.isalnum() or c in "-_·")[:90] or f"{clean_option}-{counter}"
        else:
            base_channel_name = f"{clean_option}-{clean_name}"

        channel_name = base_channel_name
        existing_names = [ch.name.lower() for ch in interaction.guild.channels]
        suffix_count = 1
        while channel_name.lower() in existing_names:
            suffix_count += 1
            channel_name = f"{base_channel_name}-{suffix_count}"

        overwrites = {
            interaction.guild.default_role: discord.PermissionOverwrite(read_messages=False),
            interaction.user: discord.PermissionOverwrite(read_messages=True, send_messages=True, attach_files=True, read_message_history=True),
            interaction.guild.me: discord.PermissionOverwrite(read_messages=True, send_messages=True, attach_files=True, read_message_history=True, manage_channels=True)
        }
        for sr in support_roles:
            overwrites[sr] = discord.PermissionOverwrite(read_messages=True, send_messages=True, attach_files=True, read_message_history=True, manage_messages=True)
        if not support_roles and support_role:
            overwrites[support_role] = discord.PermissionOverwrite(read_messages=True, send_messages=True, attach_files=True, read_message_history=True, manage_messages=True)

        try:
            create_kwargs = {
                "name": channel_name,
                "overwrites": overwrites,
                "reason": f"Support ticket opened by {interaction.user}"
            }
            if isinstance(category, discord.CategoryChannel):
                create_kwargs["category"] = category
            ticket_channel = await interaction.guild.create_text_channel(**create_kwargs)
        except discord.Forbidden:
            return await interaction.followup.send(embed=make_embed("I do not have permission to create channels on this server.", discord.Color.red()), ephemeral=True)
        except Exception as e:
            return await interaction.followup.send(embed=make_embed(f"Failed to create ticket channel: {e}", discord.Color.red()), ephemeral=True)

        create_active_ticket(interaction.guild.id, ticket_channel.id, interaction.user.id, subject, description, self.category_option)

        embed = discord.Embed(title=f"Ticket Opened: #{ticket_channel.name}", color=ORBIT_COLOR)
        embed.add_field(name="Category", value=self.category_option, inline=True)
        embed.add_field(name="Creator", value=interaction.user.mention, inline=True)
        if support_roles:
            embed.add_field(name="Assigned Team", value=" ".join(sr.mention for sr in support_roles), inline=True)
        elif support_role:
            embed.add_field(name="Assigned Team", value=support_role.mention, inline=True)
        for lbl, inp in self.custom_inputs:
            val = inp.value.strip() or "—"
            embed.add_field(name=lbl[:256], value=f"```\n{val[:950]}\n```", inline=False)

        control_view = TicketControlLayout()
        kwargs = {"embed": embed, "view": control_view}

        try:
            pings = [interaction.user.mention]
            if config.get("ping_support_roles", True):
                for sr in support_roles:
                    if sr.mention not in pings:
                        pings.append(sr.mention)
                if not support_roles and support_role and support_role.mention not in pings:
                    pings.append(support_role.mention)
            if config.get("ping_custom_role_enabled", False) and config.get("ping_custom_role_id"):
                c_rid = config.get("ping_custom_role_id")
                if str(c_rid).isdigit():
                    pings.append(f"<@&{c_rid}>")

            allowed_mentions = discord.AllowedMentions(users=True, roles=True)
            await ticket_channel.send(
                content=" ".join(pings),
                allowed_mentions=allowed_mentions
            )
            await ticket_channel.send(
                **kwargs,
                allowed_mentions=discord.AllowedMentions.none()
            )
        except Exception as e:
            print(f"SEND ERROR inside ticket_channel.send: {repr(e)}")
            try:
                await interaction.followup.send(embed=make_embed(f"Your ticket channel {ticket_channel.mention} was created, but sending the ticket embed failed with error:\n`{e}`", discord.Color.red()), ephemeral=True)
            except Exception:
                pass
            return

        await interaction.followup.send(embed=make_embed(f"Your support ticket has been created: {ticket_channel.mention}", discord.Color.green()), ephemeral=True)

class TicketControlLayout(discord.ui.View):
    def __init__(self, claimed_name: str = None):
        super().__init__(timeout=None)
        self.btn_claim = Button(
            label=f"Claimed by {claimed_name}" if claimed_name else "Claim Ticket",
            style=discord.ButtonStyle.secondary if claimed_name else discord.ButtonStyle.primary,
            custom_id="orbit:ticket_claim",
            disabled=bool(claimed_name)
        )
        self.btn_close = Button(
            label="Close Ticket",
            style=discord.ButtonStyle.danger,
            custom_id="orbit:ticket_close"
        )

        async def claim_cb(interaction: discord.Interaction):
            config = load_ticket_config(interaction.guild.id)
            support_role_id = config.get("support_role_id")
            ticket_data = config.get("active_tickets", {}).get(str(interaction.channel.id))

            if not ticket_data:
                try:
                    return await interaction.response.send_message(embed=make_embed("This channel is not recognized as an active ticket.", discord.Color.red()), ephemeral=True)
                except Exception:
                    return

            is_staff = interaction.user.guild_permissions.manage_guild
            if isinstance(interaction.user, discord.Member):
                staff_rids = [int(rid) for rid in config.get("support_role_ids", []) if str(rid).isdigit()]
                if support_role_id and str(support_role_id).isdigit():
                    staff_rids.append(int(support_role_id))
                for s in config.get("options_slots", []):
                    if isinstance(s, dict):
                        for rid in s.get("role_ids", []):
                            if str(rid).isdigit():
                                staff_rids.append(int(rid))
                        if s.get("role_id") and str(s.get("role_id")).isdigit():
                            staff_rids.append(int(s.get("role_id")))
                if any(r.id in staff_rids for r in getattr(interaction.user, 'roles', [])):
                    is_staff = True

            if not is_staff:
                try:
                    return await interaction.response.send_message(embed=make_embed("Only support staff can claim tickets.", discord.Color.red()), ephemeral=True)
                except Exception:
                    return

            if ticket_data.get("claimed_by"):
                try:
                    return await interaction.response.send_message(embed=make_embed(f"This ticket has already been claimed by <@{ticket_data['claimed_by']}>.", discord.Color.red()), ephemeral=True)
                except Exception:
                    return

            claim_ticket(interaction.guild.id, interaction.channel.id, interaction.user.id)

            updated_view = TicketControlLayout(claimed_name=interaction.user.display_name)
            embed = discord.Embed(title=f"Ticket Opened: #{interaction.channel.name}", color=ORBIT_COLOR)
            embed.add_field(name="Category", value=ticket_data.get('category', 'Unknown'), inline=False)
            embed.add_field(name="Creator", value=f"<@{ticket_data.get('creator_id')}>", inline=True)
            embed.add_field(name="Assigned Team", value=interaction.user.mention, inline=True)
            embed.add_field(name="Subject", value=ticket_data.get('subject', 'Unknown'), inline=False)
            embed.add_field(name="Description", value=f"```\n[Original Description Preserved]\n```", inline=False)
            kwargs = {"embed": embed, "view": updated_view}
            try:
                await interaction.message.edit(**kwargs, allowed_mentions=discord.AllowedMentions.none())
            except Exception:
                pass

            claim_embed = discord.Embed(title=f"Ticket Claimed: #{interaction.channel.name}", color=discord.Color.yellow())
            claim_embed.description = "A staff member is handling this ticket now."
            claim_embed.add_field(name="Assigned Staff", value=interaction.user.mention, inline=False)
            claim_embed.add_field(name="Subject", value=ticket_data.get('subject', 'Unknown'), inline=False)
            claim_kwargs = {"embed": claim_embed}
            try:
                await interaction.response.send_message(**claim_kwargs, allowed_mentions=discord.AllowedMentions.none())
            except (discord.NotFound, discord.HTTPException):
                pass

        async def close_cb(interaction: discord.Interaction):
            config = load_ticket_config(interaction.guild.id)
            support_role_id = config.get("support_role_id")
            ticket_data = config.get("active_tickets", {}).get(str(interaction.channel.id))

            if not ticket_data:
                try:
                    return await interaction.response.send_message(embed=make_embed("This channel is not an active ticket.", discord.Color.red()), ephemeral=True)
                except Exception:
                    return

            creator_id = ticket_data.get("creator_id")
            staff_only = bool(config.get("staff_only_close", False))
            is_staff = interaction.user.guild_permissions.manage_guild or interaction.user.guild_permissions.manage_channels
            if isinstance(interaction.user, discord.Member):
                slot_roles = [int(rid) for rid in config.get("support_role_ids", []) if str(rid).isdigit()]
                if support_role_id and str(support_role_id).isdigit():
                    slot_roles.append(int(support_role_id))
                for s in config.get("options_slots", []):
                    if isinstance(s, dict):
                        for rid in s.get("role_ids", []):
                            if str(rid).isdigit():
                                slot_roles.append(int(rid))
                        if s.get("role_id") and str(s.get("role_id")).isdigit():
                            slot_roles.append(int(s.get("role_id")))
                if any(r.id in slot_roles for r in getattr(interaction.user, 'roles', [])):
                    is_staff = True

            is_authorized = is_staff or (not staff_only and interaction.user.id == creator_id)

            if not is_authorized:
                try:
                    msg_err = "Only support staff can close tickets on this server." if staff_only else "You do not have permission to close this ticket (`Creator or Support Staff only`)."
                    return await interaction.response.send_message(embed=make_embed(msg_err, discord.Color.red()), ephemeral=True)
                except Exception:
                    return

            try:
                await interaction.response.send_message(embed=make_embed("Initiating ticket closure..."), ephemeral=True)
            except (discord.NotFound, discord.HTTPException):
                pass
            asyncio.create_task(close_ticket_flow(interaction.guild, interaction.channel, interaction.user, reason="Closed via ticket button"))

        self.btn_claim.callback = claim_cb
        self.btn_close.callback = close_cb

        self.add_item(self.btn_claim)
        self.add_item(self.btn_close)

    async def on_error(self, interaction: discord.Interaction, error: Exception, item: discord.ui.Item) -> None:
        if isinstance(error, discord.NotFound) and getattr(error, "code", None) in (10062, 10015):
            return
        if isinstance(error, discord.HTTPException) and error.status == 429:
            return
        await super().on_error(interaction, error, item)


class PersistentTicketPanelLayout(discord.ui.View):
    def __init__(self, title: str = "Support Ticket Desk", description: str = "Click the button below to open a direct support channel with our team.", instructions: str = "> Select your desired inquiry category in the dropdown menu below, then click **Create Ticket** to open your private channel.", options: list | None = None, options_slots: list | None = None):
        super().__init__(timeout=None)
        self.panel_title = title
        self.panel_desc = description
        self.panel_instructions = instructions
        self.panel_options = options or []
        self.options_slots = options_slots or []

        select_opts = []
        slots_to_render = self.options_slots if self.options_slots else self.panel_options
        for idx, slot in enumerate(slots_to_render[:25]):
            opt_str = slot.get("name", "").strip()[:100] if isinstance(slot, dict) else str(slot).strip()[:100]
            if not opt_str: continue
            select_opts.append(discord.SelectOption(label=opt_str, value=opt_str))
        if not select_opts:
            select_opts.append(discord.SelectOption(label="General Support", value="General Support"))

        panel_dropdown = Select(placeholder="Select a category...", options=select_opts, min_values=1, max_values=1, custom_id="orbit:ticket_panel_dropdown")
        
        async def _panel_dropdown_cb(interaction: discord.Interaction):
            val = interaction.data.get("values", ["General Support"])[0]
            _user_ticket_selections[interaction.user.id] = val
            try: await interaction.response.defer()
            except Exception: pass

        panel_dropdown.callback = _panel_dropdown_cb

        btn_create = Button(label="Create Ticket", style=discord.ButtonStyle.primary, custom_id="orbit:ticket_create_btn")
        
        async def _btn_create_cb(interaction: discord.Interaction):
            from Components.Systems.Tickets._storage import is_blacklisted
            from Components.Commands._utils import make_embed
            if interaction.guild and is_blacklisted(interaction.guild.id, interaction.user.id):
                return await interaction.response.send_message(embed=make_embed("You are blacklisted from opening support tickets on this server.", discord.Color.red()), ephemeral=True)
            
            config = load_ticket_config(interaction.guild.id) if interaction.guild else {}
            slots = config.get("options_slots", [])
            if not isinstance(slots, list) or not slots:
                opts = config.get("options", ["General Support"])
                slots = [{"name": str(o)} for o in opts]
            selected_opt = _user_ticket_selections.get(interaction.user.id)
            if not selected_opt and slots:
                if len(slots) == 1:
                    selected_opt = slots[0].get("name", "Support") if isinstance(slots[0], dict) else str(slots[0])
                elif len(slots) > 1:
                    return await interaction.response.send_message(embed=make_embed("Please choose a category option from the dropdown menu above first!"), ephemeral=True)
            if not selected_opt:
                selected_opt = "General Support"
            matched_slot = next((s for s in slots if isinstance(s, dict) and s.get("name") == selected_opt), None)
            modal = TicketOpenModal(category_option=selected_opt, slot_config=matched_slot)
            await interaction.response.send_modal(modal)

        btn_create.callback = _btn_create_cb

        self.add_item(panel_dropdown)
        self.add_item(btn_create)
