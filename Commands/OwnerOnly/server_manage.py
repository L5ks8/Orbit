utf-8import json
import pathlib
import discord
from discord.ext import commands
from Commands.OwnerOnly._monitor import record_command

SBLACKLIST_FILE = pathlib.Path("Storage/server_blacklist.json")

def _load_sblacklist() -> list[int]:
    if not SBLACKLIST_FILE.exists():
        return []
    try:
        with open(SBLACKLIST_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def _save_sblacklist(data: list[int]):
    try:
        if not SBLACKLIST_FILE.parent.exists():
            SBLACKLIST_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(SBLACKLIST_FILE, "w", encoding="utf-8") as f:
            json.dump(list(set(data)), f, indent=4)
    except Exception:
        pass

class ServerManageCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="leaveserver", hidden=True)
    @commands.is_owner()
    async def leaveserver_cmd(self, ctx: commands.Context, target_guild_id: int):
        record_command("leaveserver", str(ctx.author))
        guild = self.bot.get_guild(target_guild_id)
        if not guild:
            return await ctx.send(f"I am not in a server with ID `{target_guild_id}`.", ephemeral=True)
        
        try:
            await guild.leave()
            await ctx.send(f"Successfully left server: **{guild.name}** (`{guild.id}`).")
        except Exception as e:
            await ctx.send(f"Failed to leave server: {e}")

    @commands.command(name="blacklistserver", hidden=True)
    @commands.is_owner()
    async def blacklistserver_cmd(self, ctx: commands.Context, target_guild_id: int, *, reason: str = "No reason provided"):
        record_command("blacklistserver", str(ctx.author))
        bl = _load_sblacklist()
        if target_guild_id in bl:
            return await ctx.send(f"Server `{target_guild_id}` is already blacklisted.", ephemeral=True)
        
        bl.append(target_guild_id)
        _save_sblacklist(bl)
        await ctx.send(f"Server `{target_guild_id}` has been globally blacklisted.\n**Reason:** {reason}")

        guild = self.bot.get_guild(target_guild_id)
        if guild:
            try:
                await guild.leave()
                await ctx.send(f"I was currently in that server, so I have automatically left it.")
            except Exception:
                pass

    @commands.command(name="unblacklistserver", hidden=True)
    @commands.is_owner()
    async def unblacklistserver_cmd(self, ctx: commands.Context, target_guild_id: int):
        record_command("unblacklistserver", str(ctx.author))
        bl = _load_sblacklist()
        if target_guild_id not in bl:
            return await ctx.send(f"Server `{target_guild_id}` is not blacklisted.", ephemeral=True)
        
        bl.remove(target_guild_id)
        _save_sblacklist(bl)
        await ctx.send(f"Server `{target_guild_id}` has been removed from the global blacklist.")

    @commands.Cog.listener()
    async def on_guild_join(self, guild: discord.Guild):
        bl = _load_sblacklist()
        if guild.id in bl:
            try:
                await guild.leave()
                from Commands.OwnerOnly._monitor import record_log
                record_log(f"[Security] Auto-left blacklisted server {guild.name} ({guild.id})")
            except Exception:
                pass

async def setup(bot: commands.Bot):
    await bot.add_cog(ServerManageCommand(bot))
