import discord
from discord.ext import commands
import time
from collections import defaultdict
from Commands.OwnerOnly._monitor import record_command
from Commands.Security._storage import load_security_config
import datetime

SCAM_LINKS = [
    "steamcommunity-free.com", "discord-nitro.com", "free-nitro.ru", "steam-promo.com",
    "discord-app.net", "dlscord.com", "discord-gift.com", "discord-claim.com",
    "discord.events", "discord.link", "free-nitro.com"
]

class SecurityModule(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        # Format: {guild_id: {admin_id: [timestamp1, timestamp2, ...]}}
        self.action_logs = defaultdict(lambda: defaultdict(list))

    def _check_nuke(self, guild: discord.Guild, admin_id: int):
        config = load_security_config(guild.id)
        if not config.get("anti_nuke_enabled", True):
            return False
            
        current_time = time.time()
        config = load_security_config(guild.id)
        threshold = config.get("anti_nuke_threshold", 3)
        time_window = config.get("anti_nuke_time_window", 10)
        
        logs = self.action_logs[guild.id][admin_id]
        
        # Remove old logs
        logs = [t for t in logs if current_time - t <= time_window]
        logs.append(current_time)
        self.action_logs[guild.id][admin_id] = logs
        
        if len(logs) >= threshold:
            # Clear logs so it doesn't spam trigger
            self.action_logs[guild.id][admin_id] = []
            return True
        return False

    async def _punish_nuker(self, guild: discord.Guild, member: discord.Member):
        config = load_security_config(guild.id)
        threshold = config.get("anti_nuke_threshold", 3)
        time_window = config.get("anti_nuke_time_window", 10)
        try:
            # Remove all roles if possible, to isolate the rogue admin
            # This fails if the member is higher in hierarchy than the bot
            await member.edit(roles=[], reason="Orbit Anti-Nuke Triggered")
        except discord.Forbidden:
            pass 
        
        try:
            owner = guild.owner
            if owner:
                await owner.send(f"🚨 **ANTI-NUKE ALERT** 🚨\nUser {member.mention} (`{member.id}`) triggered the Anti-Nuke system in **{guild.name}** by performing {threshold} destructive actions within {time_window} seconds.\nTheir roles have been removed (if the bot had permission). Please check your server immediately.")
        except Exception:
            pass

    @commands.Cog.listener()
    async def on_guild_channel_delete(self, channel: discord.abc.GuildChannel):
        guild = channel.guild
        try:
            async for entry in guild.audit_logs(action=discord.AuditLogAction.channel_delete, limit=1):
                if entry.target.id == channel.id:
                    if entry.user.id == self.bot.user.id:
                        return
                    if self._check_nuke(guild, entry.user.id):
                        member = guild.get_member(entry.user.id)
                        if member:
                            await self._punish_nuker(guild, member)
                    break
        except discord.Forbidden:
            pass

    @commands.Cog.listener()
    async def on_guild_role_delete(self, role: discord.Role):
        guild = role.guild
        try:
            async for entry in guild.audit_logs(action=discord.AuditLogAction.role_delete, limit=1):
                if entry.target.id == role.id:
                    if entry.user.id == self.bot.user.id:
                        return
                    if self._check_nuke(guild, entry.user.id):
                        member = guild.get_member(entry.user.id)
                        if member:
                            await self._punish_nuker(guild, member)
                    break
        except discord.Forbidden:
            pass

    @commands.Cog.listener()
    async def on_member_ban(self, guild: discord.Guild, user: discord.abc.User):
        try:
            async for entry in guild.audit_logs(action=discord.AuditLogAction.ban, limit=1):
                if entry.target.id == user.id:
                    if entry.user.id == self.bot.user.id:
                        return
                    if self._check_nuke(guild, entry.user.id):
                        member = guild.get_member(entry.user.id)
                        if member:
                            await self._punish_nuker(guild, member)
                    break
        except discord.Forbidden:
            pass

    @commands.Cog.listener()
    async def on_message(self, message: discord.Message):
        if message.author.bot or not message.guild:
            return

        config = load_security_config(message.guild.id)
        if not config.get("anti_scam_enabled", True):
            return

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

async def setup(bot: commands.Bot):
    await bot.add_cog(SecurityModule(bot))
