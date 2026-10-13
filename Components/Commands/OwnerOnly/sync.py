import discord
from discord.ext import commands
from Components.Commands._utils import make_embed, make_v2_card, ORBIT_COLOR
from Components.emojis import Emojis

class SyncCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    async def _send_synced(self, ctx: commands.Context, target_scope: str, count: int, extra_info: str = ""):
        desc = f"**Scope:** `{target_scope}`\n**Commands Synced:** `{count}`"
        if extra_info:
            desc += f"\n**Details:** {extra_info}"
        card = make_v2_card(f"# Orbit Command Tree Synced\n\n{desc}", color=ORBIT_COLOR)
        if card:
            return await ctx.send(view=card)
        embed = discord.Embed(
            title="Orbit Command Tree Synced",
            description=desc,
            color=ORBIT_COLOR
        )
        await ctx.send(embed=embed)

    @commands.command(name="sync", hidden=True)
    @commands.is_owner()
    async def sync_cmd(self, ctx: commands.Context, *, option: str = None):
        await ctx.defer(ephemeral=True)
        if option and option.lower() in ["here", "local"]:
            if not ctx.guild:
                return await ctx.send(embed=make_embed("You must be inside a server to sync locally.", discord.Color.red()))
            self.bot.tree.copy_global_to(guild=ctx.guild)
            synced = await self.bot.tree.sync(guild=ctx.guild)
            await self._send_synced(ctx, f"Local Server ({ctx.guild.name})", len(synced))
            return

        if option and option.lower().startswith("clear"):
            parts = option.split()
            if len(parts) > 1 and parts[1].isdigit():
                guild_obj = discord.Object(id=int(parts[1]))
                self.bot.tree.clear_commands(guild=guild_obj)
                await self.bot.tree.sync(guild=guild_obj)
                await self._send_synced(ctx, f"Cleared Guild ID {parts[1]}", 0, "Cleared all local guild commands.")
            else:
                if ctx.guild:
                    self.bot.tree.clear_commands(guild=ctx.guild)
                    await self.bot.tree.sync(guild=ctx.guild)
                    await self._send_synced(ctx, f"Cleared Local Server ({ctx.guild.name})", 0, "Cleared local overrides.")
            return

        if option and option.isdigit():
            guild_obj = discord.Object(id=int(option))
            self.bot.tree.copy_global_to(guild=guild_obj)
            synced = await self.bot.tree.sync(guild=guild_obj)
            await self._send_synced(ctx, f"Specific Guild ID ({option})", len(synced))
            return

        synced = await self.bot.tree.sync()
        await self._send_synced(ctx, "Global Discord Tree", len(synced), "Updated across all servers.")

    @sync_cmd.error
    async def sync_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.NotOwner):
            pass
        else:
            await ctx.send(embed=make_embed(f"Sync error: {error}", discord.Color.red()))

async def setup(bot: commands.Bot):
    await bot.add_cog(SyncCommand(bot))