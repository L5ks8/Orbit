import io
import time
import asyncio
import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button, Modal, TextInput, Select, ChannelSelect, RoleSelect
from Commands.Ticket._storage import load_ticket_config, create_active_ticket, claim_ticket, close_active_ticket

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

    html_template = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Ticket Transcript: #{channel.name}</title>
    <style>
        body {{  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #313338; color: #dbdee1; margin: 0; padding: 20px; }} 
        .header {{  background-color: #2b2d31; padding: 20px; border-radius: 8px; margin-bottom: 20px; }} 
        .header h1 {{  margin: 0 0 10px 0; color: #f2f3f5; font-size: 24px; }} 
        .header p {{  margin: 5px 0; font-size: 14px; color: #b5bac1; }} 
        .message {{  display: flex; margin-bottom: 20px; }} 
        .avatar {{  width: 40px; height: 40px; border-radius: 50%; margin-right: 15px; background-color: #5865F2; flex-shrink: 0; overflow: hidden; }} 
        .avatar img {{  width: 100%; height: 100%; object-fit: cover; }} 
        .msg-content {{  display: flex; flex-direction: column; }} 
        .msg-header {{  margin-bottom: 5px; }} 
        .msg-author {{  font-weight: 600; color: #f2f3f5; margin-right: 10px; font-size: 16px; }} 
        .msg-time {{  font-size: 12px; color: #949ba4; }} 
        .msg-text {{  font-size: 15px; line-height: 1.4; word-wrap: break-word; white-space: pre-wrap; }} 
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
    msgs_html = []
    for m in messages:
        t_str = m.created_at.strftime("%Y-%m-%d %H:%M:%S")
        avatar_url = m.author.display_avatar.url if m.author.display_avatar else "https://cdn.discordapp.com/embed/avatars/0.png"
        import html
        safe_content = html.escape(m.content or "")
        msgs_html.append(f'''        <div class="message">
            <div class="avatar"><img src="{avatar_url}" alt="avatar"></div>
            <div class="msg-content">
                <div class="msg-header">
                    <span class="msg-author">{html.escape(m.author.display_name)}</span>
                    <span class="msg-time">{t_str}</span>
                </div>
                <div class="msg-text">{safe_content}</div>
            </div>
        </div>''')
    
    transcript_text = html_template + "\\n".join(msgs_html) + "\\n    </div>\\n</body>\\n</html>"
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

            section_closed = f"### Ticket Closed\n{executor_mention} closed a ticket."
            section_close_info = (
                f"### Close Information\n"
                f"> **Ticket Name:** {channel.name}\n"
                f"> **Ticket ID:** {channel.id}\n"
                f"> **Reason:** {reason}"
            )
            section_creator_info = (
                f"### Creator Information\n"
                f"> **Creator:** {creator_mention}\n"
                f"> **Creator Username:** {creator_username}\n"
                f"> **Creator ID:** {creator_id_str}"
            )
            section_executor_info = (
                f"### Executor Information\n"
                f"> **Executor:** {executor_mention}\n"
                f"> **Executor Username:** {executor_username}\n"
                f"> **Executor ID:** {executor_id_str}"
            )

            container = Container(
                TextDisplay(content=section_closed),
                Separator(spacing=discord.SeparatorSpacing.small),
                TextDisplay(content=section_close_info),
                Separator(spacing=discord.SeparatorSpacing.small),
                TextDisplay(content=section_creator_info),
                Separator(spacing=discord.SeparatorSpacing.small),
                TextDisplay(content=section_executor_info)
            )
            log_view = LayoutView()
            log_view.add_item(container)
            try:
                await log_channel.send(view=log_view, allowed_mentions=discord.AllowedMentions.none())
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

class TicketOpenModal(Modal, title="Open Support Ticket"):
    subject_input = TextInput(
        label="Ticket Subject",
        placeholder="Brief summary of your inquiry...",
        min_length=3,
        max_length=100,
        required=True
    )
    description_input = TextInput(
        label="Detailed Description",
        placeholder="Please explain your situation or question in full detail...",
        style=discord.TextStyle.paragraph,
        min_length=10,
        max_length=1000,
        required=True
    )

    def __init__(self, category_option: str = "General Support"):
        super().__init__()
        self.category_option = category_option

    async def on_submit(self, interaction: discord.Interaction):
        await interaction.response.defer(ephemeral=True)
        config = load_ticket_config(interaction.guild.id)
        if not config.get("enabled", False):
            return await interaction.followup.send("Support tickets are currently disabled on this server.", ephemeral=True)

        category_id = config.get("category_id")
        support_role_id = config.get("support_role_id")

        category = None
        support_role = None
        for slot in config.get("options_slots", []):
            if isinstance(slot, dict) and slot.get("name") == self.category_option:
                if slot.get("category_id"):
                    category = interaction.guild.get_channel(int(slot["category_id"]))
                if slot.get("role_id"):
                    support_role = interaction.guild.get_role(int(slot["role_id"]))
                break

        if not category and category_id:
            category = interaction.guild.get_channel(category_id)
        if not category or not isinstance(category, discord.CategoryChannel):
            return await interaction.followup.send("Ticket system misconfigured (`Configured ticket category not found for this option`).", ephemeral=True)

        if not support_role and support_role_id:
            support_role = interaction.guild.get_role(support_role_id)
        if not support_role:
            return await interaction.followup.send("Ticket system misconfigured (`Configured support role not found for this option`).", ephemeral=True)

        subject = self.subject_input.value.strip()
        description = self.description_input.value.strip()

        active_tickets = config.get("active_tickets", {})
        user_open_count = sum(1 for t in active_tickets.values() if t.get("creator_id") == interaction.user.id)
        if user_open_count >= 3:
            return await interaction.followup.send("You already have 3 open tickets! Please close an existing ticket before opening a new one.", ephemeral=True)

        counter = config.get("ticket_counter", 0) + 1
        clean_name = "".join(c for c in interaction.user.name.lower() if c.isalnum() or c in "-_")[:15]
        if not clean_name:
            clean_name = "user"
        clean_option = "".join(c for c in self.category_option.lower() if c.isalnum() or c in "-_")[:20]
        if not clean_option:
            clean_option = "ticket"
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
            support_role: discord.PermissionOverwrite(read_messages=True, send_messages=True, attach_files=True, read_message_history=True, manage_messages=True),
            interaction.guild.me: discord.PermissionOverwrite(read_messages=True, send_messages=True, attach_files=True, read_message_history=True, manage_channels=True)
        }

        try:
            ticket_channel = await interaction.guild.create_text_channel(
                name=channel_name,
                category=category,
                overwrites=overwrites,
                reason=f"Support ticket opened by {interaction.user}"
            )
        except discord.Forbidden:
            return await interaction.followup.send("I do not have permission to create channels inside the configured ticket category.", ephemeral=True)
        except Exception as e:
            return await interaction.followup.send(f"Failed to create ticket channel: {e}", ephemeral=True)

        create_active_ticket(interaction.guild.id, ticket_channel.id, interaction.user.id, subject, description, self.category_option)

        header_str = f"### Ticket Opened\n**Channel:** #{ticket_channel.name}\n**Category:** {self.category_option}"
        info_str = (
            f"**Creator:** {interaction.user.mention}\n"
            f"**Assigned Team:** {support_role.mention}\n\n"
            f"**Subject:** {subject}\n"
            f"**Description:**\n> {description.replace(chr(10), chr(10) + '> ')}"
        )

        container = Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=info_str)
        )
        control_view = TicketControlLayout(container=container)

        try:
            allowed_mentions = discord.AllowedMentions(users=True, roles=True)
            await ticket_channel.send(
                content=f"{interaction.user.mention} {support_role.mention}",
                allowed_mentions=allowed_mentions
            )
            await ticket_channel.send(
                view=control_view,
                allowed_mentions=discord.AllowedMentions.none()
            )
        except Exception as e:
            print(f"SEND ERROR inside ticket_channel.send: {repr(e)}")
            try:
                await interaction.followup.send(f"Your ticket channel {ticket_channel.mention} was created, but sending the ticket embed failed with error:\n`{e}`", ephemeral=True)
            except Exception:
                pass
            return

        await interaction.followup.send(f"Your support ticket has been created: {ticket_channel.mention}", ephemeral=True)

class TicketControlLayout(LayoutView):
    def __init__(self, claimed_name: str = None, container: Container = None):
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
                return await interaction.response.send_message("This channel is not recognized as an active ticket.", ephemeral=True)

            is_staff = interaction.user.guild_permissions.manage_guild
            if isinstance(interaction.user, discord.Member) and support_role_id:
                if any(r.id == support_role_id for r in getattr(interaction.user, 'roles', [])):
                    is_staff = True

            if not is_staff:
                return await interaction.response.send_message("Only support staff can claim tickets.", ephemeral=True)

            if ticket_data.get("claimed_by"):
                return await interaction.response.send_message(f"This ticket has already been claimed by <@{ticket_data['claimed_by']}>.", ephemeral=True)

            claim_ticket(interaction.guild.id, interaction.channel.id, interaction.user.id)

            header_str = f"### Ticket Claimed\n**Channel:** #{interaction.channel.name}"
            info_str = (
                f"**Assigned Staff:** {interaction.user.mention}\n"
                f"**Subject:** {ticket_data.get('subject', 'Unknown')}"
            )
            updated_container = Container(
                TextDisplay(content=header_str),
                Separator(spacing=discord.SeparatorSpacing.small),
                TextDisplay(content=info_str)
            )
            updated_view = TicketControlLayout(claimed_name=interaction.user.display_name, container=updated_container)
            try:
                await interaction.message.edit(view=updated_view, allowed_mentions=discord.AllowedMentions.none())
            except Exception:
                pass

            claim_header = f"### Ticket Claimed\n**Channel:** #{interaction.channel.name}"
            claim_info = "A staff member is handling this ticket now."
            status_container = Container(
                TextDisplay(content=claim_header),
                Separator(spacing=discord.SeparatorSpacing.small),
                TextDisplay(content=claim_info)
            )
            status_view = LayoutView()
            status_view.add_item(status_container)
            await interaction.response.send_message(view=status_view, allowed_mentions=discord.AllowedMentions.none())

        async def close_cb(interaction: discord.Interaction):
            config = load_ticket_config(interaction.guild.id)
            support_role_id = config.get("support_role_id")
            ticket_data = config.get("active_tickets", {}).get(str(interaction.channel.id))

            if not ticket_data:
                return await interaction.response.send_message("This channel is not an active ticket.", ephemeral=True)

            creator_id = ticket_data.get("creator_id")
            is_authorized = interaction.user.id == creator_id or interaction.user.guild_permissions.manage_guild
            if isinstance(interaction.user, discord.Member) and support_role_id:
                if any(r.id == support_role_id for r in getattr(interaction.user, 'roles', [])):
                    is_authorized = True

            if not is_authorized:
                return await interaction.response.send_message("You do not have permission to close this ticket (`Creator or Support Staff only`).", ephemeral=True)

            await interaction.response.send_message("Initiating ticket closure...", ephemeral=True)
            asyncio.create_task(close_ticket_flow(interaction.guild, interaction.channel, interaction.user, reason="Closed via ticket button"))

        self.btn_claim.callback = claim_cb
        self.btn_close.callback = close_cb

        row = ActionRow(self.btn_claim, self.btn_close)
        if container:
            container.add_item(row)
            self.add_item(container)
        else:
            self.add_item(row)

class TicketSlotRenameModal(Modal, title="Rename Selected Option Slot"):
    name_input = TextInput(label="New Option Category Name", placeholder="e.g. Macro, Giveaway, or Billing...", min_length=2, max_length=50, required=True)

    def __init__(self, dynamic_view, slot_index: int):
        super().__init__()
        self.dynamic_view = dynamic_view
        self.slot_index = slot_index
        config = load_ticket_config(dynamic_view.guild_id)
        slots = config.get("options_slots", [])
        if 0 <= slot_index < len(slots) and isinstance(slots[slot_index], dict):
            self.name_input.default = slots[slot_index].get("name", "")

    async def on_submit(self, interaction: discord.Interaction):
        await interaction.response.defer()
        config = load_ticket_config(interaction.guild.id)
        slots = config.get("options_slots", [])
        if 0 <= self.slot_index < len(slots) and isinstance(slots[self.slot_index], dict):
            slots[self.slot_index]["name"] = self.name_input.value.strip()
            config["options_slots"] = slots
            config["options"] = [s.get("name", "Option") for s in slots if isinstance(s, dict)]
            from Commands.Ticket._storage import save_ticket_config
            save_ticket_config(interaction.guild.id, config)
        self.dynamic_view.build_ui()
        try:
            await interaction.edit_original_response(view=self.dynamic_view)
        except Exception:
            pass

class TicketRenameAllModal(Modal, title="Rename All Ticket Option Names"):
    def __init__(self, dynamic_view):
        super().__init__()
        self.dynamic_view = dynamic_view
        config = load_ticket_config(dynamic_view.guild_id)
        self.slots = config.get("options_slots", [])[:5]
        for idx, slot in enumerate(self.slots):
            default_name = slot.get("name", f"Option {idx+1}") if isinstance(slot, dict) else str(slot)
            inp = TextInput(
                label=f"Option {idx+1} Name",
                placeholder=f"e.g. Option {idx+1} (or Macro/Giveaway)",
                default=default_name[:50],
                min_length=1,
                max_length=50,
                required=True
            )
            self.add_item(inp)

    async def on_submit(self, interaction: discord.Interaction):
        await interaction.response.defer()
        config = load_ticket_config(interaction.guild.id)
        slots = config.get("options_slots", [])
        for idx, child in enumerate(self.children):
            if idx < len(slots) and isinstance(slots[idx], dict):
                slots[idx]["name"] = child.value.strip()
        config["options_slots"] = slots
        config["options"] = [s.get("name", "Option") for s in slots if isinstance(s, dict)]
        from Commands.Ticket._storage import save_ticket_config
        save_ticket_config(interaction.guild.id, config)
        self.dynamic_view.build_ui()
        try:
            await interaction.edit_original_response(view=self.dynamic_view)
        except Exception:
            pass

class TicketConfigDynamicView(LayoutView):
    def __init__(self, guild_id: int):
        super().__init__(timeout=900)
        self.guild_id = guild_id
        self.selected_slot = 0
        self.build_ui()

    def build_ui(self):
        self.clear_items()
        config = load_ticket_config(self.guild_id)
        slots = config.get("options_slots", [])
        if not isinstance(slots, list) or not slots:
            opts = config.get("options", ["Option 1"])
            slots = [{"name": str(o), "role_id": config.get("support_role_id"), "category_id": config.get("category_id")} for o in opts]
            config["options_slots"] = slots

        panel_ch_id = config.get("panel_channel_id")
        log_ch_id = config.get("log_channel_id")
        title_str = config.get("panel_title", "Support Ticket Desk")

        panel_str = f"<#{panel_ch_id}>" if panel_ch_id else "`Not set`"
        log_str = f"<#{log_ch_id}>" if log_ch_id else "`None`"

        slot_lines = []
        for idx, slot in enumerate(slots[:10]):
            name = slot.get("name", f"Option {idx+1}") if isinstance(slot, dict) else str(slot)
            rid = slot.get("role_id") if isinstance(slot, dict) else None
            cid = slot.get("category_id") if isinstance(slot, dict) else None
            role_display = f"<@&{rid}>" if rid else "`Role Not Set`"
            cat_display = f"<#{cid}>" if cid else "`Category Not Set`"
            marker = "> " if idx == self.selected_slot else ""
            slot_lines.append(f"{marker}`{idx+1}.` **{name}** â€” Staff: {role_display} | Category: {cat_display}")

        slots_display = "\n".join(slot_lines)
        header_str = f"### Ticket Desk Builder ({len(slots)} options)\n**Panel:** {panel_str} | **Log:** {log_str}"
        info_str = (
            f"{slots_display}\n\n"
            f"Select a slot, then assign a role and category."
        )

        select_options = []
        for idx, slot in enumerate(slots[:10]):
            name = slot.get("name", f"Option {idx+1}") if isinstance(slot, dict) else str(slot)
            select_options.append(discord.SelectOption(label=f"Slot {idx+1}: {name}"[:100], value=str(idx), default=(idx == self.selected_slot)))
        if len(slots) > 1:
            select_options.append(discord.SelectOption(label="All Slots (Assign Role/Category to All Options)", value="all", default=(self.selected_slot == -1)))

        slot_select = Select(placeholder="1. Choose Option Slot to Configure...", options=select_options, min_values=1, max_values=1, custom_id="orbit:cfg_dyn_slot")
        
        async def slot_cb(interaction: discord.Interaction):
            val = interaction.data["values"][0]
            self.selected_slot = -1 if val == "all" else int(val)
            self.build_ui()
            await interaction.response.edit_message(view=self)

        slot_select.callback = slot_cb

        role_select = RoleSelect(placeholder="2. Assign Staff Role to Selected Slot...", min_values=1, max_values=1, custom_id="orbit:cfg_dyn_role")
        
        async def role_cb(interaction: discord.Interaction):
            config = load_ticket_config(self.guild_id)
            slots = config.get("options_slots", [])
            chosen_role_id = int(interaction.data["values"][0])
            if self.selected_slot == -1:
                for s in slots:
                    if isinstance(s, dict):
                        s["role_id"] = chosen_role_id
                config["support_role_id"] = chosen_role_id
            elif 0 <= self.selected_slot < len(slots) and isinstance(slots[self.selected_slot], dict):
                slots[self.selected_slot]["role_id"] = chosen_role_id
                if not config.get("support_role_id"):
                    config["support_role_id"] = chosen_role_id
            config["options_slots"] = slots
            from Commands.Ticket._storage import save_ticket_config
            save_ticket_config(self.guild_id, config)
            self.build_ui()
            await interaction.response.edit_message(view=self)

        role_select.callback = role_cb

        category_select = ChannelSelect(channel_types=[discord.ChannelType.category], placeholder="3. Assign Ticket Category to Selected Slot...", min_values=1, max_values=1, custom_id="orbit:cfg_dyn_cat")
        
        async def cat_cb(interaction: discord.Interaction):
            config = load_ticket_config(self.guild_id)
            slots = config.get("options_slots", [])
            chosen_cat_id = int(interaction.data["values"][0])
            if self.selected_slot == -1:
                for s in slots:
                    if isinstance(s, dict):
                        s["category_id"] = chosen_cat_id
                config["category_id"] = chosen_cat_id
            elif 0 <= self.selected_slot < len(slots) and isinstance(slots[self.selected_slot], dict):
                slots[self.selected_slot]["category_id"] = chosen_cat_id
                if not config.get("category_id"):
                    config["category_id"] = chosen_cat_id
            config["options_slots"] = slots
            from Commands.Ticket._storage import save_ticket_config
            save_ticket_config(self.guild_id, config)
            self.build_ui()
            await interaction.response.edit_message(view=self)

        category_select.callback = cat_cb

        btn_rename_all = Button(label="Rename Options (1-5)", style=discord.ButtonStyle.secondary, custom_id="orbit:cfg_rename_all")
        
        async def rename_all_cb(interaction: discord.Interaction):
            modal = TicketRenameAllModal(self)
            await interaction.response.send_modal(modal)

        btn_rename_all.callback = rename_all_cb

        btn_rename_one = Button(label="Rename Selected Slot", style=discord.ButtonStyle.secondary, custom_id="orbit:cfg_rename_one")
        
        async def rename_one_cb(interaction: discord.Interaction):
            idx = 0 if self.selected_slot == -1 else self.selected_slot
            modal = TicketSlotRenameModal(self, idx)
            await interaction.response.send_modal(modal)

        btn_rename_one.callback = rename_one_cb

        btn_publish = Button(label="Publish Ticket Desk", style=discord.ButtonStyle.primary, custom_id="orbit:cfg_dyn_publish")
        
        async def publish_cb(interaction: discord.Interaction):
            config = load_ticket_config(self.guild_id)
            panel_ch_id = config.get("panel_channel_id")
            if not panel_ch_id:
                return await interaction.response.send_message("Missing Target Panel Channel!", ephemeral=True)

            panel_ch = interaction.guild.get_channel(panel_ch_id)
            if not panel_ch or not isinstance(panel_ch, discord.TextChannel):
                return await interaction.response.send_message("Configured Target Panel Channel not found.", ephemeral=True)

            slots = config.get("options_slots", [])
            missing_cfg = False
            for s in slots:
                if isinstance(s, dict) and (not s.get("role_id") or not s.get("category_id")):
                    missing_cfg = True
                    break
            if missing_cfg:
                return await interaction.response.send_message("Every option slot must have both an assigned Staff Role AND Ticket Category before publishing! Use Row 2 and Row 3 above.", ephemeral=True)

            opt_names = [s.get("name", f"Option {idx+1}") for idx, s in enumerate(slots) if isinstance(s, dict)]
            config["options"] = opt_names

            live_view = PersistentTicketPanelLayout(
                title=config.get("panel_title", "Support Ticket Desk"),
                description=config.get("panel_description", "Click the button below to open a direct support channel with our team."),
                options_slots=slots
            )
            await panel_ch.send(view=live_view, allowed_mentions=discord.AllowedMentions.none())
            await interaction.response.send_message(f"Ticket Desk successfully sent to {panel_ch.mention} featuring {len(slots)} custom category buttons!", ephemeral=True)

        btn_publish.callback = publish_cb

        container = Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=info_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            ActionRow(slot_select),
            ActionRow(role_select),
            ActionRow(category_select),
            ActionRow(btn_rename_all, btn_rename_one, btn_publish)
        )
        self.add_item(container)

class PersistentTicketPanelLayout(LayoutView):
    def __init__(self, title: str = "Support Ticket Desk", description: str = "Click the button below to open a direct support channel with our team.", instructions: str = "> Select your desired inquiry category in the dropdown menu below, then click **Create Ticket** to open your private channel.", options: list | None = None, options_slots: list | None = None):
        super().__init__(timeout=None)
        self.panel_title = title
        self.panel_desc = description
        self.panel_instructions = instructions
        self.panel_options = options or []
        self.options_slots = options_slots or []
        self.build_ui()

    def build_ui(self):
        self.clear_items()
        header_str = f"### {self.panel_title}\n{self.panel_desc}"
        info_str = self.panel_instructions

        select_opts = []
        slots_to_render = self.options_slots if self.options_slots else self.panel_options
        for idx, slot in enumerate(slots_to_render[:25]):
            opt_str = slot.get("name", "").strip()[:100] if isinstance(slot, dict) else str(slot).strip()[:100]
            if not opt_str:
                continue
            select_opts.append(discord.SelectOption(label=opt_str, value=opt_str))

        if not select_opts:
            select_opts.append(discord.SelectOption(label="General Support", value="General Support"))

        panel_dropdown = Select(placeholder="Select a category...", options=select_opts, min_values=1, max_values=1, custom_id="orbit:ticket_panel_dropdown")
        
        async def _panel_dropdown_cb(interaction: discord.Interaction):
            val = interaction.data.get("values", ["General Support"])[0]
            _user_ticket_selections[interaction.user.id] = val
            try:
                await interaction.response.defer()
            except Exception:
                pass

        panel_dropdown.callback = _panel_dropdown_cb

        btn_create = Button(label="Create Ticket", style=discord.ButtonStyle.primary, custom_id="orbit:ticket_create_btn")
        
        async def _btn_create_cb(interaction: discord.Interaction):
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
                    return await interaction.response.send_message("Please choose a category option from the dropdown menu above first!", ephemeral=True)
            if not selected_opt:
                selected_opt = "General Support"
            modal = TicketOpenModal(category_option=selected_opt)
            await interaction.response.send_modal(modal)

        btn_create.callback = _btn_create_cb

        container = Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=info_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            ActionRow(panel_dropdown),
            ActionRow(btn_create)
        )
        self.add_item(container)

