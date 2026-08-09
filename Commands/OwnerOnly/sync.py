import discord
from discord.ext import commands

class SyncCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    def _get_embed(self, target_scope: str, count: int, extra_info: str = ""):
        desc = f"**Scope:** `{target_scope}`\n**Commands Synced:** `{count}`"
        if extra_info:
            desc += f"\n**Details:** {extra_info}"
        return discord.Embed(
            title="Orbit Command Tree Synced",
            description=desc,
            color=0x2B2D31
        )

    @commands.command(name="sync", description="Owner Only: Synchronizes slash commands globally or to a specific server.")
    @commands.is_owner()
    async def sync_cmd(self, ctx: commands.Context, *, option: str = None):
        async with ctx.typing():
            if option and option.lower() in ["here", "local"]:
                if not ctx.guild:
                    return await ctx.send("You must be inside a server to sync locally.")
                self.bot.tree.copy_global_to(guild=ctx.guild)
                synced = await self.bot.tree.sync(guild=ctx.guild)
                await ctx.send(embed=self._get_embed(f"Local Server ({ctx.guild.name})", len(synced)))
                return

            if option and option.lower().startswith("clear"):
                parts = option.split()
                if len(parts) > 1 and parts[1].isdigit():
                    guild_obj = discord.Object(id=int(parts[1]))
                    self.bot.tree.clear_commands(guild=guild_obj)
                    await self.bot.tree.sync(guild=guild_obj)
                    await ctx.send(embed=self._get_embed(f"Cleared Guild ID {parts[1]}", 0, "Cleared all local guild commands."))
                else:
                    if ctx.guild:
                        self.bot.tree.clear_commands(guild=ctx.guild)
                        await self.bot.tree.sync(guild=ctx.guild)
                        await ctx.send(embed=self._get_embed(f"Cleared Local Server ({ctx.guild.name})", 0, "Cleared local overrides."))
                return

            if option and option.isdigit():
                guild_obj = discord.Object(id=int(option))
                self.bot.tree.copy_global_to(guild=guild_obj)
                synced = await self.bot.tree.sync(guild=guild_obj)
                await ctx.send(embed=self._get_embed(f"Specific Guild ID ({option})", len(synced)))
                return

            synced = await self.bot.tree.sync()
            await ctx.send(embed=self._get_embed("Global Discord Tree", len(synced), "Updated across all servers."))

    @sync_cmd.error
    async def sync_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.NotOwner):
            pass
        else:
            await ctx.send(f"Sync error: {error}")

async def setup(bot: commands.Bot):
    await bot.add_cog(SyncCommand(bot))
