import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button, Modal, TextInput
from Commands.Whitelist._storage import load_whitelist, add_to_whitelist, remove_from_whitelist

class AddWhitelistModal(Modal, title="Add User to Global Whitelist"):
    user_id_input = TextInput(
        label="User ID",
        placeholder="Enter numeric ID",
        required=True,
        max_length=20
    )
    reason_input = TextInput(
        label="Reason",
        placeholder="Why should this user be immune to moderation actions?",
        required=False,
        max_length=150
    )

    def __init__(self, view: "WhitelistDashboardLayout"):
        super().__init__()
        self.dashboard_view = view

    async def on_submit(self, interaction: discord.Interaction):
        try:
            uid = int(self.user_id_input.value.strip())
        except ValueError:
            return await interaction.response.send_message("Invalid numeric User ID provided.", ephemeral=True)

        reason = self.reason_input.value.strip() or "Global Immunity Whitelist"
        success = add_to_whitelist(interaction.guild.id, uid, reason, interaction.user.id)

        if not success:
            return await interaction.response.send_message("User is already on the global whitelist for this server.", ephemeral=True)

        self.dashboard_view.refresh_content(interaction.guild.id)
        await interaction.response.edit_message(view=self.dashboard_view)
        await interaction.followup.send(f"Added <@{uid}> (`{uid}`) to the global moderation whitelist.", ephemeral=True)


class RemoveWhitelistModal(Modal, title="Remove User from Whitelist"):
    user_id_input = TextInput(
        label="User ID",
        placeholder="Enter numeric ID",
        required=True,
        max_length=20
    )

    def __init__(self, view: "WhitelistDashboardLayout"):
        super().__init__()
        self.dashboard_view = view

    async def on_submit(self, interaction: discord.Interaction):
        try:
            uid = int(self.user_id_input.value.strip())
        except ValueError:
            return await interaction.response.send_message("Invalid numeric User ID provided.", ephemeral=True)

        success = remove_from_whitelist(interaction.guild.id, uid)
        if not success:
            return await interaction.response.send_message("User is not on the whitelist.", ephemeral=True)

        self.dashboard_view.refresh_content(interaction.guild.id)
        await interaction.response.edit_message(view=self.dashboard_view)
        await interaction.followup.send(f"Removed <@{uid}> (`{uid}`) from the global moderation whitelist.", ephemeral=True)


class WhitelistDashboardLayout(LayoutView):
    def __init__(self, guild_id: int, author_id: int):
        super().__init__(timeout=300.0)
        self.guild_id = guild_id
        self.author_id = author_id
        self.refresh_content(guild_id)

    def refresh_content(self, guild_id: int):
        data = load_whitelist(guild_id)
        count = len(data)

        header_text = f"### Orbit Global Whitelist Manager\n**Status:** ACTIVE (`{count}` Protected Users)"
        if count == 0:
            list_text = "No users currently whitelisted.\n*Whitelisted members are 100% immune to AutoMod, Bans, Kicks, Timeouts, Mutes, and Warnings.*"
        else:
            lines = []
            for uid_str, info in list(data.items())[:10]:
                reason = info.get("reason", "Immunity")
                lines.append(f"• <@{uid_str}> (`{uid_str}`) - **Reason:** {reason}")
            list_text = "\n".join(lines)
            if count > 10:
                list_text += f"\n\n*And {count - 10} more protected users...*"

        self.clear_items()

        btn_add = Button(label="Add to Whitelist", style=discord.ButtonStyle.success, custom_id="wl_btn_add")
        btn_remove = Button(label="Remove User", style=discord.ButtonStyle.danger, custom_id="wl_btn_remove")
        btn_view = Button(label="View Full List", style=discord.ButtonStyle.secondary, custom_id="wl_btn_view")
        btn_close = Button(label="Close Dashboard", style=discord.ButtonStyle.danger, custom_id="wl_btn_close")

        async def add_cb(interaction: discord.Interaction):
            if interaction.user.id != interaction.guild.owner_id:
                return await interaction.response.send_message("Only the Server Owner can manage the whitelist.", ephemeral=True)
            modal = AddWhitelistModal(self)
            await interaction.response.send_modal(modal)

        async def remove_cb(interaction: discord.Interaction):
            if interaction.user.id != interaction.guild.owner_id:
                return await interaction.response.send_message("Only the Server Owner can manage the whitelist.", ephemeral=True)
            modal = RemoveWhitelistModal(self)
            await interaction.response.send_modal(modal)

        async def view_cb(interaction: discord.Interaction):
            if interaction.user.id != interaction.guild.owner_id:
                return await interaction.response.send_message("Only the Server Owner can view the whitelist.", ephemeral=True)
            from Commands.Whitelist.wl_list import _do_wl_list
            ctx = await interaction.client.get_context(interaction.message)
            ctx.guild = interaction.guild
            ctx.author = interaction.user
            await interaction.response.defer(ephemeral=True)
            data = load_whitelist(interaction.guild.id)
            from Commands.Whitelist.wl_list import WhitelistListLayout
            view = WhitelistListLayout(interaction.guild, interaction.client, data)
            await interaction.followup.send(view=view, ephemeral=True)

        async def close_cb(interaction: discord.Interaction):
            if interaction.user.id != interaction.guild.owner_id:
                return await interaction.response.send_message("Only the Server Owner can close the whitelist dashboard.", ephemeral=True)
            try:
                await interaction.message.delete()
            except Exception:
                await interaction.response.send_message("Dashboard closed.", ephemeral=True)

        btn_add.callback = add_cb
        btn_remove.callback = remove_cb
        btn_view.callback = view_cb
        btn_close.callback = close_cb

        self.container = Container(
            TextDisplay(content=header_text),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=list_text),
            Separator(spacing=discord.SeparatorSpacing.small),
            ActionRow(btn_add, btn_remove, btn_view, btn_close)
        )
        self.add_item(self.container)
