utf-8import json
import pathlib
import discord
from discord.ext import commands
from Commands.OwnerOnly._monitor import record_command

GBLACKLIST_FILE = pathlib.Path("Storage/global_blacklist.json")

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

def is_globally_blacklisted(user_id: int) -> bool:
    return user_id in _load_gblacklist()

class GlobalBlacklistCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="gblacklist", hidden=True)
    @commands.is_owner()
    async def gblacklist_cmd(self, ctx: commands.Context, target: discord.User = None, *, reason: str = "No reason provided"):
        record_command("gblacklist", str(ctx.author))
        bl = _load_gblacklist()
        
        if target is None:
            if not bl:
                return await ctx.send("The global blacklist is currently empty.")
            bl_str = ", ".join([f"`{uid}`" for uid in bl])
            return await ctx.send(f"**Globally Blacklisted Users ({len(bl)}):**\n{bl_str}")
            
        if target.id in bl:
            return await ctx.send(f"User `{target.id}` is already globally blacklisted.", ephemeral=True)
        
        bl.append(target.id)
        _save_gblacklist(bl)
        await ctx.send(f"User `{target.id}` (`{target.name}`) has been added to the global bot blacklist.\n**Reason:** {reason}", allowed_mentions=discord.AllowedMentions.none())

    @commands.command(name="gunblacklist", hidden=True)
    @commands.is_owner()
    async def gunblacklist_cmd(self, ctx: commands.Context, target: discord.User):
        record_command("gunblacklist", str(ctx.author))
        bl = _load_gblacklist()
        if target.id not in bl:
            return await ctx.send(f"User `{target.id}` is not globally blacklisted.", ephemeral=True)
        
        bl.remove(target.id)
        _save_gblacklist(bl)
        await ctx.send(f"User `{target.id}` (`{target.name}`) has been removed from the global bot blacklist.", allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    await bot.add_cog(GlobalBlacklistCommand(bot))
