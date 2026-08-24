

import discord
from discord.ext import commands
from Components.Commands.Invite._storage import (
    get_invite_cache, set_invite_cache, refresh_invite_cache,
    record_invite
)
from Components.Dashboard.Automoderation.log_storage import log_event


class InviteTrackerListener(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_ready(self):

        for guild in self.bot.guilds:
            await refresh_invite_cache(guild)

    @commands.Cog.listener()
    async def on_guild_join(self, guild: discord.Guild):
        await refresh_invite_cache(guild)

    @commands.Cog.listener()
    async def on_invite_create(self, invite: discord.Invite):
        if invite.guild:
            await refresh_invite_cache(invite.guild)
            
            await log_event(
                invite.guild,
                "invite_created",
                "Invite Created",
                f"**Inviter:** {invite.inviter.mention if invite.inviter else 'Unknown'} (`{invite.inviter.id if invite.inviter else 'Unknown'}`)\n"
                f"**Code:** `{invite.code}`\n"
                f"**Channel:** {invite.channel.mention if invite.channel else 'Unknown'}\n"
                f"**Max Uses:** {invite.max_uses if invite.max_uses else 'Unlimited'}\n"
                f"**Max Age:** {invite.max_age if invite.max_age else 'Unlimited'} seconds\n"
                f"**Temporary:** {'Yes' if invite.temporary else 'No'}",
                executor=invite.inviter
            )

    @commands.Cog.listener()
    async def on_invite_delete(self, invite: discord.Invite):
        if invite.guild:
            await refresh_invite_cache(invite.guild)

    @commands.Cog.listener()
    async def on_member_join(self, member: discord.Member):
        guild = member.guild
        if member.bot:
            return

        old_cache = get_invite_cache(guild.id)

        try:
            current_invites = await guild.invites()
        except discord.Forbidden:
            return
        except Exception:
            return

        new_cache = {}
        for inv in current_invites:
            new_cache[inv.code] = inv.uses or 0

        # Find which invite was used by diffing
        used_invite = None
        inviter = None
        for inv in current_invites:
            old_uses = old_cache.get(inv.code, 0)
            new_uses = inv.uses or 0
            if new_uses > old_uses:
                used_invite = inv
                inviter = inv.inviter
                break

        # Update cache
        set_invite_cache(guild.id, new_cache)

        if used_invite and inviter:
            record_invite(guild.id, member.id, inviter.id, used_invite.code)

            # Log invite event
            await log_event(
                guild,
                "invite_tracking",
                "Member Joined via Invite",
                f"**Member:** {member.mention} (`{member.id}`)\n"
                f"**Invited by:** {inviter.mention} (`{inviter.id}`)\n"
                f"**Invite Code:** `{used_invite.code}`\n"
                f"**Invite Uses:** {used_invite.uses}"
            )

    @commands.Cog.listener()
    async def on_member_remove(self, member: discord.Member):
        from Components.Commands.Invite._storage import remove_invite_record
        remove_invite_record(member.guild.id, member.id)

async def setup(bot: commands.Bot):
    await bot.add_cog(InviteTrackerListener(bot))


