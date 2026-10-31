import discord
from discord import app_commands
from discord.ext import commands, tasks
import datetime
import asyncio
from Components.Database.mongodb import get_db
from Components.Commands._utils import ORBIT_COLOR, make_embed, make_v2_card, InteractionContext
from Components.emojis import Emojis

class Birthday(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.check_birthdays.start()

    def cog_unload(self):
        self.check_birthdays.cancel()

    @app_commands.command(name="setbirthday", description="Save your birthday (Format: DD.MM)")
    @app_commands.describe(date="Your birthday in DD.MM format (e.g., 15.08)")
    async def set_birthday(self, interaction: discord.Interaction, date: str):
        ctx = InteractionContext(interaction)
        try:
            day, month = map(int, date.split('.'))
            datetime.date(2000, month, day)
        except ValueError:
            return await ctx.send(
                embed=make_embed("Invalid format! Please use **DD.MM** (e.g., 15.08)", discord.Color.red()),
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
            card = make_v2_card(f"# Birthday Saved\n\nYour birthday has been successfully set to **{date}**!", color=ORBIT_COLOR)
            if card:
                return await ctx.send(view=card, ephemeral=True)
            await ctx.send(
                embed=discord.Embed(description=f"Your birthday has been successfully set to **{date}**!", color=ORBIT_COLOR),
                ephemeral=True
            )
        else:
            await ctx.send(embed=make_embed("Database error.", discord.Color.red()), ephemeral=True)

    @tasks.loop(time=datetime.time(hour=8, minute=0, tzinfo=datetime.timezone.utc))
    async def check_birthdays(self):
        try:
            db = get_db()
            if db is None:
                return

            today = datetime.datetime.now(datetime.timezone.utc)
            collection = db['birthdays']
            
            birthday_users = await asyncio.to_thread(lambda: list(collection.find({"day": today.day, "month": today.month})))
            if not birthday_users:
                return

            for guild in self.bot.guilds:
                try:
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
                        v2_body = (
                            f"# Happy Birthday! \n\n"
                            f"Happy birthday to: {', '.join(celebrants)}!\nWe hope you have a great day!"
                        )
                        card = make_v2_card(v2_body, color=ORBIT_COLOR)
                        embed = discord.Embed(
                            title="Happy Birthday!",
                            description=f"Happy birthday to: {', '.join(celebrants)}!\nWe hope you have a great day!",
                            color=ORBIT_COLOR
                        )
                        try:
                            if card:
                                await channel.send(view=card)
                            else:
                                await channel.send(embed=embed)
                        except discord.HTTPException:
                            pass
                except Exception as guild_err:
                    print(f"[Birthday] Error wishing birthday in guild {guild.id}: {guild_err}")
        except Exception as e:
            print(f"[Birthday] Error in check_birthdays loop: {e}")

    @check_birthdays.before_loop
    async def before_check_birthdays(self):
        await self.bot.wait_until_ready()

    @check_birthdays.error
    async def check_birthdays_error(self, error):
        print(f"[Birthday] Error in check_birthdays task: {error}")
        await asyncio.sleep(5)
        if not self.check_birthdays.is_running():
            try:
                self.check_birthdays.restart()
            except Exception:
                pass

async def setup(bot: commands.Bot):
    await bot.add_cog(Birthday(bot))
