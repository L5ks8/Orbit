import discord
from discord import app_commands
from discord.ext import commands, tasks
import re
import time
import asyncio
from Components.Commands.Cases._storage import create_case
from Components.Commands.ModLog._modlog_storage import add_modlog
from Components.Database.mongodb import get_db
from Components.Commands._utils import make_embed, make_v2_card, ORBIT_COLOR, InteractionContext, parse_duration, format_duration
from Components.emojis import Emojis

class TempBanCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.check_tempbans.start()

    def cog_unload(self):
        self.check_tempbans.cancel()

    @app_commands.command(name="tempban", description="Temporarily bans a user from the server.")
    @app_commands.describe(
        user="The user to temporarily ban",
        duration="Duration (e.g. 1d, 12h, 30m)",
        reason="The reason for the tempban",
        history="Delete message history"
    )
    @app_commands.choices(history=[
        app_commands.Choice(name="Don't delete", value=0),
        app_commands.Choice(name="1 Hour", value=3600),
        app_commands.Choice(name="6 Hours", value=21600),
        app_commands.Choice(name="12 Hours", value=43200),
        app_commands.Choice(name="24 Hours", value=86400),
        app_commands.Choice(name="3 Days", value=259200),
        app_commands.Choice(name="7 Days", value=604800)
    ])
    @app_commands.default_permissions(ban_members=True)
    @app_commands.checks.has_permissions(ban_members=True)
    @app_commands.checks.bot_has_permissions(ban_members=True)
    async def tempban_cmd(self, interaction: discord.Interaction, user: discord.User, duration: str, reason: str = "No reason provided", history: int = 0):
        ctx = InteractionContext(interaction)
        await ctx.defer()
        
        seconds = parse_duration(duration)
        if seconds is None or seconds <= 0:
            return await ctx.send(embed=make_embed("Invalid duration format. Please use formats like `1d`, `12h`, `30m`.", discord.Color.red()), ephemeral=True)
            
        unban_time = int(time.time()) + seconds
        
        try:
            await ctx.guild.ban(
                user,
                reason=f"Tempban by {ctx.author} for {duration} | Reason: {reason}",
                delete_message_seconds=history
            )
        except discord.Forbidden:
            return await ctx.send(embed=make_embed("I do not have permission to ban this user. They might have a higher role than me.", discord.Color.red()), ephemeral=True)
        except discord.HTTPException:
            return await ctx.send(embed=make_embed("Failed to ban the user due to an API error.", discord.Color.red()), ephemeral=True)
            
        db = get_db()
        if db is not None:
            try:
                db["Tempbans"].insert_one({
                    "guild_id": str(ctx.guild.id),
                    "user_id": str(user.id),
                    "unban_time": unban_time,
                    "moderator_id": str(ctx.author.id)
                })
            except Exception as e:
                print(f"[Tempbans] Failed to store tempban in DB: {e}")
            
        create_case(ctx.guild.id, user.id, ctx.author.id, "ban", f"[TEMPBAN {duration}] {reason}")
        add_modlog(ctx.guild.id, user.id, ctx.author.id, "Tempban", f"[{duration}] {reason}")
        
        content = f"# User Tempbanned\n\nSuccessfully tempbanned {user.mention} for **{duration}**.\nThey will be automatically unbanned <t:{unban_time}:R>."
        card = make_v2_card(content, color=ORBIT_COLOR)
        if card:
            await ctx.send(view=card)
        else:
            embed = discord.Embed(
                title="User Tempbanned",
                description=f"Successfully tempbanned {user.mention} for **{duration}**.\nThey will be automatically unbanned <t:{unban_time}:R>.",
                color=ORBIT_COLOR
            )
            await ctx.send(embed=embed)

    @tasks.loop(minutes=1.0)
    async def check_tempbans(self):
        try:
            db = get_db()
            if db is None:
                return
                
            current_time = int(time.time())
            expired_bans = await asyncio.to_thread(lambda: list(db["Tempbans"].find({"unban_time": {"$lte": current_time}})))
            
            for record in expired_bans:
                try:
                    guild = self.bot.get_guild(int(record["guild_id"]))
                    if guild:
                        user = discord.Object(id=int(record["user_id"]))
                        await guild.unban(user, reason="Tempban expired")
                        
                        create_case(guild.id, user.id, self.bot.user.id, "unban", "Tempban expired")
                        add_modlog(guild.id, user.id, self.bot.user.id, "Unban", "Tempban expired")
                except Exception as e:
                    print(f"[Tempbans] Error unbanning user {record.get('user_id')}: {e}")
                    
                try:
                    await asyncio.to_thread(db["Tempbans"].delete_one, {"_id": record["_id"]})
                except Exception as e:
                    print(f"[Tempbans] Error deleting tempban record {record.get('_id')}: {e}")
                await asyncio.sleep(0.05)
        except Exception as e:
            print(f"[Tempbans] Error in check_tempbans loop: {e}")

    @check_tempbans.before_loop
    async def before_check_tempbans(self):
        await self.bot.wait_until_ready()

    @check_tempbans.error
    async def check_tempbans_error(self, error):
        print(f"[Tempbans] Internal error in check_tempbans task: {error}")
        await asyncio.sleep(5)
        if not self.check_tempbans.is_running():
            try:
                self.check_tempbans.restart()
                print("[Tempbans] Successfully restarted check_tempbans loop.")
            except Exception as restart_err:
                print(f"[Tempbans] Failed to restart check_tempbans loop: {restart_err}")

    @tempban_cmd.error
    async def tempban_error(self, interaction: discord.Interaction, error):
        ctx = InteractionContext(interaction)
        if isinstance(error, (app_commands.MissingPermissions, commands.MissingPermissions)):
            await ctx.send(embed=make_embed("You need `Ban Members` permission to use this command.", discord.Color.red()), ephemeral=True)
        elif isinstance(error, (app_commands.BotMissingPermissions, commands.BotMissingPermissions)):
            await ctx.send(embed=make_embed("I need `Ban Members` permission to execute this command."), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(TempBanCog(bot))
