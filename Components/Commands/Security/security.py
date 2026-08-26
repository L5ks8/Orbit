import discord
from discord.ext import commands
import time
from collections import defaultdict
from Components.Commands.Security._storage import load_security_config
import datetime
import asyncio

SCAM_LINKS = [
    "steamcommunity-free.com", "discord-nitro.com", "free-nitro.ru", "steam-promo.com",
    "discord-app.net", "dlscord.com", "discord-gift.com", "discord-claim.com",
    "discord.events", "discord.link", "free-nitro.com"
]

def parse_time(time_str: str) -> int:
    time_str = str(time_str).lower().strip()
    if time_str.endswith('s'): return int(time_str[:-1])
    if time_str.endswith('m'): return int(time_str[:-1]) * 60
    if time_str.endswith('h'): return int(time_str[:-1]) * 3600
    if time_str.endswith('d'): return int(time_str[:-1]) * 86400
    try:
        return int(time_str)
    except ValueError:
        return 0

class SecurityModule(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        # Format: {guild_id: {admin_id: [timestamp1, timestamp2, ...]}}
        self.anti_nuke_logs = defaultdict(lambda: defaultdict(list))
        # Format: {guild_id: [join_time1, join_time2, ...]}
        self.anti_raid_joins = defaultdict(list)
        # Format: {guild_id: {channel_id: [webhook_create_time1, ...]}}
        self.webhook_logs = defaultdict(lambda: defaultdict(list))

    def is_exempt(self, member: discord.Member, config: dict, module: str) -> bool:
        if member.id == member.guild.owner_id:
            return True
        if member.id == self.bot.user.id:
            return True
            
        module_cfg = config.get(module, {})
        exempt_users = str(module_cfg.get("exempt_users", "")).split(",")
        if str(member.id) in exempt_users:
            return True
            
        immune_users = str(module_cfg.get("immune_users", "")).split(",")
        if str(member.id) in immune_users:
            return True
            
        exempt_roles = module_cfg.get("exempt_roles", [])
        immune_roles = module_cfg.get("immune_roles", [])
        for role in member.roles:
            if str(role.id) in exempt_roles or str(role.id) in immune_roles:
                return True
                
        return False

    async def _punish_nuker(self, guild: discord.Guild, member: discord.Member, config: dict):
        cfg = config.get("anti_nuke", {})
        level = cfg.get("level", "recommended")
        test_mode = cfg.get("test_mode", False)
        
        try:
            owner = guild.owner
            if owner:
                await owner.send(f"⚠️ **ANTI-NUKE ALERT** ⚠️\nUser {member.mention} (`{member.id}`) triggered the Anti-Nuke system in **{guild.name}**.")
        except Exception:
            pass

        if test_mode:
            return

        try:
            if level == "conservative":
                # Strip roles -> kick
                await member.edit(roles=[], reason="Orbit Anti-Nuke: Conservative")
                await member.kick(reason="Orbit Anti-Nuke: Conservative")
            elif level == "recommended":
                # Quarantine (strip roles) -> Ban
                await member.edit(roles=[], reason="Orbit Anti-Nuke: Recommended")
                await member.ban(reason="Orbit Anti-Nuke: Recommended")
            elif level == "aggressive":
                # Instant Ban
                await member.ban(reason="Orbit Anti-Nuke: Aggressive")
        except discord.Forbidden:
            pass 

    def _check_nuke(self, guild: discord.Guild, admin_id: int, config: dict) -> bool:
        cfg = config.get("anti_nuke", {})
        if not cfg.get("enabled", False):
            return False
            
        current_time = time.time()
        # Default threshold is 10 actions in 30 seconds for simplicity if mass_emoji is used as baseline
        threshold = int(cfg.get("mass_emoji_threshold", 10))
        time_window = 30 
        
        logs = self.anti_nuke_logs[guild.id][admin_id]
        logs = [t for t in logs if current_time - t <= time_window]
        logs.append(current_time)
        self.anti_nuke_logs[guild.id][admin_id] = logs
        
        if len(logs) >= threshold:
            self.anti_nuke_logs[guild.id][admin_id] = []
            return True
        return False

    async def _handle_nuke_event(self, guild: discord.Guild, entry: discord.AuditLogEntry, config: dict):
        if not entry.user:
            return
        member = guild.get_member(entry.user.id)
        if not member:
            return
            
        if self.is_exempt(member, config, "anti_nuke"):
            return
            
        if self._check_nuke(guild, member.id, config):
            await self._punish_nuker(guild, member, config)

    @commands.Cog.listener()
    async def on_guild_channel_delete(self, channel: discord.abc.GuildChannel):
        guild = channel.guild
        config = load_security_config(guild.id)
        if not config.get("anti_nuke", {}).get("enabled", False):
            return
            
        try:
            async for entry in guild.audit_logs(action=discord.AuditLogAction.channel_delete, limit=1):
                if entry.target.id == channel.id:
                    await self._handle_nuke_event(guild, entry, config)
                    break
        except (discord.Forbidden, discord.HTTPException):
            pass

    @commands.Cog.listener()
    async def on_guild_role_delete(self, role: discord.Role):
        guild = role.guild
        config = load_security_config(guild.id)
        if not config.get("anti_nuke", {}).get("enabled", False):
            return
            
        try:
            async for entry in guild.audit_logs(action=discord.AuditLogAction.role_delete, limit=1):
                if entry.target.id == role.id:
                    await self._handle_nuke_event(guild, entry, config)
                    break
        except (discord.Forbidden, discord.HTTPException):
            pass

    @commands.Cog.listener()
    async def on_member_remove(self, member: discord.Member):
        guild = member.guild
        config = load_security_config(guild.id)
        if not config.get("anti_nuke", {}).get("enabled", False):
            return
            
        try:
            # Check if it was a kick
            async for entry in guild.audit_logs(action=discord.AuditLogAction.kick, limit=1):
                if entry.target.id == member.id:
                    await self._handle_nuke_event(guild, entry, config)
                    break
        except (discord.Forbidden, discord.HTTPException):
            pass

    @commands.Cog.listener()
    async def on_member_ban(self, guild: discord.Guild, user: discord.abc.User):
        config = load_security_config(guild.id)
        if not config.get("anti_nuke", {}).get("enabled", False):
            return
            
        try:
            async for entry in guild.audit_logs(action=discord.AuditLogAction.ban, limit=1):
                if entry.target.id == user.id:
                    await self._handle_nuke_event(guild, entry, config)
                    break
        except (discord.Forbidden, discord.HTTPException):
            pass
            
    @commands.Cog.listener()
    async def on_guild_role_update(self, before: discord.Role, after: discord.Role):
        guild = after.guild
        config = load_security_config(guild.id)
        cfg = config.get("anti_nuke", {})
        if not cfg.get("enabled", False) or not cfg.get("privilege_escalation", False):
            return
            
        # Privilege escalation check
        if not before.permissions.administrator and after.permissions.administrator:
            try:
                async for entry in guild.audit_logs(action=discord.AuditLogAction.role_update, limit=1):
                    if entry.target.id == after.id:
                        if entry.user:
                            member = guild.get_member(entry.user.id)
                            if member and not self.is_exempt(member, config, "anti_nuke"):
                                await self._punish_nuker(guild, member, config)
                        break
            except (discord.Forbidden, discord.HTTPException):
                pass

    @commands.Cog.listener()
    async def on_guild_update(self, before: discord.Guild, after: discord.Guild):
        config = load_security_config(after.id)
        cfg = config.get("anti_nuke", {})
        if not cfg.get("enabled", False) or not cfg.get("server_identity", False):
            return
            
        if before.name != after.name or before.icon != after.icon:
            try:
                async for entry in after.audit_logs(action=discord.AuditLogAction.guild_update, limit=1):
                    if entry.user:
                        member = after.get_member(entry.user.id)
                        if member and not self.is_exempt(member, config, "anti_nuke"):
                            await self._punish_nuker(after, member, config)
                            # Revert changes
                            try:
                                await after.edit(name=before.name, icon=before.icon if before.icon else None, reason="Orbit Anti-Nuke: Reverting server identity change")
                            except:
                                pass
                    break
            except (discord.Forbidden, discord.HTTPException):
                pass

    # --- ANTI-RAID ---
    @commands.Cog.listener()
    async def on_member_join(self, member: discord.Member):
        guild = member.guild
        config = load_security_config(guild.id)
        
        # Anti-Nuke: Block Unknown Bot Check
        nuke_cfg = config.get("anti_nuke", {})
        if nuke_cfg.get("enabled", False) and nuke_cfg.get("block_unknown_bot", False):
            if member.bot:
                try:
                    async for entry in guild.audit_logs(action=discord.AuditLogAction.bot_add, limit=1):
                        if entry.target.id == member.id:
                            inviter = guild.get_member(entry.user.id)
                            if inviter and not self.is_exempt(inviter, config, "anti_nuke"):
                                await self._punish_nuker(guild, inviter, config)
                                await member.kick(reason="Orbit Anti-Nuke: Block Unknown Bot")
                        break
                except (discord.Forbidden, discord.HTTPException):
                    pass
                return

        cfg = config.get("anti_raid", {})
        if not cfg.get("enabled", False):
            return
            
        # Handle Suspicious Account checks
        if cfg.get("suspicious_account", False):
            suspicious = False
            age_cutoff = parse_time(cfg.get("young_account_cutoff", "14d"))
            if (discord.utils.utcnow() - member.created_at).total_seconds() < age_cutoff:
                suspicious = True
            elif cfg.get("no_profile_picture", False) and member.avatar is None:
                suspicious = True
            
            if suspicious:
                action = cfg.get("suspicious_action", "flag")
                try:
                    if action == "timeout":
                        await member.timeout(discord.utils.utcnow() + datetime.timedelta(hours=1), reason="Orbit Anti-Raid: Suspicious Account")
                    elif action == "kick":
                        await member.kick(reason="Orbit Anti-Raid: Suspicious Account")
                    elif action == "ban":
                        await member.ban(reason="Orbit Anti-Raid: Suspicious Account")
                except discord.Forbidden:
                    pass
                    
                channel_id = cfg.get("suspicious_alert_channel")
                if channel_id:
                    channel = guild.get_channel(int(channel_id))
                    if channel:
                        try:
                            await channel.send(f"⚠️ **Suspicious Account Joined:** {member.mention} (`{member.id}`). Age: {(discord.utils.utcnow() - member.created_at).days} days.")
                        except:
                            pass

        # Handle Join Velocity (Mass Join Raid)
        current_time = time.time()
        threshold = int(cfg.get("join_threshold", 5))
        time_window = parse_time(cfg.get("join_time_window", "10s"))
        
        joins = self.anti_raid_joins[guild.id]
        joins = [t for t in joins if current_time - t <= time_window]
        joins.append(current_time)
        self.anti_raid_joins[guild.id] = joins
        
        if len(joins) >= threshold:
            action = cfg.get("action", "timeout")
            try:
                if action == "timeout":
                    await member.timeout(discord.utils.utcnow() + datetime.timedelta(hours=1), reason="Orbit Anti-Raid: Mass Join Raid")
                elif action == "kick":
                    await member.kick(reason="Orbit Anti-Raid: Mass Join Raid")
                elif action == "ban":
                    await member.ban(reason="Orbit Anti-Raid: Mass Join Raid")
            except discord.Forbidden:
                pass
                
            channel_id = cfg.get("alert_channel")
            if channel_id:
                channel = guild.get_channel(int(channel_id))
                if channel:
                    try:
                        await channel.send(f"🚨 **ANTI-RAID TRIGGERED** 🚨\nMass join detected. Action `{action}` taken on {member.mention}.")
                    except:
                        pass

    # --- WEBHOOK PROTECTION ---
    @commands.Cog.listener()
    async def on_webhooks_update(self, channel: discord.abc.GuildChannel):
        guild = channel.guild
        config = load_security_config(guild.id)
        cfg = config.get("webhook_protection", {})
        if not cfg.get("enabled", False):
            return
            
        try:
            async for entry in guild.audit_logs(action=discord.AuditLogAction.webhook_create, limit=1):
                if entry.target.channel.id == channel.id:
                    # Check if trusted
                    trusted = str(cfg.get("trusted_webhooks", "")).split(",")
                    if str(entry.target.id) in trusted:
                        return
                    
                    creator = entry.user
                    if creator and self.is_exempt(creator, config, "webhook_protection"):
                        return
                        
                    # Rate limiting check
                    rate_limit = int(cfg.get("rate_limit", 5))
                    current_time = time.time()
                    logs = self.webhook_logs[guild.id][channel.id]
                    logs = [t for t in logs if current_time - t <= 60]
                    logs.append(current_time)
                    self.webhook_logs[guild.id][channel.id] = logs
                    
                    if len(logs) > rate_limit:
                        try:
                            # Delete the webhook
                            webhook = await self.bot.fetch_webhook(entry.target.id)
                            await webhook.delete(reason="Orbit Webhook Protection: Rate limit exceeded")
                        except:
                            pass
                            
                        # Action on creator
                        action = cfg.get("action", "delete")
                        if creator and isinstance(creator, discord.Member):
                            try:
                                if action == "timeout":
                                    await creator.timeout(discord.utils.utcnow() + datetime.timedelta(hours=1), reason="Orbit Webhook Protection")
                                elif action == "kick":
                                    await creator.kick(reason="Orbit Webhook Protection")
                                elif action == "ban":
                                    await creator.ban(reason="Orbit Webhook Protection")
                            except discord.Forbidden:
                                pass
        except (discord.Forbidden, discord.HTTPException):
            pass

    @commands.Cog.listener()
    async def on_message(self, message: discord.Message):
        if not message.guild:
            return
            
        # Anti-Scam (Legacy support if still needed)
        config = load_security_config(message.guild.id)
        if config.get("anti_scam_enabled", False) and not message.author.bot:
            content = message.content.lower()
            if any(scam in content for scam in SCAM_LINKS):
                try:
                    await message.delete()
                    warning = await message.channel.send(f"⚠️ {message.author.mention}, that link is blacklisted for phishing/scams.")
                    try:
                        await message.author.timeout(discord.utils.utcnow() + datetime.timedelta(minutes=5), reason="Posting known scam links")
                    except discord.Forbidden:
                        pass
                    await warning.delete(delay=10)
                except Exception:
                    pass

        # Webhook Message Protection
        if message.webhook_id:
            cfg = config.get("webhook_protection", {})
            if cfg.get("enabled", False):
                delete_msg = False
                if cfg.get("block_everyone", False) and ("@everyone" in message.content or "@here" in message.content):
                    delete_msg = True
                elif cfg.get("block_invite_links", False) and ("discord.gg/" in message.content or "discord.com/invite/" in message.content):
                    delete_msg = True
                    
                if delete_msg:
                    try:
                        await message.delete()
                    except discord.Forbidden:
                        pass

async def setup(bot: commands.Bot):
    await bot.add_cog(SecurityModule(bot))
