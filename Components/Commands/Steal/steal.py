import discord
from discord import app_commands
from discord.ext import commands
import re
import aiohttp
import datetime
from Components.Commands._utils import make_embed

def _get_footer(guild_name: str) -> str:
    return f"{guild_name} • {datetime.datetime.now().strftime('%m/%d/%Y')}"

async def _do_steal_emoji(guild: discord.Guild, author: discord.Member | discord.User, send_func, emoji: str, name: str):
    if not guild.me.guild_permissions.manage_expressions:
        return await send_func("I need the 'Manage Expressions' permission to add emojis.", ephemeral=True)
        
    if any(e.name == name for e in guild.emojis):
        embed = discord.Embed(
            title="Name already exists!",
            description="The given name is already used for another emoji in your server!\nPlease make sure to use a unique name!",
            color=0x4AACBD
        )
        embed.set_footer(text=_get_footer(guild.name))
        return await send_func(embed=embed, ephemeral=True)
        
    # Deferred or typing should be handled before calling this, but we will assume it's deferred
    # Match <a:name:id> or <:name:id>
    match = re.match(r"<(a?):([a-zA-Z0-9_]+):([0-9]+)>", emoji.strip())
    if not match:
        return await send_func("Could not find a valid custom emoji. Make sure to paste a custom emoji, not a default unicode emoji.", ephemeral=True)
        
    is_animated = bool(match.group(1))
    emoji_id = match.group(3)
    
    ext = "gif" if is_animated else "png"
    url = f"https://cdn.discordapp.com/emojis/{emoji_id}.{ext}"
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as resp:
                if resp.status != 200:
                    return await send_func("Failed to download the emoji.", ephemeral=True)
                image_bytes = await resp.read()
                
        # Check size limits (Discord max is 256kb)
        if len(image_bytes) > 256 * 1024:
            return await send_func("The emoji file is too large (exceeds 256KB limits).", ephemeral=True)
            
        new_emoji = await guild.create_custom_emoji(name=name, image=image_bytes, reason=f"Stolen by {author}")
        
        embed = discord.Embed(
            title="Successfully added!",
            description=f"Emoji was sucessfully added you should be able to use {new_emoji} now :)",
            color=0x4AACBD
        )
        embed.set_footer(text=_get_footer(guild.name))
        await send_func(embed=embed)
    except discord.Forbidden:
        await send_func("I don't have permission to add emojis.", ephemeral=True)
    except discord.HTTPException as e:
        await send_func(f"Failed to add emoji: {e.text}", ephemeral=True)
    except Exception as e:
        await send_func(f"An unexpected error occurred: {e}", ephemeral=True)

async def _do_steal_emojiurl(guild: discord.Guild, author: discord.Member | discord.User, send_func, url: str, name: str):
    if not guild.me.guild_permissions.manage_expressions:
        return await send_func("I need the 'Manage Expressions' permission to add emojis.", ephemeral=True)
        
    if any(e.name == name for e in guild.emojis):
        embed = discord.Embed(
            title="Name already exists!",
            description="The given name is already used for another emoji in your server!\nPlease make sure to use a unique name!",
            color=0x4AACBD
        )
        embed.set_footer(text=_get_footer(guild.name))
        return await send_func(embed=embed, ephemeral=True)
        
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as resp:
                if resp.status != 200:
                    return await send_func("Failed to download the image from the provided URL.", ephemeral=True)
                
                content_type = resp.headers.get("Content-Type", "")
                if not content_type.startswith("image/"):
                    return await send_func("The URL does not point to a valid image.", ephemeral=True)
                    
                image_bytes = await resp.read()
                
        # Check size limits (Discord max is 256kb)
        if len(image_bytes) > 256 * 1024:
            return await send_func("The image file is too large (exceeds 256KB limits).", ephemeral=True)
            
        new_emoji = await guild.create_custom_emoji(name=name, image=image_bytes, reason=f"Stolen by {author}")
        
        embed = discord.Embed(
            title="Successfully added!",
            description=f"Emoji was sucessfully added you should be able to use {new_emoji} now :)",
            color=0x4AACBD
        )
        embed.set_footer(text=_get_footer(guild.name))
        await send_func(embed=embed)
    except discord.Forbidden:
        await send_func("I don't have permission to add emojis.", ephemeral=True)
    except discord.HTTPException as e:
        await send_func(f"Failed to add emoji: {e.text}", ephemeral=True)
    except Exception as e:
        await send_func(f"An unexpected error occurred: {e}", ephemeral=True)

@app_commands.default_permissions(manage_expressions=True)
class StealCog(commands.GroupCog, group_name="steal", group_description="Steal emojis and add them to your server"):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        
    @app_commands.command(name="emoji", description="Steals an emoji and adds it to your server")
    @app_commands.describe(emoji="The custom emoji to steal (paste it here)", name="The name for the new emoji")
    async def steal_emoji_slash(self, interaction: discord.Interaction, emoji: str, name: str):
        if not any(e.name == name for e in interaction.guild.emojis):
            await interaction.response.defer()
            
        async def _send(**kwargs):
            if interaction.response.is_done():
                return await interaction.followup.send(**kwargs)
            return await interaction.response.send_message(**kwargs)
            
        await _do_steal_emoji(interaction.guild, interaction.user, _send, emoji, name)

    @app_commands.command(name="emojiurl", description="Steals an emoji using its URL and adds it to your server")
    @app_commands.describe(url="The URL to the emoji image", name="The name for the new emoji")
    async def steal_emojiurl_slash(self, interaction: discord.Interaction, url: str, name: str):
        if not any(e.name == name for e in interaction.guild.emojis):
            await interaction.response.defer()
            
        async def _send(**kwargs):
            if interaction.response.is_done():
                return await interaction.followup.send(**kwargs)
            return await interaction.response.send_message(**kwargs)
            
        await _do_steal_emojiurl(interaction.guild, interaction.user, _send, url, name)

    @commands.group(name="steal", invoke_without_command=True)
    @commands.has_permissions(manage_expressions=True)
    async def steal_prefix(self, ctx: commands.Context):
        if ctx.invoked_subcommand is None:
            await ctx.send(embed=make_embed("Use `-steal emoji <emoji> <name>` or `-steal emojiurl <url> <name>`"))

    @steal_prefix.command(name="emoji")
    @commands.has_permissions(manage_expressions=True)
    async def steal_emoji_cmd(self, ctx: commands.Context, emoji: str, name: str):
        async def _send(**kwargs):
            # ephemeral=True doesn't work well with normal ctx.send in discord.py, but we can pass it
            kwargs.pop("ephemeral", None)
            return await ctx.send(**kwargs)
        
        async with ctx.typing():
            await _do_steal_emoji(ctx.guild, ctx.author, _send, emoji, name)

    @steal_prefix.command(name="emojiurl")
    @commands.has_permissions(manage_expressions=True)
    async def steal_emojiurl_cmd(self, ctx: commands.Context, url: str, name: str):
        async def _send(**kwargs):
            kwargs.pop("ephemeral", None)
            return await ctx.send(**kwargs)
            
        async with ctx.typing():
            await _do_steal_emojiurl(ctx.guild, ctx.author, _send, url, name)

    @steal_prefix.error
    @steal_emoji_cmd.error
    @steal_emojiurl_cmd.error
    async def steal_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send(embed=make_embed("You do not have permission to manage expressions.", discord.Color.red()), delete_after=10)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), delete_after=10)


async def setup(bot: commands.Bot):
    await bot.add_cog(StealCog(bot))