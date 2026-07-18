import discord
from discord.ext import commands
from Commands.ChannelAutomation._storage import load_automation_config
import re

class ChannelAutomationListener(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.url_pattern = re.compile(r'https?://[^\s]+')

    @commands.Cog.listener()
    async def on_message(self, message: discord.Message):
        if not message.guild or message.author.id == self.bot.user.id:
            return

        config = load_automation_config(message.guild.id)
        
        # 1. Media-Only Channels
        media_cfg = config.get("media_only", {})
        media_channels = media_cfg.get("channels", [])
        if str(message.channel.id) in media_channels:
            ignore_bots = media_cfg.get("ignore_bots", True)
            if not (message.author.bot and ignore_bots):
                has_media = False
                if message.attachments:
                    has_media = True
                elif self.url_pattern.search(message.content):
                    has_media = True
                
                if not has_media:
                    try:
                        await message.delete()
                    except discord.Forbidden:
                        pass
                    except discord.NotFound:
                        pass
                    return # Message deleted, stop processing

        # 2. Command-Only Channels
        cmd_cfg = config.get("command_only", {})
        cmd_channels = cmd_cfg.get("channels", [])
        if str(message.channel.id) in cmd_channels:
            # We want to delete normal user messages. 
            # Bots and slash command responses don't get deleted.
            # Also allow prefix commands.
            if not message.author.bot:
                ctx = await self.bot.get_context(message)
                if not ctx.valid:
                    try:
                        await message.delete()
                    except discord.Forbidden:
                        pass
                    except discord.NotFound:
                        pass
                    return # Message deleted
        # 3. File-Only Channels
        file_only_list = config.get("file_only", [])
        for f_cfg in file_only_list:
            if str(message.channel.id) == f_cfg.get("channel_id"):
                ignore_bots = f_cfg.get("ignore_bots", True)
                if not (message.author.bot and ignore_bots):
                    extensions = f_cfg.get("extensions", "").lower()
                    allowed_exts = [ext.strip() for ext in extensions.split(",") if ext.strip()]
                    
                    has_valid_file = False
                    if message.attachments:
                        if not allowed_exts:
                            has_valid_file = True
                        else:
                            for attachment in message.attachments:
                                for ext in allowed_exts:
                                    if attachment.filename.lower().endswith(ext if ext.startswith('.') else f".{ext}"):
                                        has_valid_file = True
                                        break
                                if has_valid_file: break

                    if not has_valid_file:
                        try:
                            await message.delete()
                        except discord.Forbidden:
                            pass
                        except discord.NotFound:
                            pass
                        return # Message deleted

        # 4. Auto-Reaction Channels
        reaction_list = config.get("auto_reaction", [])
        for r_cfg in reaction_list:
            if str(message.channel.id) == r_cfg.get("channel_id"):
                ignore_bots = r_cfg.get("ignore_bots", True)
                if not (message.author.bot and ignore_bots):
                    emoji = r_cfg.get("emoji")
                    if emoji:
                        try:
                            # Try to add the reaction. If it's a custom emoji string like <:name:id>, discord.py might need partial emoji or just the string.
                            # message.add_reaction supports unicode and custom emoji strings.
                            await message.add_reaction(emoji.strip())
                        except discord.HTTPException:
                            pass # Emoji not found or bot lacks permissions
async def setup(bot: commands.Bot):
    await bot.add_cog(ChannelAutomationListener(bot))
