import json
import pathlib
import discord
from Components.Commands._utils import ORBIT_COLOR, make_v2_card
from Components.emojis import Emojis
from discord.ext import commands
from Components.Commands.OwnerOnly._monitor import record_command

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
                desc = "The global server blacklist is currently empty."
            else:
                bl_str = ", ".join([f"`{gid}`" for gid in bl])
                desc = f"**Globally Blacklisted Servers ({len(bl)}):**\n{bl_str}"
            card = make_v2_card(f"# {Emojis.NO_ENTRY} Global Server Blacklist\n\n{desc}", color=ORBIT_COLOR)
            if card:
                return await ctx.send(view=card)
            embed = discord.Embed(title=f"{Emojis.NO_ENTRY} Global Server Blacklist", description=desc, color=ORBIT_COLOR)
            return await ctx.send(embed=embed)
            
        if target_guild_id in bl:
            desc = f"Server `{target_guild_id}` is already globally blacklisted."
            card = make_v2_card(f"# {Emojis.WARNING} Global Server Blacklist\n\n{desc}", color=ORBIT_COLOR)
            if card:
                return await ctx.send(view=card, ephemeral=True)
            embed = discord.Embed(title=f"{Emojis.WARNING} Global Server Blacklist", description=desc, color=ORBIT_COLOR)
            return await ctx.send(embed=embed, ephemeral=True)
        
        bl.append(target_guild_id)
        _save_gblacklist(bl)
        
        desc = f"Server `{target_guild_id}` has been added to the global blacklist.\n**Reason:** {reason}"
        guild = self.bot.get_guild(target_guild_id)
        if guild:
            try:
                await guild.leave()
                desc += "\n\nI was currently in that server, so I have automatically left it."
            except Exception:
                pass
                
        card = make_v2_card(f"# {Emojis.NO_ENTRY} Server Blacklisted\n\n{desc}", color=ORBIT_COLOR)
        if card:
            return await ctx.send(view=card)
        embed = discord.Embed(title=f"{Emojis.NO_ENTRY} Server Blacklisted", description=desc, color=ORBIT_COLOR)
        await ctx.send(embed=embed)

    @commands.command(name="gblacklistremove", hidden=True)
    @commands.is_owner()
    async def gblacklistremove_cmd(self, ctx: commands.Context, target_guild_id: int):
        record_command("gblacklistremove", str(ctx.author))
        bl = _load_gblacklist()
        if target_guild_id not in bl:
            desc = f"Server `{target_guild_id}` is not blacklisted."
            card = make_v2_card(f"# {Emojis.WARNING} Global Server Blacklist\n\n{desc}", color=ORBIT_COLOR)
            if card:
                return await ctx.send(view=card, ephemeral=True)
            embed = discord.Embed(title=f"{Emojis.WARNING} Global Server Blacklist", description=desc, color=ORBIT_COLOR)
            return await ctx.send(embed=embed, ephemeral=True)
            
        bl.remove(target_guild_id)
        _save_gblacklist(bl)
        
        desc = f"Server `{target_guild_id}` has been removed from the global blacklist."
        card = make_v2_card(f"# {Emojis.VERIFICATION} Server Unblacklisted\n\n{desc}", color=ORBIT_COLOR)
        if card:
            return await ctx.send(view=card)
        embed = discord.Embed(title=f"{Emojis.VERIFICATION} Server Unblacklisted", description=desc, color=ORBIT_COLOR)
        await ctx.send(embed=embed)

async def setup(bot: commands.Bot):
    await bot.add_cog(GlobalBlacklistCommand(bot))
