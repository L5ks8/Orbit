import asyncio
import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button, Modal, TextInput, Select, UserSelect
from Commands.JoinToCreate._storage import get_active_channel, update_active_channel, remove_active_channel

def build_jtc_container(data: dict) -> Container:
    owner_id = data.get("owner_id", "Unknown")
    owner_mention = f"<@{owner_id}>" if owner_id != "Unknown" else "Unknown"

    status_lock = "Locked" if data.get("locked") else "Unlocked"
    status_vis = "Hidden" if data.get("hidden") else "Visible"

    trusted_list = data.get("trusted_users", [])
    if trusted_list:
        trusted_display = ", ".join(f"<@{u}>" for u in trusted_list)
    else:
        trusted_display = "*No trusted users*"

    header_str = f"### Your Voice Channel\n**Owner:** {owner_mention}"
    status_str = f"**Channel Status**\n{status_lock} | {status_vis}\n\n**Trusted Users**\n{trusted_display}"
    footer_str = "-# Use the buttons below to manage your channel."

    return Container(
        TextDisplay(content=header_str),
        Separator(spacing=discord.SeparatorSpacing.small),
        TextDisplay(content=status_str),
        Separator(spacing=discord.SeparatorSpacing.small),
        TextDisplay(content=footer_str)
    )

class RenameVoiceModal(Modal, title="Rename Voice Channel"):
    name_input = TextInput(
        label="New Channel Name",
        placeholder="e.g. Gaming Lounge",
        min_length=1,
        max_length=50,
        required=True
    )

    def __init__(self, channel: discord.VoiceChannel, data: dict):
        super().__init__()
        self.channel = channel
        self.data = data
        self.name_input.default = channel.name

    async def on_submit(self, interaction: discord.Interaction):
        await interaction.response.defer(ephemeral=True)
        new_name = self.name_input.value.strip()
        try:
            await self.channel.edit(name=new_name, reason=f"Renamed by owner {interaction.user}")
            await interaction.followup.send(f"Successfully renamed channel to **{new_name}**.", ephemeral=True)
        except discord.Forbidden:
            await interaction.followup.send("I do not have permission to rename this channel.", ephemeral=True)
        except Exception as e:
            await interaction.followup.send(f"Failed to rename channel: {e}", ephemeral=True)

class LimitVoiceModal(Modal, title="Set Voice User Limit"):
    limit_input = TextInput(
        label="User Limit (0 for unlimited)",
        placeholder="e.g. 5",
        min_length=1,
        max_length=2,
        required=True
    )

    def __init__(self, channel: discord.VoiceChannel, data: dict):
        super().__init__()
        self.channel = channel
        self.data = data
        self.limit_input.default = str(channel.user_limit)

    async def on_submit(self, interaction: discord.Interaction):
        await interaction.response.defer(ephemeral=True)
        try:
            val = int(self.limit_input.value.strip())
            if val < 0 or val > 99:
                val = 0
        except ValueError:
            return await interaction.followup.send("Please enter a valid number between 0 and 99.", ephemeral=True)

        try:
            await self.channel.edit(user_limit=val, reason=f"User limit set by owner {interaction.user}")
            self.data["limit"] = val
            if interaction.guild:
                update_active_channel(interaction.guild.id, self.channel.id, self.data)
            await interaction.followup.send(f"User limit set to **{'Unlimited' if val == 0 else val}**.", ephemeral=True)
        except discord.Forbidden:
            await interaction.followup.send("I do not have permission to change the limit of this channel.", ephemeral=True)
        except Exception as e:
            await interaction.followup.send(f"Failed to change user limit: {e}", ephemeral=True)

