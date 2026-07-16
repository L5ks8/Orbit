import discord
from discord.ext import commands
from Commands.Log._storage import log_event

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
            "message_deleted",
            "Message Deleted",
            f"**Author:** {message.author.mention} (`{message.author.id}`)\n**Channel:** {message.channel.mention}\n**Content:** {content[:900]}",
            target_channel_obj=message.channel
        )

    @commands.Cog.listener()
    async def on_bulk_message_delete(self, messages: list[discord.Message]):
        if not messages:
            return
        guild = messages[0].guild
        channel = messages[0].channel
        if not guild:
            return
        await log_event(
            guild,
            "bulk_message_delete",
            "Bulk Message Delete",
            f"**Channel:** {channel.mention}\n**Amount:** {len(messages)} messages deleted",
            target_channel_obj=channel
        )

    @commands.Cog.listener()
    async def on_message_edit(self, before: discord.Message, after: discord.Message):
        if not before.guild or before.author.bot or before.content == after.content:
            return
        await log_event(
            before.guild,
            "message_edited",
            "Message Edited",
            f"**Author:** {before.author.mention} (`{before.author.id}`)\n**Channel:** {before.channel.mention}\n**Before:** {before.content[:400] or '*None*'}\n**After:** {after.content[:400] or '*None*'}",
            target_channel_obj=before.channel
        )

    @commands.Cog.listener()
    async def on_member_join(self, member: discord.Member):
        await log_event(
            member.guild,
            "member_joined",
            "Member Joined",
            f"**User:** {member.mention} (`{member.id}`)\n**Account Created:** <t:{int(member.created_at.timestamp())}:R>"
        )

    @commands.Cog.listener()
    async def on_member_remove(self, member: discord.Member):
        await log_event(
            member.guild,
            "member_left",
            "Member Left",
            f"**User:** {member.mention} (`{member.id}`)"
        )

    @commands.Cog.listener()
    async def on_member_ban(self, guild: discord.Guild, user: discord.User | discord.Member):
        executor = None
        try:
            async for entry in guild.audit_logs(limit=3, action=discord.AuditLogAction.ban):
                if entry.target.id == user.id:
                    if entry.user.id == self.bot.user.id:
                        return
                    moderator = f"{entry.user.mention} (`{entry.user.id}`)"
                    reason = entry.reason or "No reason provided"
                    executor = entry.user
                    break
            else:
                moderator = "Unknown"
                reason = "No reason provided"
        except Exception:
            moderator = "Unknown"
            reason = "No reason provided"

        await log_event(
            guild,
            "moderation_action",
            "Member Banned (via Discord UI)",
            f"**User:** {user.mention} (`{user.id}`)\n**Moderator:** {moderator}\n**Reason:** {reason}",
            executor=executor if isinstance(executor, discord.Member) else None
        )

    @commands.Cog.listener()
    async def on_member_unban(self, guild: discord.Guild, user: discord.User):
        executor = None
        try:
            async for entry in guild.audit_logs(limit=3, action=discord.AuditLogAction.unban):
                if entry.target.id == user.id:
                    if entry.user.id == self.bot.user.id:
                        return
                    moderator = f"{entry.user.mention} (`{entry.user.id}`)"
                    reason = entry.reason or "No reason provided"
                    executor = entry.user
                    break
            else:
                moderator = "Unknown"
                reason = "No reason provided"
        except Exception:
            moderator = "Unknown"
            reason = "No reason provided"

        await log_event(
            guild,
            "moderation_action",
            "Member Unbanned (via Discord UI)",
            f"**User:** {user.mention} (`{user.id}`)\n**Moderator:** {moderator}\n**Reason:** {reason}",
            executor=executor if isinstance(executor, discord.Member) else None
        )

    @commands.Cog.listener()
    async def on_member_update(self, before: discord.Member, after: discord.Member):
        executor = None
        if before.timed_out_until != after.timed_out_until:
            try:
                async for entry in after.guild.audit_logs(limit=3, action=discord.AuditLogAction.member_update):
                    if entry.target.id == after.id and hasattr(entry.after, "timed_out_until"):
                        if entry.user.id == self.bot.user.id:
                            return
                        moderator = f"{entry.user.mention} (`{entry.user.id}`)"
                        reason = entry.reason or "No reason provided"
                        executor = entry.user
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
                    "moderation_action",
                    "Member Timed Out (via Discord UI)",
                    f"**User:** {after.mention} (`{after.id}`)\n**Until:** <t:{int(after.timed_out_until.timestamp())}:f>\n**Moderator:** {moderator}\n**Reason:** {reason}",
                    executor=executor if isinstance(executor, discord.Member) else None
                )
            else:
                await log_event(
                    after.guild,
                    "moderation_action",
                    "Member Timeout Removed (via Discord UI)",
                    f"**User:** {after.mention} (`{after.id}`)\n**Moderator:** {moderator}\n**Reason:** {reason}",
                    executor=executor if isinstance(executor, discord.Member) else None
                )
        if before.nick != after.nick:
            await log_event(
                after.guild,
                "member_joined", # Fallback for nick changes since no specific event
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
                    "role_updated",
                    "Roles Added to Member",
                    f"**User:** {after.mention} (`{after.id}`)\n**Roles Added:** {roles_str}"
                )
            if removed:
                roles_str = ", ".join(r.mention for r in removed)
                await log_event(
                    after.guild,
                    "role_updated",
                    "Roles Removed from Member",
                    f"**User:** {after.mention} (`{after.id}`)\n**Roles Removed:** {roles_str}"
                )

    @commands.Cog.listener()
    async def on_guild_channel_create(self, channel: discord.abc.GuildChannel):
        await log_event(
            channel.guild,
            "channel_created",
            "Channel Created",
            f"**Channel:** {channel.mention} (`{channel.name}` - `{channel.id}`)\n**Type:** `{channel.type}`"
        )

    @commands.Cog.listener()
    async def on_guild_channel_delete(self, channel: discord.abc.GuildChannel):
        await log_event(
            channel.guild,
            "channel_deleted",
            "Channel Deleted",
            f"**Name:** `{channel.name}` (`{channel.id}`)\n**Type:** `{channel.type}`"
        )
        
    @commands.Cog.listener()
    async def on_guild_channel_update(self, before: discord.abc.GuildChannel, after: discord.abc.GuildChannel):
        if before.name == after.name and getattr(before, "category", None) == getattr(after, "category", None):
            return
        await log_event(
            after.guild,
            "channel_updated",
            "Channel Updated",
            f"**Channel:** {after.mention} (`{after.id}`)\n**Before Name:** `{before.name}`\n**After Name:** `{after.name}`",
            target_channel_obj=after
        )

    @commands.Cog.listener()
    async def on_guild_role_create(self, role: discord.Role):
        await log_event(
            role.guild,
            "role_created",
            "Role Created",
            f"**Role:** {role.mention} (`{role.name}` - `{role.id}`)"
        )

    @commands.Cog.listener()
    async def on_guild_role_delete(self, role: discord.Role):
        await log_event(
            role.guild,
            "role_deleted",
            "Role Deleted",
            f"**Name:** `{role.name}` (`{role.id}`)"
        )
        
    @commands.Cog.listener()
    async def on_guild_role_update(self, before: discord.Role, after: discord.Role):
        if before.name == after.name and before.color == after.color:
            return
        await log_event(
            after.guild,
            "role_updated",
            "Role Updated",
            f"**Role:** {after.mention} (`{after.id}`)\n**Before Name:** `{before.name}`\n**After Name:** `{after.name}`"
        )

    @commands.Cog.listener()
    async def on_voice_state_update(self, member: discord.Member, before: discord.VoiceState, after: discord.VoiceState):
        if member.bot:
            return
        if not before.channel and after.channel:
            await log_event(
                member.guild,
                "member_joined_voice",
                "Joined Voice Channel",
                f"**User:** {member.mention} (`{member.id}`)\n**Channel:** {after.channel.mention}",
                target_channel_obj=after.channel
            )
        elif before.channel and not after.channel:
            await log_event(
                member.guild,
                "member_left_voice",
                "Left Voice Channel",
                f"**User:** {member.mention} (`{member.id}`)\n**Channel:** {before.channel.mention}",
                target_channel_obj=before.channel
            )
        elif before.channel and after.channel and before.channel != after.channel:
            await log_event(
                member.guild,
                "member_moved_voice",
                "Moved Voice Channel",
                f"**User:** {member.mention} (`{member.id}`)\n**From:** {before.channel.mention}\n**To:** {after.channel.mention}",
                target_channel_obj=after.channel
            )
        if not before.mute and after.mute:
            await log_event(
                member.guild,
                "moderation_action",
                "Voice Muted",
                f"**User:** {member.mention} (`{member.id}`)\n**Channel:** {after.channel.mention if after.channel else '*Unknown*'}",
                target_channel_obj=after.channel
            )
        elif before.mute and not after.mute:
            await log_event(
                member.guild,
                "moderation_action",
                "Voice Unmuted",
                f"**User:** {member.mention} (`{member.id}`)\n**Channel:** {after.channel.mention if after.channel else '*Unknown*'}",
                target_channel_obj=after.channel
            )
            
    @commands.Cog.listener()
    async def on_scheduled_event_create(self, event: discord.ScheduledEvent):
        await log_event(
            event.guild,
            "scheduled_event_created",
            "Scheduled Event Created",
            f"**Name:** `{event.name}`\n**Creator:** {event.creator.mention if event.creator else 'Unknown'}",
            target_channel_obj=event.channel
        )

    @commands.Cog.listener()
    async def on_scheduled_event_delete(self, event: discord.ScheduledEvent):
        await log_event(
            event.guild,
            "scheduled_event_deleted",
            "Scheduled Event Deleted",
            f"**Name:** `{event.name}`",
            target_channel_obj=event.channel
        )

    @commands.Cog.listener()
    async def on_scheduled_event_update(self, before: discord.ScheduledEvent, after: discord.ScheduledEvent):
        if before.name == after.name and before.description == after.description:
            return
        await log_event(
            after.guild,
            "scheduled_event_updated",
            "Scheduled Event Updated",
            f"**Name:** `{after.name}`",
            target_channel_obj=after.channel
        )

    @commands.Cog.listener()
    async def on_command_completion(self, ctx: commands.Context):
        if getattr(ctx.command, "name", None) in ["ban", "kick", "timeout", "warn", "mute", "unmute", "unban"]:
            await log_event(
                ctx.guild,
                "mod_command_used",
                "Moderation Command Used",
                f"**User:** {ctx.author.mention} (`{ctx.author.id}`)\n**Command:** `{ctx.message.content}`",
                executor=ctx.author if isinstance(ctx.author, discord.Member) else None
            )
            
    @commands.Cog.listener()
    async def on_app_command_completion(self, interaction: discord.Interaction, command: discord.app_commands.Command | discord.app_commands.ContextMenu):
        if getattr(command, "name", None) in ["ban", "kick", "timeout", "warn", "mute", "unmute", "unban"]:
            await log_event(
                interaction.guild,
                "mod_command_used",
                "Moderation Command Used (Slash)",
                f"**User:** {interaction.user.mention} (`{interaction.user.id}`)\n**Command:** `/{command.name}`",
                executor=interaction.user if isinstance(interaction.user, discord.Member) else None
            )

async def setup(bot: commands.Bot):
    await bot.add_cog(LogListener(bot))
