import discord
from discord.ext import commands, tasks
import asyncio
from typing import Optional
from Commands.ServerStats._storage import load_serverstats_config, save_serverstats_config

class ServerStats(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.update_loop.start()

    def cog_unload(self):
        self.update_loop.cancel()

    async def sync_guild_stats(self, guild: discord.Guild) -> dict:
        config = load_serverstats_config(guild.id)
        changed = False

        category: Optional[discord.CategoryChannel] = None
        cat_id_str = str(config.get("category_id", "")).strip()
        if cat_id_str.isdigit():
            ch = guild.get_channel(int(cat_id_str))
            if isinstance(ch, discord.CategoryChannel):
                category = ch

        category_name = config.get("category_name", "📊 Server Stats").strip() or "📊 Server Stats"
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
            except Exception as e:
                print(f"Failed to create category for ServerStats in {guild.id}: {e}")
                category = None
        elif category and category.name != category_name:
            try:
                await category.edit(name=category_name)
            except Exception:
                pass

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
            enabled = bool(config.get(enabled_key, False))
            ch_id_str = str(config.get(channel_id_key, "")).strip()
            template = str(config.get(name_key, default_template)).strip() or default_template
            target_name = template.replace("{count}", str(count))

            channel: Optional[discord.VoiceChannel] = None
            if ch_id_str.isdigit():
                ch = guild.get_channel(int(ch_id_str))
                if isinstance(ch, discord.VoiceChannel):
                    channel = ch

            if enabled:
                if not channel:
                    if category:
                        try:
                            channel = await category.create_voice_channel(target_name, overwrites=overwrites)
                            config[channel_id_key] = str(channel.id)
                            changed = True
                        except Exception as e:
                            print(f"Failed to create {key} stat channel in {guild.id}: {e}")
                else:
                    try:
                        edits = {}
                        if channel.name != target_name:
                            edits["name"] = target_name
                        if category and channel.category_id != category.id:
                            edits["category"] = category
                        if edits:
                            await channel.edit(**edits)
                    except Exception as e:
                        print(f"Failed to update {key} stat channel in {guild.id}: {e}")
            else:
                if channel:
                    try:
                        await channel.delete(reason="ServerStats disabled for this channel")
                    except Exception:
                        pass
                    config[channel_id_key] = ""
                    changed = True

        if changed:
            save_serverstats_config(guild.id, config)

        return config

    @tasks.loop(minutes=15)
    async def update_loop(self):
        for guild in self.bot.guilds:
            try:
                await self.sync_guild_stats(guild)
            except Exception as e:
                print(f"Error in ServerStats update loop for guild {guild.id}: {e}")
            await asyncio.sleep(1)

    @update_loop.before_loop
    async def before_update_loop(self):
        await self.bot.wait_until_ready()

    @commands.Cog.listener()
    async def on_member_join(self, member: discord.Member):
        try:
            await self.sync_guild_stats(member.guild)
        except Exception:
            pass

    @commands.Cog.listener()
    async def on_member_remove(self, member: discord.Member):
        try:
            await self.sync_guild_stats(member.guild)
        except Exception:
            pass

    @commands.Cog.listener()
    async def on_guild_update(self, before: discord.Guild, after: discord.Guild):
        try:
            await self.sync_guild_stats(after)
        except Exception:
            pass

async def setup(bot: commands.Bot):
    await bot.add_cog(ServerStats(bot))
