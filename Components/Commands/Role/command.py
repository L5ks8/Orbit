import discord
from discord.ext import commands
from .role import role_group
from .roles import allroles_cmd
from .add import RoleAddCog
from .all import RoleAllCog
from .create import RoleCreateCog
from .info import RoleInfoCog
from .rall import RoleRallCog
from .remove import RoleRemoveCog
from .settings import RoleSettingsCog

async def setup(bot: commands.Bot):
    bot.tree.add_command(role_group)
    bot.tree.add_command(allroles_cmd)
    await bot.add_cog(RoleAddCog(bot))
    await bot.add_cog(RoleAllCog(bot))
    await bot.add_cog(RoleCreateCog(bot))
    await bot.add_cog(RoleInfoCog(bot))
    await bot.add_cog(RoleRallCog(bot))
    await bot.add_cog(RoleRemoveCog(bot))
    await bot.add_cog(RoleSettingsCog(bot))
