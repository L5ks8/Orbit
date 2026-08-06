import discord
from discord import app_commands
from discord.ext import commands
import re
import aiohttp
import io

steal_group = app_commands.Group(name="steal", description="Steal emojis and add them to your server", default_permissions=discord.Permissions(manage_expressions=True))

class StealCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        
    @steal_group.command(name="emoji", description="Steals an emoji and adds it to your server")
    @app_commands.describe(emoji="The custom emoji to steal (paste it here)", name="The name for the new emoji")
    async def steal_emoji(self, interaction: discord.Interaction, emoji: str, name: str):
        if not interaction.guild.me.guild_permissions.manage_expressions:
            return await interaction.response.send_message("I need the 'Manage Expressions' permission to add emojis.", ephemeral=True)
            
        await interaction.response.defer()
        
        # Match <a:name:id> or <:name:id>
        match = re.match(r"<(a?):([a-zA-Z0-9_]+):([0-9]+)>", emoji.strip())
        if not match:
            return await interaction.followup.send("Could not find a valid custom emoji. Make sure to paste a custom emoji, not a default unicode emoji.", ephemeral=True)
            
        is_animated = bool(match.group(1))
        emoji_id = match.group(3)
        
        ext = "gif" if is_animated else "png"
        url = f"https://cdn.discordapp.com/emojis/{emoji_id}.{ext}"
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as resp:
                    if resp.status != 200:
                        return await interaction.followup.send("Failed to download the emoji.", ephemeral=True)
                    image_bytes = await resp.read()
                    
            # Check size limits (Discord max is 256kb)
            if len(image_bytes) > 256 * 1024:
                return await interaction.followup.send("The emoji file is too large (exceeds 256KB limits).", ephemeral=True)
                
            new_emoji = await interaction.guild.create_custom_emoji(name=name, image=image_bytes, reason=f"Stolen by {interaction.user}")
            await interaction.followup.send(f"Successfully added emoji: {new_emoji} (`:{name}:`)")
        except discord.Forbidden:
            await interaction.followup.send("I don't have permission to add emojis.", ephemeral=True)
        except discord.HTTPException as e:
            await interaction.followup.send(f"Failed to add emoji: {e.text}", ephemeral=True)
        except Exception as e:
            await interaction.followup.send(f"An unexpected error occurred: {e}", ephemeral=True)


    @steal_group.command(name="emojiurl", description="Steals an emoji using its URL and adds it to your server")
    @app_commands.describe(url="The URL to the emoji image", name="The name for the new emoji")
    async def steal_emojiurl(self, interaction: discord.Interaction, url: str, name: str):
        if not interaction.guild.me.guild_permissions.manage_expressions:
            return await interaction.response.send_message("I need the 'Manage Expressions' permission to add emojis.", ephemeral=True)
            
        await interaction.response.defer()
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as resp:
                    if resp.status != 200:
                        return await interaction.followup.send("Failed to download the image from the provided URL.", ephemeral=True)
                    
                    # Basic content-type validation
                    content_type = resp.headers.get("Content-Type", "")
                    if not content_type.startswith("image/"):
                        return await interaction.followup.send("The URL does not point to a valid image.", ephemeral=True)
                        
                    image_bytes = await resp.read()
                    
            # Check size limits (Discord max is 256kb)
            if len(image_bytes) > 256 * 1024:
                return await interaction.followup.send("The image file is too large (exceeds 256KB limits).", ephemeral=True)
                
            new_emoji = await interaction.guild.create_custom_emoji(name=name, image=image_bytes, reason=f"Stolen by {interaction.user}")
            await interaction.followup.send(f"Successfully added emoji: {new_emoji} (`:{name}:`)")
        except discord.Forbidden:
            await interaction.followup.send("I don't have permission to add emojis.", ephemeral=True)
        except discord.HTTPException as e:
            await interaction.followup.send(f"Failed to add emoji: {e.text}", ephemeral=True)
        except Exception as e:
            await interaction.followup.send(f"An unexpected error occurred: {e}", ephemeral=True)


async def setup(bot: commands.Bot):
    bot.tree.add_command(steal_group)
    await bot.add_cog(StealCog(bot))
