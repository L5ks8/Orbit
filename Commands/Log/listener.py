import discord
from discord.ext import commands
from Database.storagehandler import log_event

class LogListener(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_message_delete(self, message: discord.Message):
        if not message.guild or message.author.bot:
            return
        content = message.content or "*No text content*"
        await log_event(
            message.guild,
            "messages",
            "Message Deleted",
            f"**Author:** {message.author.mention} (`{message.author.id}`)\n**Channel:** {message.channel.mention}\n**Content:** {content[:900]}"
        )

    @commands.Cog.listener()
    async def on_message_edit(self, before: discord.Message, after: discord.Message):
        if not before.guild or before.author.bot or before.content == after.content:
            return
        await log_event(
            before.guild,
            "messages",
            "Message Edited",
            f"**Author:** {before.author.mention} (`{before.author.id}`)\n**Channel:** {before.channel.mention}\n**Before:** {before.content[:400] or '*None*'}\n**After:** {after.content[:400] or '*None*'}"
        )

    @commands.Cog.listener()
    async def on_member_join(self, member: discord.Member):
        await log_event(
            member.guild,
            "members",
            "Member Joined",
            f"**User:** {member.mention} (`{member.id}`)\n**Account Created:** <t:{int(member.created_at.timestamp())}:R>"
        )

    @commands.Cog.listener()
    async def on_member_remove(self, member: discord.Member):
        await log_event(
            member.guild,
            "members",
            "Member Left",
            f"**User:** {member.mention} (`{member.id}`)"
        )

    @commands.Cog.listener()
    async def on_member_ban(self, guild: discord.Guild, user: discord.User | discord.Member):
        try:
            async for entry in guild.audit_logs(limit=3, action=discord.AuditLogAction.ban):
                if entry.target.id == user.id:
                    if entry.user.id == self.bot.user.id:
                        return
                    moderator = f"{entry.user.mention} (`{entry.user.id}`)"
                    reason = entry.reason or "No reason provided"
                    break
            else:
                moderator = "Unknown"
                reason = "No reason provided"
        except Exception:
            moderator = "Unknown"
            reason = "No reason provided"

        await log_event(
            guild,
            "moderation",
            "Member Banned (via Discord UI)",
            f"**User:** {user.mention} (`{user.id}`)\n**Moderator:** {moderator}\n**Reason:** {reason}"
        )

    @commands.Cog.listener()
    async def on_member_unban(self, guild: discord.Guild, user: discord.User):
        try:
            async for entry in guild.audit_logs(limit=3, action=discord.AuditLogAction.unban):
                if entry.target.id == user.id:
                    if entry.user.id == self.bot.user.id:
                        return
                    moderator = f"{entry.user.mention} (`{entry.user.id}`)"
                    reason = entry.reason or "No reason provided"
                    break
            else:
                moderator = "Unknown"
                reason = "No reason provided"
        except Exception:
            moderator = "Unknown"
            reason = "No reason provided"

        await log_event(
            guild,
            "moderation",
            "Member Unbanned (via Discord UI)",
            f"**User:** {user.mention} (`{user.id}`)\n**Moderator:** {moderator}\n**Reason:** {reason}"
        )

    @commands.Cog.listener()
    async def on_member_update(self, before: discord.Member, after: discord.Member):
        if before.timed_out_until != after.timed_out_until:
            try:
                async for entry in after.guild.audit_logs(limit=3, action=discord.AuditLogAction.member_update):
                    if entry.target.id == after.id and hasattr(entry.after, "timed_out_until"):
                        if entry.user.id == self.bot.user.id:
                            return
                        moderator = f"{entry.user.mention} (`{entry.user.id}`)"
                        reason = entry.reason or "No reason provided"
                        break
                else:
                    moderator = "Unknown"
                    reason = "No reason provided"
            except Exception:
                moderator = "Unknown"
                reason = "No reason provided"

            if after.is_timed_out():
                await log_event(
                    after.guild,
                    "moderation",
                    "Member Timed Out (via Discord UI)",
                    f"**User:** {after.mention} (`{after.id}`)\n**Until:** <t:{int(after.timed_out_until.timestamp())}:f>\n**Moderator:** {moderator}\n**Reason:** {reason}"
                )
            else:
                await log_event(
                    after.guild,
                    "moderation",
                    "Member Timeout Removed (via Discord UI)",
                    f"**User:** {after.mention} (`{after.id}`)\n**Moderator:** {moderator}\n**Reason:** {reason}"
                )
        if before.nick != after.nick:
            await log_event(
                after.guild,
                "members",
                "Nickname Changed",
                f"**User:** {after.mention} (`{after.id}`)\n**Before:** `{before.nick or before.name}`\n**After:** `{after.nick or after.name}`"
            )
        if before.roles != after.roles:
            added = [r for r in after.roles if r not in before.roles]
            removed = [r for r in before.roles if r not in after.roles]
            if added:
                roles_str = ", ".join(r.mention for r in added)
                await log_event(
                    after.guild,
                    "roles",
                    "Roles Added to Member",
                    f"**User:** {after.mention} (`{after.id}`)\n**Roles Added:** {roles_str}"
                )
            if removed:
                roles_str = ", ".join(r.mention for r in removed)
                await log_event(
                    after.guild,
                    "roles",
                    "Roles Removed from Member",
                    f"**User:** {after.mention} (`{after.id}`)\n**Roles Removed:** {roles_str}"
                )

    @commands.Cog.listener()
    async def on_guild_channel_create(self, channel: discord.abc.GuildChannel):
        await log_event(
            channel.guild,
            "channels",
            "Channel Created",
            f"**Channel:** {channel.mention} (`{channel.name}` - `{channel.id}`)\n**Type:** `{channel.type}`"
        )

    @commands.Cog.listener()
    async def on_guild_channel_delete(self, channel: discord.abc.GuildChannel):
        await log_event(
            channel.guild,
            "channels",
            "Channel Deleted",
            f"**Name:** `{channel.name}` (`{channel.id}`)\n**Type:** `{channel.type}`"
        )

    @commands.Cog.listener()
    async def on_guild_role_create(self, role: discord.Role):
        await log_event(
            role.guild,
            "roles",
            "Role Created",
            f"**Role:** {role.mention} (`{role.name}` - `{role.id}`)"
        )

    @commands.Cog.listener()
    async def on_guild_role_delete(self, role: discord.Role):
        await log_event(
            role.guild,
            "roles",
            "Role Deleted",
            f"**Name:** `{role.name}` (`{role.id}`)"
        )

    @commands.Cog.listener()
    async def on_voice_state_update(self, member: discord.Member, before: discord.VoiceState, after: discord.VoiceState):
        if member.bot:
            return
        if not before.channel and after.channel:
            await log_event(
                member.guild,
                "voice",
                "Joined Voice Channel",
                f"**User:** {member.mention} (`{member.id}`)\n**Channel:** {after.channel.mention}"
            )
        elif before.channel and not after.channel:
            await log_event(
                member.guild,
                "voice",
                "Left Voice Channel",
                f"**User:** {member.mention} (`{member.id}`)\n**Channel:** {before.channel.mention}"
            )
        elif before.channel and after.channel and before.channel != after.channel:
            await log_event(
                member.guild,
                "voice",
                "Moved Voice Channel",
                f"**User:** {member.mention} (`{member.id}`)\n**From:** {before.channel.mention}\n**To:** {after.channel.mention}"
            )
        if not before.mute and after.mute:
            await log_event(
                member.guild,
                "moderation",
                "Voice Muted",
                f"**User:** {member.mention} (`{member.id}`)\n**Channel:** {after.channel.mention if after.channel else '*Unknown*'}"
            )
        elif before.mute and not after.mute:
            await log_event(
                member.guild,
                "moderation",
                "Voice Unmuted",
                f"**User:** {member.mention} (`{member.id}`)\n**Channel:** {after.channel.mention if after.channel else '*Unknown*'}"
            )

async def setup(bot: commands.Bot):
    await bot.add_cog(LogListener(bot))
