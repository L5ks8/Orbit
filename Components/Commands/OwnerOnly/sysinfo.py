import discord
from Components.Commands._utils import ORBIT_COLOR, make_v2_card
from Components.emojis import Emojis
from discord.ext import commands
import sys
import platform
import time
import os

try:
    import psutil
    HAS_PSUTIL = True
except ImportError:
    HAS_PSUTIL = False

class SysInfo(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.start_time = time.time()

    @commands.command(name="sysinfo", hidden=True)
    @commands.is_owner()
    async def sysinfo_cmd(self, ctx: commands.Context):
        uptime_seconds = int(time.time() - self.start_time)
        m, s = divmod(uptime_seconds, 60)
        h, m = divmod(m, 60)
        d, h = divmod(h, 24)
        uptime_str = f"{d}d {h}h {m}m {s}s"
        
        import asyncio
        tasks = [t for t in asyncio.all_tasks() if not t.done()]
        
        from Components.Database.mongodb import get_db
        db = get_db()
        ping_start = time.time()
        try:
            db.command("ping")
            db_ping = round((time.time() - ping_start) * 1000)
            db_status = f"`{db_ping} ms`"
        except Exception:
            db_status = "`Disconnected/Error`"
            
        if HAS_PSUTIL:
            cpu_percent = psutil.cpu_percent()
            mem = psutil.virtual_memory()
            mem_used = mem.used / (1024**3)
            mem_total = mem.total / (1024**3)
            hw_info = f"**CPU Usage:** `{cpu_percent}%` | **RAM:** `{mem_used:.2f} GB / {mem_total:.2f} GB ({mem.percent}%)`\n"
        else:
            hw_info = "**Hardware Info:** `psutil` is not installed.\n"

        body = (
            f"# {Emojis.GUIDE} System Information\n\n"
            f"**Uptime:** `{uptime_str}` | **Active Tasks:** `{len(tasks)}`\n"
            f"**Servers:** `{len(self.bot.guilds)}` | **Users:** `{len(self.bot.users)}`\n"
            f"**DB Ping:** {db_status}\n"
            f"{hw_info}"
            f"**Python Version:** `{platform.python_version()}`"
        )
        card = make_v2_card(body, color=ORBIT_COLOR)
        if card:
            return await ctx.send(view=card)

        embed = discord.Embed(title=f"{Emojis.GUIDE} System Information", color=ORBIT_COLOR)
        embed.add_field(name="Uptime", value=f"`{uptime_str}`", inline=True)
        embed.add_field(name="Servers", value=f"`{len(self.bot.guilds)}`", inline=True)
        embed.add_field(name="Users", value=f"`{len(self.bot.users)}`", inline=True)
        embed.add_field(name="Active Tasks", value=f"`{len(tasks)}`", inline=True)
        embed.add_field(name="DB Ping", value=db_status, inline=True)
        if HAS_PSUTIL:
            embed.add_field(name="CPU Usage", value=f"`{cpu_percent}%`", inline=True)
            embed.add_field(name="RAM Usage", value=f"`{mem_used:.2f} GB / {mem_total:.2f} GB ({mem.percent}%)`", inline=True)
        else:
            embed.add_field(name="Hardware Info", value="`psutil` is not installed.", inline=True)
        embed.add_field(name="Python Version", value=f"`{platform.python_version()}`", inline=True)
        await ctx.send(embed=embed)

async def setup(bot):
    await bot.add_cog(SysInfo(bot))
