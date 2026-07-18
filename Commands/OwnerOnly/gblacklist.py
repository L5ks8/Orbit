import json
import pathlib
import discord
from discord.ext import commands
from Commands.OwnerOnly._monitor import record_command

GBLACKLIST_FILE = pathlib.Path("Storage/server_blacklist.json")

def _load_gblacklist() -> list[int]:
    if not GBLACKLIST_FILE.exists():
        return []
    try:
        with open(GBLACKLIST_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def _save_gblacklist(data: list[int]):
    try:
        if not GBLACKLIST_FILE.parent.exists():
            GBLACKLIST_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(GBLACKLIST_FILE, "w", encoding="utf-8") as f:
            json.dump(list(set(data)), f, indent=4)
    except Exception:
        pass

class GlobalBlacklistCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="gblacklist", hidden=True)
    @commands.is_owner()
    async def gblacklist_cmd(self, ctx: commands.Context, target_guild_id: int = None, *, reason: str = "No reason provided"):
        record_command("gblacklist", str(ctx.author))
        bl = _load_gblacklist()
        
        if target_guild_id is None:
            if not bl:
                return await ctx.send("The global server blacklist is currently empty.")
            bl_str = ", ".join([f"`{gid}`" for gid in bl])
            return await ctx.send(f"**Globally Blacklisted Servers ({len(bl)}):**\n{bl_str}")
            
        if target_guild_id in bl:
            return await ctx.send(f"Server `{target_guild_id}` is already globally blacklisted.", ephemeral=True)
        
        bl.append(target_guild_id)
        _save_gblacklist(bl)
        await ctx.send(f"Server `{target_guild_id}` has been added to the global blacklist.\n**Reason:** {reason}")

        guild = self.bot.get_guild(target_guild_id)
        if guild:
            try:
                await guild.leave()
                await ctx.send("I was currently in that server, so I have automatically left it.")
            except Exception:
                pass

    @commands.command(name="gblacklistremove", hidden=True)
    @commands.is_owner()
    async def gblacklistremove_cmd(self, ctx: commands.Context, target_guild_id: int):
        record_command("gblacklistremove", str(ctx.author))
        bl = _load_gblacklist()
        if target_guild_id not in bl:
            return await ctx.send(f"Server `{target_guild_id}` is not globally blacklisted.", ephemeral=True)
        
        bl.remove(target_guild_id)
        _save_gblacklist(bl)
        await ctx.send(f"Server `{target_guild_id}` has been removed from the global blacklist.")

    @commands.Cog.listener()
    async def on_guild_join(self, guild: discord.Guild):
        bl = _load_gblacklist()
        if guild.id in bl:
            try:
                await guild.leave()
                from Commands.OwnerOnly._monitor import record_log
                record_log(f"[Security] Auto-left globally blacklisted server {guild.name} ({guild.id})")
            except Exception:
                pass

async def setup(bot: commands.Bot):
    await bot.add_cog(GlobalBlacklistCommand(bot))

