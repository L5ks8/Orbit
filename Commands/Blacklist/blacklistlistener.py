import discord
from discord.ext import commands
from Commands.Blacklist._storage import is_blacklisted
from Commands.Whitelist._storage import is_whitelisted
from Commands.Log._storage import log_event

class BlacklistListener(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_member_join(self, member: discord.Member):
        if is_blacklisted(member.guild.id, member.id):
            if is_whitelisted(member.guild.id, member.id):
                return
            try:
                await member.ban(reason="Auto-banned: User is blacklisted.")
                await log_event(
                    member.guild,
                    "moderation_action",
                    "Blacklisted User Auto-Banned",
                    f"**Target:** {member.mention} (`{member.id}`)\n**Reason:** Blacklisted user attempted to join the server."
                )
            except discord.Forbidden:
                pass
            except Exception:
                pass

async def setup(bot: commands.Bot):
    await bot.add_cog(BlacklistListener(bot))
