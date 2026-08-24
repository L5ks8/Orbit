import discord
from discord.ext import commands
import time
import os
import sys

# Ensure backend can be imported
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')))
from Components.Database.mongodb import get_db

class DashboardMessage(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="message", hidden=True)
    @commands.is_owner()
    async def dashboard_message(self, ctx: commands.Context, target: str, *, message: str):
        """Send a notification to a specific user or all users on the dashboard.
        Usage: -message <id|all> <message>
        """
        db = get_db()
        if db is None:
            return await ctx.send("❌ Database connection failed.")
            
        notification = {
            "target": target, # "all" or user id
            "message": message,
            "timestamp": int(time.time()),
            "author_id": str(ctx.author.id)
        }
        
        db["Notifications"].insert_one(notification)
        
        target_display = "all users" if target.lower() == "all" else f"user ID {target}"
        await ctx.send(f"✅ Notification successfully sent to **{target_display}** on the dashboard:\n> {message}")

async def setup(bot):
    await bot.add_cog(DashboardMessage(bot))
