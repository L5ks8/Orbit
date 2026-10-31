import time
import asyncio
import discord
from discord.ext import commands, tasks
from Components.Systems.Verify._storage import load_verify_config, add_pending_kick, remove_pending_kick

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

        raw_role_id = config.get("role_id")
        if not raw_role_id:
            return
            
        try:
            role_id = int(raw_role_id)
        except (ValueError, TypeError):
            return

        # Automatically assign Unverified role on join if configured
        raw_unverified_id = config.get("remove_role_id")
        if raw_unverified_id and str(raw_unverified_id).isdigit():
            unv_role = member.guild.get_role(int(raw_unverified_id))
            if unv_role and member.guild.me.top_role > unv_role:
                try:
                    await member.add_roles(unv_role, reason="Orbit Verification: Unverified role on join")
                except Exception:
                    pass

        timeout_action = config.get("timeout_action", "none")
        timeout_minutes = config.get("timeout_minutes", 0)
        if timeout_minutes == 0:
            timeout_minutes = config.get("auto_kick_minutes", 0)
            if timeout_minutes > 0 and timeout_action == "none":
                timeout_action = "kick"

        if timeout_minutes > 0 and timeout_action in ["kick", "ban"]:
            kick_time = time.time() + (timeout_minutes * 60)
            add_pending_kick(member.guild.id, member.id, kick_time)

    @tasks.loop(seconds=30)
    async def auto_kick_checker(self):
        for guild in list(self.bot.guilds):
            try:
                config = await asyncio.to_thread(load_verify_config, guild.id)
                if not config.get("enabled", True):
                    await asyncio.sleep(0.01)
                    continue

                pending = config.get("pending_kicks", {})
                if not pending:
                    await asyncio.sleep(0.01)
                    continue

                raw_role_id = config.get("role_id")
                if not raw_role_id:
                    await asyncio.sleep(0.01)
                    continue
                    
                try:
                    role_id = int(raw_role_id)
                except (ValueError, TypeError):
                    await asyncio.sleep(0.01)
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
                        await asyncio.to_thread(remove_pending_kick, guild.id, int(uid))
            except Exception as e:
                pass
            await asyncio.sleep(0.05)

    @commands.Cog.listener()
    async def on_interaction(self, interaction: discord.Interaction):
        if interaction.type != discord.InteractionType.component:
            return
        if interaction.response.is_done():
            return
        cid = str((interaction.data or {}).get("custom_id") or "")
        if cid == "orbit:verify_start" or cid.startswith("orbit:verify_start:"):
            from Components.Systems.Verify._views import handle_verify_interaction
            sys_id = cid.split(":", 2)[2] if cid.startswith("orbit:verify_start:") else None
            await handle_verify_interaction(interaction, system_id=sys_id)

    @auto_kick_checker.before_loop
    async def before_auto_kick(self):
        await self.bot.wait_until_ready()

    @auto_kick_checker.error
    async def auto_kick_checker_error(self, error):
        print(f"[Verify] Internal error in auto_kick_checker: {error}")
        await asyncio.sleep(5)
        if not self.auto_kick_checker.is_running():
            try:
                self.auto_kick_checker.restart()
            except Exception:
                pass

async def setup(bot: commands.Bot):
    from Components.Systems.Verify._views import PersistentVerifyLayout
    bot.add_view(PersistentVerifyLayout())
    await bot.add_cog(VerifyListenerCog(bot))

