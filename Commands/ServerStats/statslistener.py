import discord
from discord.ext import commands, tasks
import asyncio
from ._storage import load_serverstats_config, save_serverstats_config

async def update_server_stats(guild: discord.Guild, config: dict = None) -> dict:
    if not guild:
        return config

    if config is None:
        config = load_serverstats_config(guild.id)

    if not config.get("enabled", False):
        return config

    config_changed = False

    # 1. Resolve, Rename or Create Category
    cat = None
    cat_id_str = str(config.get("category_id", ""))
    if cat_id_str.isdigit():
        cat = discord.utils.get(guild.categories, id=int(cat_id_str))

    cat_name = config.get("category_name", "").strip()

    if cat:
        if cat_name and cat.name != cat_name:
            try:
                await cat.edit(name=cat_name)
            except Exception as e:
                print(f"[ServerStats] Failed to rename category in {guild.name}: {e}")
    else:
        if not cat_name:
            cat_name = "📊 SERVER STATS 📊"
        try:
            cat = await guild.create_category(name=cat_name, position=0)
            config["category_id"] = str(cat.id)
            config_changed = True
        except Exception as e:
            print(f"[ServerStats] Failed to create category in {guild.name}: {e}")
            return config

    # 2. Gather Stats
    total_members = guild.member_count or len(guild.members)
    humans_count = len([m for m in guild.members if not m.bot])
    bots_count = len([m for m in guild.members if m.bot])
    boosts_count = getattr(guild, "premium_subscription_count", 0) or 0
    voice_users_count = sum(len(vc.members) for vc in guild.voice_channels)

    # 3. Process Stats Channels
    channels = config.get("channels", {})
    
    stat_values = {
        "{count}": str(total_members),
        "{members}": str(total_members),
        "{humans}": str(humans_count),
        "{bots}": str(bots_count),
        "{boosts}": str(boosts_count),
        "{voice_users}": str(voice_users_count)
    }

    overwrites = {
        guild.default_role: discord.PermissionOverwrite(connect=False)
    }

    for key, ch_cfg in channels.items():
        if not isinstance(ch_cfg, dict):
            continue

        if not ch_cfg.get("enabled", False):
            continue

        fmt = ch_cfg.get("format", f"{key.capitalize()}: {{count}}")
        for placeholder, val in stat_values.items():
            fmt = fmt.replace(placeholder, val)

        formatted_name = fmt[:100] # Discord channel name max length

        ch_id_str = str(ch_cfg.get("channel_id", ""))
        vc = None
        if ch_id_str.isdigit():
            vc = discord.utils.get(guild.voice_channels, id=int(ch_id_str))

        try:
            if vc:
                # Update existing channel
                edit_kwargs = {}
                if vc.category_id != cat.id:
                    edit_kwargs["category"] = cat
                if vc.name != formatted_name:
                    edit_kwargs["name"] = formatted_name
                
                if edit_kwargs:
                    await vc.edit(**edit_kwargs)
            else:
                # Create new channel under Category
                new_vc = await guild.create_voice_channel(name=formatted_name, category=cat, overwrites=overwrites)
                ch_cfg["channel_id"] = str(new_vc.id)
                config_changed = True
        except Exception as e:
            print(f"[ServerStats] Error updating channel {key} for guild {guild.name}: {e}")

    if config_changed:
        save_serverstats_config(guild.id, config)

    return config


class ServerStatsListener(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.stats_loop.start()

    def cog_unload(self):
        self.stats_loop.cancel()

    @tasks.loop(minutes=10)
    async def stats_loop(self):
        for guild in self.bot.guilds:
            try:
                cfg = load_serverstats_config(guild.id)
                if cfg.get("enabled", False):
                    await update_server_stats(guild, cfg)
            except Exception as e:
                print(f"[ServerStats] Loop error for {guild.name}: {e}")

    @stats_loop.before_loop
    async def before_stats_loop(self):
        await self.bot.wait_until_ready()

    @commands.Cog.listener()
    async def on_member_join(self, member):
        await update_server_stats(member.guild)

    @commands.Cog.listener()
    async def on_member_remove(self, member):
        await update_server_stats(member.guild)

    @commands.Cog.listener()
    async def on_guild_update(self, before, after):
        if before.premium_subscription_count != after.premium_subscription_count:
            await update_server_stats(after)

    @commands.Cog.listener()
    async def on_voice_state_update(self, member, before, after):
        if before.channel != after.channel:
            cfg = load_serverstats_config(member.guild.id)
            if cfg.get("enabled", False) and cfg.get("channels", {}).get("voice_users", {}).get("enabled", False):
                await update_server_stats(member.guild, cfg)


async def setup(bot):
    await bot.add_cog(ServerStatsListener(bot))
