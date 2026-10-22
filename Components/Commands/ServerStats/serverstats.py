import re
import discord
from discord.ext import commands, tasks
import asyncio
import time
from typing import Optional, Dict
from Components.Commands.ServerStats._storage import load_serverstats_config, save_serverstats_config

# Discord allows max 2 channel renames per 10 minutes per channel.
# 305s ensures we never exceed this limit while keeping updates as fast as allowed.
CHANNEL_RENAME_COOLDOWN = 305

class ServerStats(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self._channel_last_renamed: Dict[int, float] = {}
        self._pending_updates: Dict[int, asyncio.Task] = {}
        self._member_debounce_tasks: Dict[str, asyncio.Task] = {}
        self.update_loop.start()

    def cog_unload(self):
        self.update_loop.cancel()
        for task in self._pending_updates.values():
            task.cancel()
        for task in self._member_debounce_tasks.values():
            task.cancel()

    def _schedule_delayed_update(self, guild: discord.Guild, channel_id: int, key: str):
        if channel_id in self._pending_updates and not self._pending_updates[channel_id].done():
            return

        last_rename = self._channel_last_renamed.get(channel_id, 0)
        delay = max(5.0, (last_rename + CHANNEL_RENAME_COOLDOWN) - time.time() + 2)

        async def _delayed_task():
            try:
                await asyncio.sleep(delay)
                self._pending_updates.pop(channel_id, None)
                await self.sync_guild_stats(guild, stat_filter=key)
            except asyncio.CancelledError:
                pass
            except Exception as ex:
                print(f"Error in delayed ServerStats update for {channel_id}: {ex}")

        self._pending_updates[channel_id] = asyncio.create_task(_delayed_task())

    @commands.Cog.listener()
    async def on_guild_update(self, before: discord.Guild, after: discord.Guild):
        before_boosts = getattr(before, "premium_subscription_count", 0) or 0
        after_boosts = getattr(after, "premium_subscription_count", 0) or 0
        if before_boosts != after_boosts:
            try:
                await self.sync_guild_stats(after, stat_filter="boosts")
            except Exception as e:
                print(f"Error updating boost stat channel on guild update: {e}")

    @commands.Cog.listener()
    async def on_member_join(self, member: discord.Member):
        stat = "bots" if member.bot else "users"
        try:
            await self.sync_guild_stats(member.guild, stat_filter=stat)
        except Exception as e:
            print(f"Error updating {stat} stat channel on member join: {e}")

    @commands.Cog.listener()
    async def on_member_remove(self, member: discord.Member):
        stat = "bots" if member.bot else "users"
        try:
            await self.sync_guild_stats(member.guild, stat_filter=stat)
        except Exception as e:
            print(f"Error updating {stat} stat channel on member remove: {e}")

    @commands.Cog.listener()
    async def on_guild_role_create(self, role: discord.Role):
        try:
            await self.sync_guild_stats(role.guild, stat_filter="roles")
        except Exception as e:
            print(f"Error updating roles stat channel on role create: {e}")

    @commands.Cog.listener()
    async def on_guild_role_delete(self, role: discord.Role):
        try:
            await self.sync_guild_stats(role.guild, stat_filter="roles")
        except Exception as e:
            print(f"Error updating roles stat channel on role delete: {e}")

    async def sync_guild_stats(self, guild: discord.Guild, stat_filter: Optional[str] = None) -> dict:
        config = load_serverstats_config(guild.id)
        changed = False

        category: Optional[discord.CategoryChannel] = None
        cat_id_str = str(config.get("category_id", "")).strip()
        if cat_id_str.isdigit():
            ch = guild.get_channel(int(cat_id_str))
            if isinstance(ch, discord.CategoryChannel):
                category = ch

        category_name = config.get("category_name", "Server Stats").strip() or "Server Stats"
        any_enabled = any([
            config.get("users_enabled"),
            config.get("boosts_enabled"),
            config.get("bots_enabled"),
            config.get("roles_enabled")
        ])

        if not category and any_enabled:
            try:
                category = await guild.create_category_channel(category_name, position=0)
                config["category_id"] = str(category.id)
                changed = True
                await asyncio.sleep(1.0)
            except Exception as e:
                print(f"Failed to create category for ServerStats in {guild.id}: {e}")
                category = None
        elif category:
            if category.name != config.get("category_name"):
                config["category_name"] = category.name
                changed = True

        if not category and not any_enabled:
            if changed:
                save_serverstats_config(guild.id, config)
            return config

        total_members = guild.member_count or len(guild.members)
        bots_count = sum(1 for m in guild.members if m.bot)
        users_count = total_members - bots_count
        boosts_count = getattr(guild, "premium_subscription_count", 0) or 0
        roles_count = len(guild.roles)

        stat_types = [
            ("users", users_count, "users_enabled", "users_name", "users_channel_id", "Users: {count}"),
            ("boosts", boosts_count, "boosts_enabled", "boosts_name", "boosts_channel_id", "Boosts: {count}"),
            ("bots", bots_count, "bots_enabled", "bots_name", "bots_channel_id", "Bots: {count}"),
            ("roles", roles_count, "roles_enabled", "roles_name", "roles_channel_id", "Roles: {count}")
        ]

        overwrites = {
            guild.default_role: discord.PermissionOverwrite(connect=False)
        }

        for key, count, enabled_key, name_key, channel_id_key, default_template in stat_types:
            if stat_filter and stat_filter != key:
                continue

            enabled = bool(config.get(enabled_key, False))
            ch_id_str = str(config.get(channel_id_key, "")).strip()
            template = str(config.get(name_key, default_template)).strip() or default_template

            channel: Optional[discord.VoiceChannel] = None
            if ch_id_str.isdigit():
                ch = guild.get_channel(int(ch_id_str))
                if isinstance(ch, discord.VoiceChannel):
                    channel = ch

            if enabled:
                if not channel:
                    if category:
                        initial_name = template.replace("{count}", str(count))
                        try:
                            channel = await category.create_voice_channel(initial_name, overwrites=overwrites)
                            config[channel_id_key] = str(channel.id)
                            changed = True
                            await asyncio.sleep(1.5)
                        except Exception as e:
                            print(f"Failed to create {key} stat channel in {guild.id}: {e}")
                else:
                    target_name = template.replace("{count}", str(count))

                    # If the name is already up-to-date, do nothing!
                    if channel.name == target_name and (not category or channel.category_id == category.id):
                        continue

                    try:
                        edits = {}
                        if channel.name != target_name:
                            last_rename = self._channel_last_renamed.get(channel.id, 0)
                            if (time.time() - last_rename) >= CHANNEL_RENAME_COOLDOWN:
                                edits["name"] = target_name
                            else:
                                self._schedule_delayed_update(guild, channel.id, key)

                        if category and channel.category_id != category.id:
                            edits["category"] = category

                        if edits:
                            await channel.edit(**edits)
                            if "name" in edits:
                                self._channel_last_renamed[channel.id] = time.time()
                            # Pause 2 seconds between edits to protect the IP from burst limits
                            await asyncio.sleep(2.0)
                    except discord.HTTPException as e:
                        if e.status == 429:
                            self._channel_last_renamed[channel.id] = time.time() + CHANNEL_RENAME_COOLDOWN
                        print(f"Failed to update {key} stat channel in {guild.id}: {e}")
                    except Exception as e:
                        print(f"Failed to update {key} stat channel in {guild.id}: {e}")
            else:
                if channel:
                    try:
                        await channel.delete(reason="ServerStats disabled for this channel")
                        await asyncio.sleep(1.0)
                    except Exception:
                        pass
                    config[channel_id_key] = ""
                    changed = True

        if changed:
            save_serverstats_config(guild.id, config)

        return config

    @tasks.loop(minutes=10)
    async def update_loop(self):
        for guild in self.bot.guilds:
            try:
                await self.sync_guild_stats(guild)
            except Exception as e:
                print(f"Error in ServerStats update loop for guild {guild.id}: {e}")
            await asyncio.sleep(3)

    @update_loop.before_loop
    async def before_update_loop(self):
        await self.bot.wait_until_ready()
        # Wait 20 seconds after startup so Discord cache is settled
        await asyncio.sleep(20)

async def setup(bot: commands.Bot):
    await bot.add_cog(ServerStats(bot))

