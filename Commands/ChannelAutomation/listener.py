import discord
from discord.ext import commands
from Commands.ChannelAutomation._storage import load_automation_config, save_automation_config
import re
import asyncio

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
        # 5. Auto Ban Channel (Honeypot)
        auto_ban_cfg = config.get("auto_ban", {})
        ban_channel_id = auto_ban_cfg.get("channel_id")
        if ban_channel_id and str(message.channel.id) == ban_channel_id:
            if not message.author.bot:
                exempt_users = auto_ban_cfg.get("exempt_users", [])
                exempt_roles = auto_ban_cfg.get("exempt_roles", [])
                
                is_exempt = False
                if str(message.author.id) in exempt_users:
                    is_exempt = True
                else:
                    for role in message.author.roles:
                        if str(role.id) in exempt_roles:
                            is_exempt = True
                            break
                            
                if not is_exempt:
                    # Delete the message first
                    try:
                        await message.delete()
                    except (discord.Forbidden, discord.NotFound):
                        pass
                        
                    # Ban the user
                    try:
                        await message.author.ban(reason="Caught in Auto Ban Honeypot channel.")
                    except discord.Forbidden:
                        pass # Bot lacks permission
                        
                    # Update configuration
                    ban_count = auto_ban_cfg.get("ban_count", 0) + 1
                    auto_ban_cfg["ban_count"] = ban_count
                    config["auto_ban"] = auto_ban_cfg
                    save_automation_config(message.guild.id, config)
                    
                    # Update or send the honeypot message
                    template = auto_ban_cfg.get("message")
                    if not template:
                        template = (
                            "# :warning: POSTING IN THIS CHANNEL WILL GET YOU BANNED. :hammer:\n"
                            "## DO NOT SEND ANY MESSAGES HERE, OR YOU WILL BE __IRREVERSIBLY BANNED.__\n"
                            ":no_entry_sign: THIS IS A TRAP FOR COMPROMISED ACCOUNTS.\n\n"
                            ":information_source: Messages posted here will be **automatically** deleted, and the sender will be **automatically** banned by this bot.\n\n"
                            "**YOU HAVE BEEN WARNED. INTENTIONALLY SENDING MESSAGES WILL GET YOU BANNED WITH NO APPEALS.**\n"
                            "Ban Counter: `{count}`"
                        )
                    trap_text = template.replace("{count}", str(ban_count))
                    
                    msg_id = auto_ban_cfg.get("message_id")
                    trap_msg = None
                    if msg_id:
                        try:
                            trap_msg = await message.channel.fetch_message(int(msg_id))
                        except (discord.NotFound, discord.Forbidden, discord.HTTPException):
                            pass
                            
                    if trap_msg:
                        try:
                            await trap_msg.edit(content=trap_text)
                        except discord.HTTPException:
                            pass
                    else:
                        try:
                            new_msg = await message.channel.send(content=trap_text)
                            auto_ban_cfg["message_id"] = str(new_msg.id)
                            config["auto_ban"] = auto_ban_cfg
                            save_automation_config(message.guild.id, config)
                        except discord.Forbidden:
                            pass
            return # Always return to prevent other automations running in this channel

        # 6. Counting Channel
        counting_cfg = config.get("counting", {})
        counting_enabled = counting_cfg.get("enabled", False)
        counting_channel_id = str(counting_cfg.get("channel_id", "") or "").strip()

        if counting_enabled and counting_channel_id and str(message.channel.id) == counting_channel_id:
            if message.author.bot:
                return

            whitelisted_roles = counting_cfg.get("whitelisted_roles", [])
            # Check if member has any whitelisted role
            is_whitelisted = False
            if hasattr(message.author, "roles"):
                for role in message.author.roles:
                    if str(role.id) in whitelisted_roles:
                        is_whitelisted = True
                        break

            if is_whitelisted:
                return # Whitelisted role can chat freely without affecting count!

            content_clean = message.content.strip()
            current_count = int(counting_cfg.get("current_count", 0))
            last_user_id = str(counting_cfg.get("last_user_id", "") or "").strip()
            expected_number = current_count + 1

            is_number = content_clean.isdigit()
            parsed_number = int(content_clean) if is_number else None

            allow_solo = counting_cfg.get("allow_solo_counting", True)
            is_same_user = (not allow_solo) and (str(message.author.id) == last_user_id and current_count > 0)
            is_correct = is_number and (parsed_number == expected_number) and not is_same_user

            if is_correct:
                try:
                    await message.add_reaction("✅")
                except Exception:
                    pass

                counting_cfg["current_count"] = expected_number
                counting_cfg["last_user_id"] = str(message.author.id)
                config["counting"] = counting_cfg
                save_automation_config(message.guild.id, config)
            else:
                try:
                    await message.add_reaction("❌")
                except Exception:
                    pass

                if is_same_user:
                    fail_reason = f"{message.author.mention} counted twice in a row!"
                elif not is_number:
                    fail_reason = f"{message.author.mention} sent non-number text!"
                else:
                    fail_reason = f"{message.author.mention} sent wrong number (expected **{expected_number}**, got **{parsed_number}**)!"

                fail_embed = discord.Embed(
                    title="❌ Counting Failed!",
                    description=f"{fail_reason}\n\n**Count has been reset to 0.**",
                    color=discord.Color.red()
                )

                try:
                    await message.channel.send(
                        embed=fail_embed,
                        allowed_mentions=discord.AllowedMentions.none()
                    )
                except Exception:
                    pass

                # Temporarily lock channel for everyone
                try:
                    await message.channel.set_permissions(message.guild.default_role, send_messages=False, reason="Counting failed - temporary lock")
                except Exception:
                    pass

                # Countdown: 3, 2, 1, 0
                countdown_msg = None
                try:
                    countdown_msg = await message.channel.send("🔒 Channel locked! Restarting count in **3...**")
                    for i in [2, 1, 0]:
                        await asyncio.sleep(1)
                        if countdown_msg:
                            try:
                                await countdown_msg.edit(content=f"🔒 Channel locked! Restarting count in **{i}...**")
                            except Exception:
                                pass
                except Exception:
                    await asyncio.sleep(3)

                # Reset count in config
                counting_cfg["current_count"] = 0
                counting_cfg["last_user_id"] = ""
                config["counting"] = counting_cfg
                save_automation_config(message.guild.id, config)

                # Unlock channel
                try:
                    await message.channel.set_permissions(message.guild.default_role, send_messages=None, reason="Counting reset - unlocked")
                except Exception:
                    pass

                try:
                    if countdown_msg:
                        await countdown_msg.edit(content="🔓 **Channel unlocked!** Next number is **1**.")
                    else:
                        await message.channel.send("🔓 **Channel unlocked!** Next number is **1**.")
                except Exception:
                    pass

            return

async def setup(bot: commands.Bot):
    await bot.add_cog(ChannelAutomationListener(bot))
