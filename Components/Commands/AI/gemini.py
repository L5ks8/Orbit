import os
import discord
from discord.ext import commands
from g4f.client import AsyncClient
import g4f
import asyncio

from discord import app_commands
from Components.Commands._utils import make_embed, make_v2_card, ORBIT_COLOR
from Components.emojis import Emojis

class GeminiChatbot(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        providers = [
            getattr(g4f.Provider, "Blackbox", None),
            getattr(g4f.Provider, "DDG", None),
            getattr(g4f.Provider, "DuckDuckGo", None),
            getattr(g4f.Provider, "FreeGpt", None),
            getattr(g4f.Provider, "ChatGptEs", None),
        ]
        valid_providers = [p for p in providers if p is not None]
        if hasattr(g4f.Provider, "RetryProvider") and valid_providers:
            self.client = AsyncClient(provider=g4f.Provider.RetryProvider(valid_providers))
        else:
            self.client = AsyncClient()
        self.memory_resets = {}

    @app_commands.command(name="ai_reset_memory", description="Reset Orbit AI conversation memory in this channel.")
    async def memory_reset(self, interaction: discord.Interaction):
        self.memory_resets[interaction.channel_id] = discord.utils.utcnow()
        card = make_v2_card(f"# Memory Reset\n\nAI conversation memory for this channel has been reset.", color=ORBIT_COLOR)
        if card:
            await interaction.response.send_message(view=card, ephemeral=True)
        else:
            await interaction.response.send_message(
                embed=make_embed("AI conversation memory for this channel has been reset.", ORBIT_COLOR),
                ephemeral=True
            )

    @commands.Cog.listener()
    async def on_message(self, message: discord.Message):
        if message.author.bot:
            return
        is_mentioned = self.bot.user in message.mentions
        is_reply_to_bot = False
        
        if message.reference and message.reference.resolved:
            if isinstance(message.reference.resolved, discord.Message):
                if message.reference.resolved.author.id == self.bot.user.id:
                    is_reply_to_bot = True
                    if len(message.reference.resolved.embeds) > 0:
                        return

        if not (is_mentioned or is_reply_to_bot):
            return

        from Components.Database.mongodb import get_config, set_config
        settings = get_config("Settings", message.guild.id) if message.guild else {}
        if not settings.get("ai_enabled", True):
            return

        async with message.channel.typing():
            try:
                reset_time = self.memory_resets.get(message.channel.id)
                messages = [m async for m in message.channel.history(limit=10, before=message, after=reset_time)]
                messages.reverse()

                server_info = f"Server Name: {message.guild.name}\nMember Count: {message.guild.member_count}" if message.guild else "Direct Message"
                
                if message.guild:
                    level_data = get_config("LevelConfig", message.guild.id) or {}
                    users = level_data.get("users", {})
                    user_id_str = str(message.author.id)
                    if user_id_str in users:
                        user_stats = users[user_id_str]
                        xp = user_stats.get("xp", 0)
                        level = user_stats.get("level", 0)
                        messages_count = user_stats.get("messages", 0)
                        voice_minutes = user_stats.get("voice_minutes", 0)
                        sorted_users = sorted(users.items(), key=lambda x: x[1].get("xp", 0), reverse=True)
                        rank = next((i + 1 for i, (uid, data) in enumerate(sorted_users) if uid == user_id_str), "Unranked")
                        server_info += f"\n\nUser Speaking ({message.author.display_name}) Stats:\nRank on Leaderboard: #{rank}\nLevel: {level}\nXP: {xp}\nMessages Sent: {messages_count}\nVoice Hours: {round(voice_minutes/60, 2)}"
                
                is_admin = False
                if message.guild:
                    perms = message.author.guild_permissions
                    if perms.administrator or perms.manage_guild:
                        is_admin = True
                    else:
                        manager_roles = settings.get("manager_roles", [])
                        if any(str(r.id) in manager_roles for r in message.author.roles):
                            is_admin = True

                from Components.Commands.AI.system_prompt import build_orbit_system_prompt
                system_prompt = build_orbit_system_prompt(
                    guild=message.guild,
                    user=message.author,
                    is_admin=is_admin,
                    extra_context=server_info
                )

                messages_payload = [{"role": "system", "content": system_prompt}]
                
                for msg in messages:
                    if msg.author.id == self.bot.user.id:
                        content = msg.clean_content
                        if content.startswith(f"{self.bot.user.display_name}:"):
                            content = content[len(self.bot.user.display_name)+1:].strip()
                        elif content.startswith("Orbit:"):
                            content = content[len("Orbit:"):].strip()
                        messages_payload.append({"role": "assistant", "content": content})
                    else:
                        messages_payload.append({"role": "user", "content": f"{msg.author.display_name}: {msg.clean_content}"})

                messages_payload.append({"role": "user", "content": f"{message.author.display_name}: {message.clean_content}"})

                from Components.Commands.AI._client import generate_ai_response
                text_response = await generate_ai_response(messages_payload)
                            
                if text_response:
                    if "[CONFIG_UPDATE:" in text_response and is_admin:
                        import re
                        import json
                        from Components.Database.mongodb import get_config, set_config
                        
                        match = re.search(r"\[CONFIG_UPDATE:\s*(.+?)\s*=\s*(.+)\]", text_response)
                        if match:
                            action = match.group(1).strip()
                            val_str = match.group(2).strip()
                            if val_str.endswith("]"):
                                val_str = val_str[:-1]
                            
                            try:
                                if action == "embed_style":
                                    val = val_str.strip('"').strip("'")
                                    cfg = get_config("Settings", message.guild.id) or {}
                                    cfg["embed_style"] = val
                                    set_config("Settings", message.guild.id, cfg)
                                elif action == "add_level_role":
                                    val = json.loads(val_str)
                                    cfg = get_config("LevelConfig", message.guild.id) or {}
                                    roles = cfg.get("level_roles", [])
                                    roles.append({"level": val["level"], "role_id": str(val["role_id"])})
                                    cfg["level_roles"] = roles
                                    set_config("LevelConfig", message.guild.id, cfg)
                                elif action == "remove_level_role":
                                    val = json.loads(val_str)
                                    cfg = get_config("LevelConfig", message.guild.id) or {}
                                    roles = cfg.get("level_roles", [])
                                    roles = [r for r in roles if str(r.get("level")) != str(val["level"]) or str(r.get("role_id")) != str(val["role_id"])]
                                    cfg["level_roles"] = roles
                                    set_config("LevelConfig", message.guild.id, cfg)
                                elif action == "module_toggle":
                                    val = json.loads(val_str)
                                    raw_mod_name = val.get("module")
                                    is_enabled = val.get("enabled", True)
                                    
                                    module_map = {
                                        "Settings": "Settings",
                                        "Logs": "Log",
                                        "AutoMod": "AutoMod",
                                        "Appeals": "Appeals",
                                        "Welcome": "Welcome",
                                        "Goodbye": "Goodbye",
                                        "Verify": "Verify",
                                        "Tickets": "Ticket",
                                        "TempVoice": "JoinToCreate",
                                        "Leveling": "LevelConfig",
                                        "Economy": "EconomyConfig",
                                        "ServerStats": "ServerStats",
                                        "AutoResponder": "AutoResponder",
                                        "Automation": "ChannelAutomation",
                                        "JoinRoles": "JoinRole"
                                    }
                                    
                                    if raw_mod_name:
                                        mod_name = module_map.get(raw_mod_name, raw_mod_name)
                                        
                                        if raw_mod_name == "Leveling":
                                            from Components.Systems.Level._storage import load_level_config, save_level_config
                                            cfg = load_level_config(message.guild.id)
                                            cfg["enabled"] = is_enabled
                                            save_level_config(message.guild.id, cfg)
                                        elif raw_mod_name == "Economy":
                                            from Components.Commands.Economy._storage import load_economy_config, save_economy_config
                                            cfg = load_economy_config(message.guild.id)
                                            cfg["enabled"] = is_enabled
                                            save_economy_config(message.guild.id, cfg)
                                        elif raw_mod_name == "ServerStats":
                                            from Components.Commands.ServerStats._storage import load_serverstats_config, save_serverstats_config
                                            cfg = load_serverstats_config(message.guild.id)
                                            cfg["enabled"] = is_enabled
                                            save_serverstats_config(message.guild.id, cfg)
                                        elif raw_mod_name == "AutoMod":
                                            from Components.Systems.Automoderation._storage import load_automod_config, save_automod_config
                                            cfg = load_automod_config(message.guild.id)
                                            cfg["enabled"] = is_enabled
                                            save_automod_config(message.guild.id, cfg)
                                        elif raw_mod_name == "Logs":
                                            from Components.Systems.Automoderation.log_storage import load_log_config, save_log_config
                                            cfg = load_log_config(message.guild.id)
                                            cfg["enabled"] = is_enabled
                                            save_log_config(message.guild.id, cfg)
                                        elif raw_mod_name == "Welcome":
                                            from Components.Systems.WelcomeGoodbye._storage import load_welcome_config, save_welcome_config
                                            cfg = load_welcome_config(message.guild.id)
                                            cfg["enabled"] = is_enabled
                                            save_welcome_config(message.guild.id, cfg)
                                        elif raw_mod_name == "Goodbye":
                                            from Components.Systems.WelcomeGoodbye._storage import load_goodbye_config, save_goodbye_config
                                            cfg = load_goodbye_config(message.guild.id)
                                            cfg["enabled"] = is_enabled
                                            save_goodbye_config(message.guild.id, cfg)
                                        elif raw_mod_name == "Appeals":
                                            from Components.Systems.BanAppeals._storage import load_appeals_config, save_appeals_config
                                            cfg = load_appeals_config(message.guild.id)
                                            cfg["enabled"] = is_enabled
                                            save_appeals_config(message.guild.id, cfg)
                                        elif raw_mod_name == "Verify":
                                            from Components.Systems.Verify._storage import load_verify_config, save_verify_config
                                            cfg = load_verify_config(message.guild.id)
                                            cfg["enabled"] = is_enabled
                                            save_verify_config(message.guild.id, cfg)
                                        elif raw_mod_name == "Automation":
                                            from Components.Commands.ChannelAutomation._storage import load_automation_config, save_automation_config
                                            cfg = load_automation_config(message.guild.id)
                                            cfg["enabled"] = is_enabled
                                            save_automation_config(message.guild.id, cfg)
                                        elif raw_mod_name == "TempVoice":
                                            from Components.Systems.JoinToCreate._storage import load_jtc_config, save_jtc_config
                                            cfg = load_jtc_config(message.guild.id)
                                            cfg["enabled"] = is_enabled
                                            save_jtc_config(message.guild.id, cfg)
                                        elif raw_mod_name == "JoinRoles":
                                            from Components.Systems.Roles._storage import load_join_roles, save_join_roles
                                            cfg = load_join_roles(message.guild.id)
                                            cfg["enabled"] = is_enabled
                                            save_join_roles(message.guild.id, cfg)
                                        else:
                                            cfg = get_config(mod_name, message.guild.id) or {}
                                            if mod_name == "Settings":
                                                cfg["ai_enabled"] = is_enabled
                                            else:
                                                cfg["enabled"] = is_enabled
                                            set_config(mod_name, message.guild.id, cfg)
                                            
                                        print(f"AI Module Toggle: set {mod_name} enabled to {is_enabled}")
                            except Exception as e:
                                print(f"[Config AI] Failed to execute config: {e}")
                            
                            text_response = re.sub(r"\[CONFIG_UPDATE:.*?\]", "", text_response).strip()

                    if text_response:
                        await self._send_chunked(message, text_response)
                    else:
                        await message.add_reaction("✅")
                else:
                    pass
            except Exception as e:
                print(f"[Orbit AI] Generation error: {e}")
                await message.reply("I am currently experiencing technical difficulties connecting to my AI providers. Please try again in a moment!")

    async def _send_chunked(self, message: discord.Message, text: str):
        chunks = [text[i:i+1950] for i in range(0, len(text), 1950)]
        reply_to = message
        for chunk in chunks:
            reply_to = await reply_to.reply(chunk, suppress_embeds=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(GeminiChatbot(bot))

