import time
import discord
from discord.ext import commands, tasks
from Commands.Verify._storage import load_verify_config, add_pending_kick, remove_pending_kick

class VerifyListenerCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.auto_kick_checker.start()

    def cog_unload(self):
        self.auto_kick_checker.cancel()

    @commands.Cog.listener()
    async def on_member_join(self, member: discord.Member):
        if member.bot:
            return

        config = load_verify_config(member.guild.id)
        if not config.get("enabled", True):
            return

        role_id = config.get("role_id")
        timeout_action = config.get("timeout_action", "none")
        timeout_minutes = config.get("timeout_minutes", 0)
        # fallback to old auto_kick_minutes if timeout_minutes is 0
        if timeout_minutes == 0:
            timeout_minutes = config.get("auto_kick_minutes", 0)
            if timeout_minutes > 0 and timeout_action == "none":
                timeout_action = "kick"

        if role_id and timeout_minutes > 0 and timeout_action in ["kick", "ban"]:
            kick_time = time.time() + (timeout_minutes * 60)
            add_pending_kick(member.guild.id, member.id, kick_time)

    @tasks.loop(seconds=30)
    async def auto_kick_checker(self):
        for guild in self.bot.guilds:
            config = load_verify_config(guild.id)
            if not config.get("enabled", True):
                continue

            pending = config.get("pending_kicks", {})
            if not pending:
                continue

            role_id = config.get("role_id")
            if not role_id:
                continue
                
            timeout_action = config.get("timeout_action", "none")
            timeout_minutes = config.get("timeout_minutes", 0)
            if timeout_minutes == 0:
                timeout_minutes = config.get("auto_kick_minutes", 0)
                if timeout_minutes > 0 and timeout_action == "none":
                    timeout_action = "kick"

            to_remove = []
            now = time.time()

            for user_id_str, kick_time in pending.items():
                if now >= kick_time:
                    to_remove.append(user_id_str)
                    member = guild.get_member(int(user_id_str))
                    if member:
                        if not any(r.id == role_id for r in member.roles):
                            if timeout_action == "ban":
                                try:
                                    await member.send(f"You were automatically banned from **{guild.name}** because you did not complete verification within `{timeout_minutes} minutes`.")
                                except Exception:
                                    pass
                                try:
                                    await member.ban(reason=f"Failed verification within {timeout_minutes} minutes")
                                except Exception:
                                    pass
                            elif timeout_action == "kick":
                                try:
                                    await member.send(f"You were automatically kicked from **{guild.name}** because you did not complete verification within `{timeout_minutes} minutes`.")
                                except Exception:
                                    pass
                                try:
                                    await member.kick(reason=f"Failed verification within {timeout_minutes} minutes")
                                except Exception:
                                    pass

            if to_remove:
                for uid in to_remove:
                    remove_pending_kick(guild.id, int(uid))

    @commands.Cog.listener()
    async def on_interaction(self, interaction: discord.Interaction):
        if interaction.type != discord.InteractionType.component:
            return
        if interaction.response.is_done():
            return
        pass

    @auto_kick_checker.before_loop
    async def before_auto_kick(self):
        await self.bot.wait_until_ready()

async def setup(bot: commands.Bot):
    from Commands.Verify._views import PersistentVerifyLayout
    bot.add_view(PersistentVerifyLayout())
    await bot.add_cog(VerifyListenerCog(bot))

