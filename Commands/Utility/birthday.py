import discord
from discord import app_commands
from discord.ext import commands, tasks
import datetime
from Database.mongodb import get_db

class Birthday(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.check_birthdays.start()

    def cog_unload(self):
        self.check_birthdays.cancel()

    @commands.hybrid_command(name="setbirthday", description="Save your birthday (Format: DD.MM)")
    @app_commands.describe(date="Your birthday in DD.MM format (e.g., 15.08)")
    async def set_birthday(self, ctx: commands.Context, date: str):
        try:
            # Validate format
            day, month = map(int, date.split('.'))
            datetime.date(2000, month, day) # Dummy year to check validity
        except ValueError:
            return await ctx.send(
                embed=discord.Embed(description="Invalid format! Please use **DD.MM** (e.g., 15.08)", color=discord.Color.red()),
                ephemeral=True
            )

        db = get_db()
        if db is not None:
            collection = db['birthdays']
            collection.update_one(
                {"user_id": ctx.author.id},
                {"$set": {"day": day, "month": month}},
                upsert=True
            )
            await ctx.send(
                embed=discord.Embed(description=f"Your birthday has been successfully set to **{date}**!", color=0x2B2D31),
                ephemeral=True
            )
        else:
            await ctx.send("Database error.", ephemeral=True)

    @tasks.loop(time=datetime.time(hour=8, minute=0, tzinfo=datetime.timezone.utc))
    async def check_birthdays(self):
        # Runs every day at 8:00 UTC
        db = get_db()
        if db is None:
            return

        today = datetime.datetime.now(datetime.timezone.utc)
        collection = db['birthdays']
        
        # Find all users whose birthday is today
        birthday_users = list(collection.find({"day": today.day, "month": today.month}))
        if not birthday_users:
            return

        for guild in self.bot.guilds:
            # We need a channel to send the message. We'll use the system_channel if available,
            # otherwise the first text channel the bot can send messages in.
            channel = guild.system_channel
            if not channel:
                for c in guild.text_channels:
                    if c.permissions_for(guild.me).send_messages:
                        channel = c
                        break
            
            if not channel:
                continue

            celebrants = []
            for bday in birthday_users:
                member = guild.get_member(bday["user_id"])
                if member:
                    celebrants.append(member.mention)

            if celebrants:
                embed = discord.Embed(
                    title="🎉 Happy Birthday! 🎉",
                    description=f"Happy birthday to: {', '.join(celebrants)}!\nWe hope you have a great day!",
                    color=discord.Color.gold()
                )
                try:
                    await channel.send(embed=embed)
                except discord.HTTPException:
                    pass

    @check_birthdays.before_loop
    async def before_check_birthdays(self):
        await self.bot.wait_until_ready()

async def setup(bot: commands.Bot):
    await bot.add_cog(Birthday(bot))
