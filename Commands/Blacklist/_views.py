import re
import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button, Modal
from Commands.Blacklist._storage import load_blacklist, add_to_blacklist, remove_from_blacklist
from Commands.Whitelist._storage import is_whitelisted

class AddBlacklistModal(Modal, title="Add ID to Blacklist"):
    def __init__(self, parent_view: "BlacklistListLayout"):
        super().__init__()
        self.parent_view = parent_view
        self.target_id = discord.ui.TextInput(label="User ID", placeholder="e.g. 123456789012345678", required=True)
        self.reason = discord.ui.TextInput(label="Reason", placeholder="Why is this user blacklisted?", required=False)
        self.add_item(self.target_id)
        self.add_item(self.reason)

    async def on_submit(self, interaction: discord.Interaction):
        clean_id_str = re.sub(r"\D", "", self.target_id.value)
        if not clean_id_str:
            return await interaction.response.send_message("Please provide a valid numeric ID.", ephemeral=True)
        user_id = int(clean_id_str)

        if is_whitelisted(interaction.guild_id, user_id):
            return await interaction.response.send_message("This user is on the global moderation whitelist (`Immune to Blacklist`).", ephemeral=True)

        reason_str = self.reason.value or "No reason provided"
        success = add_to_blacklist(interaction.guild_id, user_id, reason_str, interaction.user.id)
        if not success:
            return await interaction.response.send_message(f"ID `{user_id}` is already on the command blacklist.", ephemeral=True)

        data = load_blacklist(interaction.guild_id)
        self.parent_view.update_view(data)
        await interaction.response.edit_message(view=self.parent_view)
        await interaction.followup.send(f"Added ID `{user_id}` to the command blacklist.", ephemeral=True)

class RemoveBlacklistModal(Modal, title="Remove ID from Blacklist"):
    def __init__(self, parent_view: "BlacklistListLayout"):
        super().__init__()
        self.parent_view = parent_view
        self.target_id = discord.ui.TextInput(label="User ID to Remove", placeholder="e.g. 123456789012345678", required=True)
        self.add_item(self.target_id)

    async def on_submit(self, interaction: discord.Interaction):
        clean_id_str = re.sub(r"\D", "", self.target_id.value)
        if not clean_id_str:
            return await interaction.response.send_message("Please provide a valid numeric ID.", ephemeral=True)
        user_id = int(clean_id_str)

        success = remove_from_blacklist(interaction.guild_id, user_id)
        if not success:
            return await interaction.response.send_message(f"ID `{user_id}` is not currently on the command blacklist.", ephemeral=True)

        data = load_blacklist(interaction.guild_id)
        self.parent_view.update_view(data)
        await interaction.response.edit_message(view=self.parent_view)
        await interaction.followup.send(f"Removed ID `{user_id}` from the command blacklist.", ephemeral=True)

class BlacklistListLayout(discord.ui.View):
    def __init__(self, guild: discord.Guild, bot: commands.Bot, author_id: int):
        super().__init__(timeout=300)
        self.guild = guild
        self.bot = bot
        self.author_id = author_id
        self.data = load_blacklist(guild.id)

    def update_view(self, data: dict):
        self.data = data

    def get_kwargs(self):
        count = len(self.data)
        lines = []
        if count > 0:
            for i, (uid_str, info) in enumerate(list(self.data.items())[:15], 1):
                reason = info.get("reason", "No reason")
                user = self.guild.get_member(int(uid_str)) or self.bot.get_user(int(uid_str))
                mention_display = f"<@{uid_str}>" + (f" (`@{user.name}`)" if user and hasattr(user, "name") else "")
                lines.append(f"**{i}.** {mention_display} (`ID: {uid_str}`) - **Reason:** {reason}")

        btn_add = discord.ui.Button(label="Add ID", style=discord.ButtonStyle.success)
        btn_remove = discord.ui.Button(label="Remove ID", style=discord.ButtonStyle.secondary)
        btn_close = discord.ui.Button(label="Close", style=discord.ButtonStyle.danger)

        async def add_cb(interaction: discord.Interaction):
            if interaction.user.id != self.author_id:
                return await interaction.response.send_message("You cannot control this panel.", ephemeral=True)
            await interaction.response.send_modal(AddBlacklistModal(self))

        async def remove_cb(interaction: discord.Interaction):
            if interaction.user.id != self.author_id:
                return await interaction.response.send_message("You cannot control this panel.", ephemeral=True)
            await interaction.response.send_modal(RemoveBlacklistModal(self))

        async def close_cb(interaction: discord.Interaction):
            if interaction.user.id != self.author_id:
                return await interaction.response.send_message("You cannot control this panel.", ephemeral=True)
            try:
                await interaction.message.delete()
            except Exception:
                pass

        btn_add.callback = add_cb
        btn_remove.callback = remove_cb
        btn_close.callback = close_cb

        self.add_item(ActionRow(btn_add, btn_remove, btn_close))

