import discord
from discord.ext import commands
from Database.storagehandler import load_join_roles

class JoinRoleListener(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_member_join(self, member: discord.Member):
        if member.bot:
            return

        role_ids = await load_join_roles(member.guild.id)
        if not role_ids:
            return

        roles_to_add = []
        for rid in role_ids:
            role = member.guild.get_role(rid)
            if role and not role.is_default() and not role.managed:
                if member.guild.me.top_role > role:
                    roles_to_add.append(role)

        if roles_to_add:
            try:
                await member.add_roles(*roles_to_add, reason="Automatic JoinRole assignment upon joining")
            except Exception:
                pass

async def setup(bot: commands.Bot):
    await bot.add_cog(JoinRoleListener(bot))
