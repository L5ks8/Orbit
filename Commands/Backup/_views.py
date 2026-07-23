import discord
from discord.ui import View, Select, Button
from Commands.Backup._storage import delete_backup, get_backup
from datetime import datetime

class ConfirmLoadView(View):
    def __init__(self, backup_id: str, cog):
        super().__init__(timeout=120)
        self.backup_id = backup_id
        self.cog = cog
        self.confirmed = False

    @discord.ui.button(label="Confirm Load (DESTRUCTIVE)", style=discord.ButtonStyle.danger, custom_id="backup_confirm_load")
    async def confirm_btn(self, interaction: discord.Interaction, button: Button):
        if interaction.user.id != interaction.guild.owner_id:
            return await interaction.response.send_message("Only the server owner can confirm this.", ephemeral=True)
        self.confirmed = True
        self.stop()
        await interaction.response.defer()
        await self.cog.execute_backup_load(interaction, self.backup_id)

    @discord.ui.button(label="Cancel", style=discord.ButtonStyle.secondary, custom_id="backup_cancel_load")
    async def cancel_btn(self, interaction: discord.Interaction, button: Button):
        if interaction.user.id != interaction.guild.owner_id:
            return await interaction.response.send_message("Only the server owner can cancel this.", ephemeral=True)
        self.stop()
        await interaction.response.edit_message(content="Backup load cancelled.", view=None, embed=None)

class OverwriteBackupView(View):
    def __init__(self, backups: list, new_backup_data: dict, cog):
        super().__init__(timeout=120)
        self.backups = backups
        self.new_backup_data = new_backup_data
        self.cog = cog

        options = []
        for b in backups:
            name = b.get("name", b["_id"])
            ts = b.get("timestamp", 0)
            date_str = datetime.fromtimestamp(ts).strftime("%Y-%m-%d %H:%M")
            options.append(discord.SelectOption(label=name[:100], description=f"Created: {date_str}", value=b["_id"]))

        self.select = Select(placeholder="Select a backup to OVERWRITE...", options=options)
        self.select.callback = self.select_callback
        self.add_item(self.select)

    async def select_callback(self, interaction: discord.Interaction):
        if interaction.user.id != interaction.guild.owner_id:
            return await interaction.response.send_message("Only the server owner can do this.", ephemeral=True)
        
        target_id = self.select.values[0]
        # Keep the target_id to overwrite the same slot, or just delete target_id and save new one
        delete_backup(target_id)
        
        await interaction.response.defer()
        await self.cog.save_new_backup(interaction, self.new_backup_data)

class BackupListView(View):
    def __init__(self, backups: list, cog):
        super().__init__(timeout=180)
        self.backups = backups
        self.cog = cog

        load_options = []
        delete_options = []
        for b in backups:
            name = b.get("name", b["_id"])
            ts = b.get("timestamp", 0)
            date_str = datetime.fromtimestamp(ts).strftime("%Y-%m-%d %H:%M")
            
            load_options.append(discord.SelectOption(label=name[:100], description=f"Load: {date_str}", value=b["_id"]))
            delete_options.append(discord.SelectOption(label=name[:100], description=f"Delete: {date_str}", value=b["_id"]))

        self.load_select = Select(placeholder="Select a backup to LOAD...", options=load_options, custom_id="backup_list_load")
        self.load_select.callback = self.load_callback
        
        self.delete_select = Select(placeholder="Select a backup to DELETE...", options=delete_options, custom_id="backup_list_delete")
        self.delete_select.callback = self.delete_callback

        self.add_item(self.load_select)
        self.add_item(self.delete_select)

    async def load_callback(self, interaction: discord.Interaction):
        if interaction.user.id != interaction.guild.owner_id:
            return await interaction.response.send_message("Only the server owner can do this.", ephemeral=True)
        target_id = self.load_select.values[0]
        backup_data = get_backup(target_id)
        if not backup_data:
            return await interaction.response.send_message("Backup not found.", ephemeral=True)
            
        confirm_view = ConfirmLoadView(target_id, self.cog)
        await interaction.response.send_message(
            f"**WARNING:** Loading the backup `{backup_data.get('name')}` will DELETE all existing roles, channels, and categories.\nAre you sure you want to proceed?",
            view=confirm_view,
            ephemeral=True
        )

    async def delete_callback(self, interaction: discord.Interaction):
        if interaction.user.id != interaction.guild.owner_id:
            return await interaction.response.send_message("Only the server owner can do this.", ephemeral=True)
        target_id = self.delete_select.values[0]
        delete_backup(target_id)
        await interaction.response.edit_message(content=f"Backup deleted successfully.", view=None, embed=None)