class PersistentJTCControlLayout(LayoutView):
    def __init__(self, container: Container = None, data: dict = None):
        super().__init__(timeout=None)
        self.container = container
        self.data = data or {}

        self.btn_lock = Button(label="Lock", style=discord.ButtonStyle.secondary, custom_id="orbit:jtc_lock")
        self.btn_hide = Button(label="Hide", style=discord.ButtonStyle.secondary, custom_id="orbit:jtc_hide")
        self.btn_rename = Button(label="Rename", style=discord.ButtonStyle.secondary, custom_id="orbit:jtc_rename")
        self.btn_limit = Button(label="Limit", style=discord.ButtonStyle.secondary, custom_id="orbit:jtc_limit")

        self.btn_kick = Button(label="Kick", style=discord.ButtonStyle.danger, custom_id="orbit:jtc_kick")
        self.btn_trust = Button(label="Trust", style=discord.ButtonStyle.success, custom_id="orbit:jtc_trust")
        self.btn_claim = Button(label="Claim", style=discord.ButtonStyle.primary, custom_id="orbit:jtc_claim")
        self.btn_delete = Button(label="Delete", style=discord.ButtonStyle.danger, custom_id="orbit:jtc_delete")

        self.btn_lock.callback = self.on_lock
        self.btn_hide.callback = self.on_hide
        self.btn_rename.callback = self.on_rename
        self.btn_limit.callback = self.on_limit
        self.btn_kick.callback = self.on_kick
        self.btn_trust.callback = self.on_trust
        self.btn_claim.callback = self.on_claim
        self.btn_delete.callback = self.on_delete

        row1 = ActionRow(self.btn_lock, self.btn_hide, self.btn_rename, self.btn_limit)
        row2 = ActionRow(self.btn_kick, self.btn_trust, self.btn_claim, self.btn_delete)

        if self.container:
            self.container.add_item(row1)
            self.container.add_item(row2)
            self.add_item(self.container)

    async def _get_context(self, interaction: discord.Interaction) -> tuple[discord.VoiceChannel | None, dict | None]:
        if not interaction.guild:
            return None, None
        channel = None
        if isinstance(interaction.channel, discord.VoiceChannel):
            channel = interaction.channel
        elif interaction.user.voice and isinstance(interaction.user.voice.channel, discord.VoiceChannel):
            channel = interaction.user.voice.channel

        if not channel:
            return None, None

        data = get_active_channel(interaction.guild.id, channel.id)
        return channel, data

    async def _check_owner(self, interaction: discord.Interaction, data: dict) -> bool:
        if not data:
            await interaction.response.send_message("This voice channel is not registered as an active temporary channel.", ephemeral=True)
            return False
        if interaction.user.id != data.get("owner_id") and not interaction.user.guild_permissions.manage_channels:
            await interaction.response.send_message("Only the channel owner or server staff can use this control panel.", ephemeral=True)
            return False
        return True

    async def on_lock(self, interaction: discord.Interaction):
        channel, data = await self._get_context(interaction)
        if not await self._check_owner(interaction, data):
            return

        is_locked = data.get("locked", False)
        new_locked = not is_locked
        data["locked"] = new_locked

        try:
            await channel.set_permissions(interaction.guild.default_role, connect=not new_locked, reason=f"Voice locked toggle by {interaction.user}")
            update_active_channel(interaction.guild.id, channel.id, data)
            updated_container = build_jtc_container(data)
            updated_view = PersistentJTCControlLayout(container=updated_container, data=data)
            await interaction.response.edit_message(view=updated_view, allowed_mentions=discord.AllowedMentions.none())
            await interaction.followup.send(f"Voice channel is now **{'Locked' if new_locked else 'Unlocked'}**.", ephemeral=True)
        except Exception as e:
            if not interaction.response.is_done():
                await interaction.response.send_message(f"Failed to toggle lock: {e}", ephemeral=True)

    async def on_hide(self, interaction: discord.Interaction):
        channel, data = await self._get_context(interaction)
        if not await self._check_owner(interaction, data):
            return

        is_hidden = data.get("hidden", False)
        new_hidden = not is_hidden
        data["hidden"] = new_hidden

        try:
            await channel.set_permissions(interaction.guild.default_role, view_channel=not new_hidden, reason=f"Voice hide toggle by {interaction.user}")
            update_active_channel(interaction.guild.id, channel.id, data)
            updated_container = build_jtc_container(data)
            updated_view = PersistentJTCControlLayout(container=updated_container, data=data)
            await interaction.response.edit_message(view=updated_view, allowed_mentions=discord.AllowedMentions.none())
            await interaction.followup.send(f"Voice channel is now **{'Hidden' if new_hidden else 'Visible'}**.", ephemeral=True)
        except Exception as e:
            if not interaction.response.is_done():
                await interaction.response.send_message(f"Failed to toggle visibility: {e}", ephemeral=True)

    async def on_rename(self, interaction: discord.Interaction):
        channel, data = await self._get_context(interaction)
        if not await self._check_owner(interaction, data):
            return
        modal = RenameVoiceModal(channel, data)
        await interaction.response.send_modal(modal)

    async def on_limit(self, interaction: discord.Interaction):
        channel, data = await self._get_context(interaction)
        if not await self._check_owner(interaction, data):
            return
        modal = LimitVoiceModal(channel, data)
        await interaction.response.send_modal(modal)

    async def on_kick(self, interaction: discord.Interaction):
        channel, data = await self._get_context(interaction)
        if not await self._check_owner(interaction, data):
            return

        options = []
        for m in channel.members:
            if m.id != data.get("owner_id") and not m.bot:
                options.append(discord.SelectOption(label=m.display_name, value=str(m.id), description=f"@{m.name}"))

        if not options:
            return await interaction.response.send_message("No eligible members in the channel to kick.", ephemeral=True)

        select = Select(placeholder="Select a member to kick from the voice channel...", options=options)

        async def kick_cb(inter: discord.Interaction):
            await inter.response.defer(ephemeral=True)
            val = inter.data.get("values", ["none"])[0]
            target = inter.guild.get_member(int(val))
            if not target:
                return await inter.followup.send("Member not found.", ephemeral=True)
            try:
                if target.voice and target.voice.channel and target.voice.channel.id == channel.id:
                    await target.move_to(None, reason=f"Kicked from temp voice channel by owner {inter.user}")
                    await inter.followup.send(f"Kicked **{target.display_name}** from the voice channel.", ephemeral=True)
                else:
                    await inter.followup.send(f"**{target.display_name}** is no longer in this voice channel.", ephemeral=True)
            except discord.Forbidden:
                await inter.followup.send("I do not have permission to disconnect this member.", ephemeral=True)

        select.callback = kick_cb
        kick_view = discord.ui.View(timeout=60)
        kick_view.add_item(select)
        await interaction.response.send_message("Select a member to kick:", view=kick_view, ephemeral=True)

    async def on_trust(self, interaction: discord.Interaction):
        channel, data = await self._get_context(interaction)
        if not await self._check_owner(interaction, data):
            return

        user_select = UserSelect(placeholder="Select user(s) to trust in your voice channel...", min_values=1, max_values=5)

        async def trust_cb(inter: discord.Interaction):
            await inter.response.defer(ephemeral=True)
            selected_users = inter.data.get("values", [])
            trusted_list = data.get("trusted_users", [])
            added = []

            for uid_str in selected_users:
                uid = int(uid_str)
                if uid == inter.user.id or uid == inter.client.user.id:
                    continue
                member = inter.guild.get_member(uid)
                if not member:
                    try:
                        member = await inter.guild.fetch_member(uid)
                    except Exception:
                        member = None
                if member:
                    try:
                        await channel.set_permissions(member, read_messages=True, connect=True, view_channel=True, reason=f"Trusted by {inter.user}")
                        if uid not in trusted_list:
                            trusted_list.append(uid)
                        added.append(member.mention)
                    except Exception:
                        pass

            data["trusted_users"] = trusted_list
            update_active_channel(inter.guild.id, channel.id, data)

            msg_id = data.get("message_id")
            if msg_id:
                try:
                    msg = await channel.fetch_message(msg_id)
                    if msg:
                        updated_container = build_jtc_container(data)
                        updated_view = PersistentJTCControlLayout(container=updated_container, data=data)
                        await msg.edit(view=updated_view, allowed_mentions=discord.AllowedMentions.none())
                except Exception:
                    pass

            if added:
                await inter.followup.send(f"Trusted users added: {', '.join(added)}", ephemeral=True)
            else:
                await inter.followup.send("No new users were trusted.", ephemeral=True)

        user_select.callback = trust_cb
        trust_view = discord.ui.View(timeout=60)
        trust_view.add_item(user_select)
        await interaction.response.send_message("Select user(s) to trust:", view=trust_view, ephemeral=True)

    async def on_claim(self, interaction: discord.Interaction):
        channel, data = await self._get_context(interaction)
        if not channel or not data:
            return await interaction.response.send_message("This is not an active temporary voice channel.", ephemeral=True)

        if not interaction.user.voice or interaction.user.voice.channel.id != channel.id:
            return await interaction.response.send_message("You must be connected to this voice channel to claim ownership.", ephemeral=True)

        if interaction.user.id == data.get("owner_id"):
            return await interaction.response.send_message("You are already the owner of this voice channel.", ephemeral=True)

        current_owner = interaction.guild.get_member(data.get("owner_id"))
        if current_owner and current_owner in channel.members:
            return await interaction.response.send_message(f"The current channel owner ({current_owner.display_name}) is still connected!", ephemeral=True)

        data["owner_id"] = interaction.user.id
        update_active_channel(interaction.guild.id, channel.id, data)

        try:
            await channel.set_permissions(interaction.user, read_messages=True, connect=True, view_channel=True, manage_channels=True, reason=f"Claimed by {interaction.user}")
            updated_container = build_jtc_container(data)
            updated_view = PersistentJTCControlLayout(container=updated_container, data=data)
            await interaction.response.edit_message(view=updated_view, allowed_mentions=discord.AllowedMentions.none())
            await interaction.followup.send("You are now the **Owner** of this temporary voice channel.", ephemeral=True)
        except Exception as e:
            if not interaction.response.is_done():
                await interaction.response.send_message(f"Failed to claim channel: {e}", ephemeral=True)

    async def on_delete(self, interaction: discord.Interaction):
        channel, data = await self._get_context(interaction)
        if not await self._check_owner(interaction, data):
            return

        await interaction.response.send_message("Deleting temporary voice channel...", ephemeral=True)
        remove_active_channel(interaction.guild.id, channel.id)
        try:
            await channel.delete(reason=f"Deleted by owner {interaction.user}")
        except Exception:
            pass
