import discord
from discord.ext import commands

class ClearCacheCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="clearcache", hidden=True)
    @commands.is_owner()
    async def clear_cache(self, ctx: commands.Context):
        cleared_list = []
        try:
            from Components.Commands.Whitelist._storage import _whitelist_cache
            _whitelist_cache.clear()
            cleared_list.append("Whitelist Cache")
        except Exception:
            pass

        try:
            from Components.Systems.Automoderation._storage import _automod_cache
            _automod_cache.clear()
            cleared_list.append("Automod Cache")
        except Exception:
            pass

        try:
            from Components.Commands.ServerStats._storage import _serverstats_cache
            _serverstats_cache.clear()
            cleared_list.append("ServerStats Cache")
        except Exception:
            pass

        try:
            from Components.Systems.Level._storage import _level_config_cache
            _level_config_cache.clear()
            cleared_list.append("Level Config Cache")
        except Exception:
            pass

        try:
            from Components.Systems.JoinToCreate._storage import _jtc_config_cache, _jtc_channels_cache
            _jtc_config_cache.clear()
            _jtc_channels_cache.clear()
            cleared_list.append("Join-To-Create Caches")
        except Exception:
            pass

        try:
            from Components.Systems.Roles._storage import _joinrole_cache
            _joinrole_cache.clear()
            cleared_list.append("JoinRole Cache")
        except Exception:
            pass

        cleared_str = "\n- ".join(cleared_list) if cleared_list else "No active caches to clear"
        embed = discord.Embed(
            title="System Caches Flushed",
            description=f"**Caches Cleared:**\n- {cleared_str}",
            color=0x2B2D31
        )
        await ctx.send(embed=embed, ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(ClearCacheCommand(bot))
