import discord
from discord.ext import commands
from Components.Systems.JoinRole._storage import load_join_roles

class JoinRoleListener(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        
    def _get_server_tag(self, guild: discord.Guild) -> str | None:
        if hasattr(guild, 'clan') and getattr(guild, 'clan'):
            return getattr(guild.clan, 'tag', None)
        return None

    @commands.Cog.listener()
    async def on_member_join(self, member: discord.Member):
        config = load_join_roles(member.guild.id)
        if not config.get("enabled", False):
            return

        roles_to_add = []
        
        # User/Bot Roles
        if member.bot:
            if config.get("bot_roles_enabled", False):
                role_ids = config.get("bot_roles", [])
                for rid in role_ids:
                    role = member.guild.get_role(int(rid))
                    if role and not role.is_default() and not role.managed and member.guild.me.top_role > role:
                        roles_to_add.append(role)
        else:
            if config.get("user_roles_enabled", False):
                role_ids = config.get("user_roles", [])
                for rid in role_ids:
                    role = member.guild.get_role(int(rid))
                    if role and not role.is_default() and not role.managed and member.guild.me.top_role > role:
                        roles_to_add.append(role)
                        
        # Tag Roles
        if not member.bot and config.get("tag_roles_enabled", False) and config.get("tag_role"):
            tag_role = member.guild.get_role(int(config.get("tag_role")))
            if tag_role and not tag_role.is_default() and not tag_role.managed and member.guild.me.top_role > tag_role:
                server_tag = self._get_server_tag(member.guild)
                if server_tag:
                    server_tag_lower = server_tag.lower()
                    if server_tag_lower in member.display_name.lower() or server_tag_lower in member.name.lower():
                        roles_to_add.append(tag_role)

        if roles_to_add:
            try:
                await member.add_roles(*roles_to_add, reason="Automatic AutoRole/TagRole assignment")
            except Exception:
                pass

    @commands.Cog.listener()
    async def on_member_update(self, before: discord.Member, after: discord.Member):
        if before.bot:
            return
            
        if before.display_name == after.display_name and before.name == after.name:
            return
            
        config = load_join_roles(after.guild.id)
        if not config.get("enabled", False) or not config.get("tag_roles_enabled", False):
            return
            
        tag_role_id = config.get("tag_role")
        if not tag_role_id:
            return
            
        tag_role = after.guild.get_role(int(tag_role_id))
        if not tag_role or tag_role.is_default() or tag_role.managed or after.guild.me.top_role <= tag_role:
            return
            
        server_tag = self._get_server_tag(after.guild)
        if not server_tag:
            return
            
        server_tag_lower = server_tag.lower()
        has_tag_now = server_tag_lower in after.display_name.lower() or server_tag_lower in after.name.lower()
        had_tag_before = server_tag_lower in before.display_name.lower() or server_tag_lower in before.name.lower()
        
        if has_tag_now and not had_tag_before:
            if tag_role not in after.roles:
                try:
                    await after.add_roles(tag_role, reason="Auto Tag Role Assignment (Name updated)")
                except Exception:
                    pass
        elif had_tag_before and not has_tag_now:
            if tag_role in after.roles:
                try:
                    await after.remove_roles(tag_role, reason="Auto Tag Role Removal (Tag removed)")
                except Exception:
                    pass

async def setup(bot: commands.Bot):
    await bot.add_cog(JoinRoleListener(bot))

