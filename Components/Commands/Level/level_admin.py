import discord
from discord import app_commands
from discord.ext import commands
from discord.ui import View, Button
import aiohttp
from Components.Commands.Level._storage import (
from Components.Commands._utils import make_embed
    get_user_xp, set_user_xp, total_xp_for_level, level_from_xp, get_db
)

class ConfirmResetView(View):
    def __init__(self, author_id: int):
        super().__init__(timeout=60)
        self.author_id = author_id
        self.value = None

    @discord.ui.button(label="Yes, Reset All", style=discord.ButtonStyle.danger)
    async def confirm_btn(self, interaction: discord.Interaction, button: Button):
        if interaction.user.id != self.author_id:
            return await interaction.response.send_message(embed=make_embed("This confirmation is not for you.", discord.Color.red()), ephemeral=True)
        self.value = True
        self.stop()
        await interaction.response.defer()

    @discord.ui.button(label="Cancel", style=discord.ButtonStyle.secondary)
    async def cancel_btn(self, interaction: discord.Interaction, button: Button):
        if interaction.user.id != self.author_id:
            return await interaction.response.send_message(embed=make_embed("This confirmation is not for you.", discord.Color.red()), ephemeral=True)
        self.value = False
        self.stop()
        await interaction.response.defer()

class LevelAdminCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    level = app_commands.Group(name="level", description="Level management commands", default_permissions=discord.Permissions(manage_guild=True))
    reset_group = app_commands.Group(name="reset", description="Reset commands", default_permissions=discord.Permissions(manage_guild=True))

    @level.command(name="add", description="Add levels to someone.")
    @app_commands.describe(user="The user to modify", levels="Amount of levels to add")
    async def level_add(self, interaction: discord.Interaction, user: discord.Member, levels: int):
        if levels <= 0:
            return await interaction.response.send_message(embed=make_embed("Please provide a valid number of levels (> 0).", discord.Color.red()), ephemeral=True)
            
        data = get_user_xp(interaction.guild.id, user.id)
        current_xp = data.get("total_xp", 0)
        current_level = level_from_xp(current_xp)
        
        new_level = current_level + levels
        new_xp = total_xp_for_level(new_level)
        
        data["total_xp"] = new_xp
        set_user_xp(interaction.guild.id, user.id, data)
        
        await interaction.response.send_message(embed=make_embed(f"Successfully added **{levels}** levels to {user.mention}. They are now **Level {new_level}**.", discord.Color.green()), ephemeral=True)

    @level.command(name="remove", description="Remove levels from someone.")
    @app_commands.describe(user="The user to modify", levels="Amount of levels to remove")
    async def level_remove(self, interaction: discord.Interaction, user: discord.Member, levels: int):
        if levels <= 0:
            return await interaction.response.send_message(embed=make_embed("Please provide a valid number of levels (> 0).", discord.Color.red()), ephemeral=True)
            
        data = get_user_xp(interaction.guild.id, user.id)
        current_xp = data.get("total_xp", 0)
        current_level = level_from_xp(current_xp)
        
        new_level = max(0, current_level - levels)
        new_xp = total_xp_for_level(new_level)
        
        data["total_xp"] = new_xp
        set_user_xp(interaction.guild.id, user.id, data)
        
        await interaction.response.send_message(embed=make_embed(f"Successfully removed **{levels}** levels from {user.mention}. They are now **Level {new_level}**.", discord.Color.green()), ephemeral=True)

    @level.command(name="set", description="Set the exact level of someone.")
    @app_commands.describe(user="The user to modify", level="The level to set them to")
    async def level_set(self, interaction: discord.Interaction, user: discord.Member, level: int):
        if level < 0:
            return await interaction.response.send_message(embed=make_embed("Level cannot be negative.", discord.Color.red()), ephemeral=True)
            
        data = get_user_xp(interaction.guild.id, user.id)
        new_xp = total_xp_for_level(level)
        data["total_xp"] = new_xp
        set_user_xp(interaction.guild.id, user.id, data)
        
        await interaction.response.send_message(embed=make_embed(f"Successfully set {user.mention} to **Level {level}**.", discord.Color.green()), ephemeral=True)

    @level.command(name="transfer", description="Transfer levels from one user to another.")
    @app_commands.describe(from_user="The user to take levels from", to_user="The user to give levels to")
    async def level_transfer(self, interaction: discord.Interaction, from_user: discord.Member, to_user: discord.Member):
        if from_user.id == to_user.id:
            return await interaction.response.send_message(embed=make_embed("You cannot transfer levels to the same user.", discord.Color.red()), ephemeral=True)
            
        from_data = get_user_xp(interaction.guild.id, from_user.id)
        to_data = get_user_xp(interaction.guild.id, to_user.id)
        
        from_xp = from_data.get("total_xp", 0)
        
        # Add to the new user
        to_data["total_xp"] = to_data.get("total_xp", 0) + from_xp
        set_user_xp(interaction.guild.id, to_user.id, to_data)
        
        # Reset the old user
        from_data["total_xp"] = 0
        set_user_xp(interaction.guild.id, from_user.id, from_data)
        
        await interaction.response.send_message(embed=make_embed(f"Successfully transferred all XP from {from_user.mention} to {to_user.mention}.", discord.Color.green()), ephemeral=True)

    @level.command(name="import", description="Import levels from another bot (MEE6).")
    async def level_import(self, interaction: discord.Interaction):
        await interaction.response.defer(ephemeral=True)
        
        url = f"https://mee6.xyz/api/plugins/levels/leaderboard/{interaction.guild.id}"
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as resp:
                    if resp.status == 401 or resp.status == 403 or resp.status == 404:
                        return await interaction.followup.send(embed=make_embed("Could not access your MEE6 leaderboard. Please ensure your MEE6 Leaderboard is set to **Public** in the MEE6 Dashboard, then try again.", discord.Color.red()), ephemeral=True)
                    if resp.status != 200:
                        return await interaction.followup.send(embed=make_embed(f"Failed to fetch data from MEE6. HTTP Status: {resp.status}", discord.Color.red()), ephemeral=True)
                        
                    data = await resp.json()
                    players = data.get("players", [])
                    
                    if not players:
                        return await interaction.followup.send(embed=make_embed("Found no players on the MEE6 leaderboard."), ephemeral=True)
                        
                    db = get_db()
                    col = db["LevelData"]
                    
                    imported_count = 0
                    for p in players:
                        uid = p.get("id")
                        xp = p.get("xp", 0)
                        msg_count = p.get("message_count", 0)
                        
                        if uid and xp > 0:
                            doc_id = f"{interaction.guild.id}_{uid}"
                            # Upsert the XP but don't overwrite if they already have more
                            existing = col.find_one({"_id": doc_id})
                            if existing:
                                new_total = existing.get("total_xp", 0) + xp
                                new_msg = existing.get("message_count", 0) + msg_count
                                col.update_one({"_id": doc_id}, {"$set": {"total_xp": new_total, "message_count": new_msg}})
                            else:
                                col.insert_one({
                                    "_id": doc_id,
                                    "guild_id": interaction.guild.id,
                                    "user_id": int(uid),
                                    "total_xp": xp,
                                    "message_count": msg_count,
                                    "voice_minutes": 0,
                                    "reaction_count": 0
                                })
                            imported_count += 1
                            
                    await interaction.followup.send(embed=make_embed(f"Successfully imported **{imported_count}** users' levels from MEE6!", discord.Color.green()), ephemeral=True)
                    
        except Exception as e:
            await interaction.followup.send(embed=make_embed(f"An error occurred while importing: {e}", discord.Color.red()), ephemeral=True)

    @reset_group.command(name="levels", description="Reset all levels on the server.")
    async def reset_levels(self, interaction: discord.Interaction):
        view = ConfirmResetView(interaction.user.id)
        
        embed = discord.Embed(
            title="️ Reset All Levels?",
            description="Are you absolutely sure you want to reset **ALL** levels and XP for everyone on this server?\n\n**This action cannot be undone!**",
            color=discord.Color.red()
        )
        
        await interaction.response.send_message(embed=embed, view=view, ephemeral=True)
        await view.wait()
        
        if view.value is True:
            db = get_db()
            col = db["LevelData"]
            result = col.delete_many({"guild_id": interaction.guild.id})
            
            success_embed = discord.Embed(
                title=" Levels Reset",
                description=f"Successfully deleted all XP and Level data for **{result.deleted_count}** users.",
                color=discord.Color.green()
            )
            await interaction.edit_original_response(embed=success_embed, view=None)
        elif view.value is False:
            await interaction.edit_original_response(content=" Level reset cancelled.", embed=None, view=None)
        else:
            await interaction.edit_original_response(content=" Confirmation timed out.", embed=None, view=None)


async def setup(bot: commands.Bot):
    await bot.add_cog(LevelAdminCog(bot))