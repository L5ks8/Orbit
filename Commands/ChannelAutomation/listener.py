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

async def setup(bot: commands.Bot):
    await bot.add_cog(ChannelAutomationListener(bot))
