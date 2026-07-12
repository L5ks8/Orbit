import re
import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button, Modal, TextInput
from Commands.Whitelist._storage import load_whitelist, add_to_whitelist, remove_from_whitelist

class AddWhitelistModal(Modal, title="Add ID to Whitelist"):
    def __init__(self, parent_view: "WhitelistListLayout"):
        super().__init__()
        self.parent_view = parent_view
        self.target_id = TextInput(label="User ID", placeholder="e.g. 123456789012345678", required=True)
        self.reason = TextInput(label="Reason", placeholder="Why is this user whitelisted?", required=False)
        self.add_item(self.target_id)
        self.add_item(self.reason)

    async def on_submit(self, interaction: discord.Interaction):
        clean_id_str = re.sub(r"\D", "", self.target_id.value)
        if not clean_id_str:
            return await interaction.response.send_message("Please provide a valid numeric ID.", ephemeral=True)
        user_id = int(clean_id_str)

        reason_str = self.reason.value or "Whitelisted via panel"
        success = add_to_whitelist(interaction.guild_id, user_id, reason_str, interaction.user.id)
        if not success:
            return await interaction.response.send_message(f"ID `{user_id}` is already on the server moderation whitelist.", ephemeral=True)

        data = load_whitelist(interaction.guild_id)
        self.parent_view.update_view(data)
        await interaction.response.edit_message(view=self.parent_view)
        await interaction.followup.send(f"Added ID `{user_id}` to the server moderation whitelist.", ephemeral=True)

class RemoveWhitelistModal(Modal, title="Remove ID from Whitelist"):
    def __init__(self, parent_view: "WhitelistListLayout"):
        super().__init__()
        self.parent_view = parent_view
        self.target_id = TextInput(label="User ID to Remove", placeholder="e.g. 123456789012345678", required=True)
        self.add_item(self.target_id)

    async def on_submit(self, interaction: discord.Interaction):
        clean_id_str = re.sub(r"\D", "", self.target_id.value)
        if not clean_id_str:
            return await interaction.response.send_message("Please provide a valid numeric ID.", ephemeral=True)
        user_id = int(clean_id_str)

        success = remove_from_whitelist(interaction.guild_id, user_id)
        if not success:
            return await interaction.response.send_message(f"ID `{user_id}` is not currently on the server moderation whitelist.", ephemeral=True)

        data = load_whitelist(interaction.guild_id)
        self.parent_view.update_view(data)
        await interaction.response.edit_message(view=self.parent_view)
        await interaction.followup.send(f"Removed ID `{user_id}` from the server moderation whitelist.", ephemeral=True)

class WhitelistListLayout(LayoutView):
    def __init__(self, guild: discord.Guild, bot: commands.Bot, author_id: int):
        super().__init__(timeout=300)
        self.guild = guild
        self.bot = bot
        self.author_id = author_id
        self.data = load_whitelist(guild.id)
        self.build_ui()

    def update_view(self, data: dict):
        self.data = data
        self.build_ui()

    def build_ui(self):
        self.clear_items()
        count = len(self.data)
        if count == 0:
            content_text = "The moderation whitelist is currently empty for this server."
        else:
            lines = []
            for uid_str, info in list(self.data.items())[:15]:
                reason = info.get("reason", "No reason")
                user = self.guild.get_member(int(uid_str)) or self.bot.get_user(int(uid_str))
                mention_display = f"<@{uid_str}>" + (f" (`@{user.name}`)" if user and hasattr(user, "name") else "")
                lines.append(f"• {mention_display} (`ID: {uid_str}`) - **Reason:** {reason}")
            content_text = "\n".join(lines)
            if count > 15:
                content_text += f"\n\n*And {count - 15} more users...*"

        self.container = Container(
            TextDisplay(content=f"### Whitelist Overview ({count} Users)"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=content_text)
        )
        self.add_item(self.container)

        btn_add = Button(label="Add ID", style=discord.ButtonStyle.success)
        btn_remove = Button(label="Remove ID", style=discord.ButtonStyle.secondary)
        btn_close = Button(label="Close", style=discord.ButtonStyle.danger)

        async def add_cb(interaction: discord.Interaction):
            if interaction.user.id != self.author_id:
                return await interaction.response.send_message("You cannot control this panel.", ephemeral=True)
            await interaction.response.send_modal(AddWhitelistModal(self))

        async def remove_cb(interaction: discord.Interaction):
            if interaction.user.id != self.author_id:
                return await interaction.response.send_message("You cannot control this panel.", ephemeral=True)
            await interaction.response.send_modal(RemoveWhitelistModal(self))

        async def close_cb(interaction: discord.Interaction):
            if interaction.user.id != self.author_id:
                return await interaction.response.send_message("You cannot control this panel.", ephemeral=True)
            try:
                await interaction.message.delete()
            except Exception:
                self.clear_items()
                self.add_item(Container(TextDisplay(content="### Whitelist overview closed.")))
                await interaction.response.edit_message(view=self)
                self.stop()

        btn_add.callback = add_cb
        btn_remove.callback = remove_cb
        btn_close.callback = close_cb

        self.add_item(ActionRow(btn_add, btn_remove, btn_close))
