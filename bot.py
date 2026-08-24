import sys
sys.dont_write_bytecode = True

import os
import asyncio
import pathlib
import discord
from discord.ext import commands, tasks
import discord.ext.commands.core as core
from Components.Commands._utils import make_embed

def custom_has_permissions(**perms: bool):
    def decorator(func):
        async def predicate(ctx: commands.Context) -> bool:
            # 1. Bypass if server owner
            if ctx.guild and ctx.author.id == ctx.guild.owner_id:
                return True
            # 2. Bypass if bot owner
            if await ctx.bot.is_owner(ctx.author):
                return True
            
            # 3. Standard check
            ch = ctx.channel
            permissions = ch.permissions_for(ctx.author)
            missing = [perm for perm, value in perms.items() if getattr(permissions, perm) != value]
            if not missing:
                return True
            raise commands.MissingPermissions(missing)
        return commands.check(predicate)(func)
    return decorator

def custom_bot_has_permissions(**perms: bool):
    def decorator(func):
        async def predicate(ctx: commands.Context) -> bool:
            return True
        return commands.check(predicate)(func)
    return decorator

commands.has_permissions = custom_has_permissions
core.has_permissions = custom_has_permissions
commands.bot_has_permissions = custom_bot_has_permissions
core.bot_has_permissions = custom_bot_has_permissions
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    if os.path.exists(".env"):
        with open(".env", "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    os.environ[key.strip()] = value.strip()

TOKEN = os.getenv("TOKEN", "")
PREFIX = os.getenv("PREFIX", "-").replace("=", "").strip()
if not PREFIX:
    PREFIX = "-"

intents = discord.Intents.default()
intents.message_content = True
intents.members = True

DEV_ERROR_CHANNEL_ID = 1527101969750167743

async def send_dev_error(bot, source: str, error):
    try:
        channel = bot.get_channel(DEV_ERROR_CHANNEL_ID)
        if not channel:
            channel = await bot.fetch_channel(DEV_ERROR_CHANNEL_ID)
        if not channel:
            return
        
        import traceback
        if isinstance(error, Exception):
            tb_lines = traceback.format_exception(type(error), error, error.__traceback__)
            err_str = "".join(tb_lines)[:1800]
            msg = str(error)[:300]
        else:
            err_str = str(error)[:1800]
            msg = str(error)[:300]
            
        embed = discord.Embed(
            title="️ System Error Captured", 
            description=f"**Source:** {source}\n**Message:** {msg}", 
            color=discord.Color.red()
        )
        embed.add_field(name="Traceback", value=f"```python\n{err_str}\n```", inline=False)
        await channel.send(embed=embed)
    except Exception:
        pass

class DevmodeNoticeLayout(discord.ui.LayoutView):
    def __init__(self, reason: str):
        super().__init__()
        self.container = discord.ui.Container(
            discord.ui.TextDisplay(content="### Orbit Developer Mode Active"),
            discord.ui.Separator(spacing=discord.SeparatorSpacing.small),
            discord.ui.TextDisplay(content=f"**Status:** Developer Mode Activated (`Restricted Access`)\n**Reason:** {reason}\n\n*-# All regular bot interactions are temporarily paused while our developer deploys updates or performs maintenance. Please check back shortly!*")
        )
        self.add_item(self.container)

class OrbitCommandTree(discord.app_commands.CommandTree):
    async def interaction_check(self, interaction: discord.Interaction) -> bool:
        if interaction.guild:
            from Components.Commands.Blacklist._storage import is_blacklisted
            if is_blacklisted(interaction.guild.id, interaction.user.id):
                try:
                    if interaction.response.is_done():
                        await interaction.followup.send(embed=make_embed("You are blacklisted from using bot commands on this server.", discord.Color.red()), ephemeral=True)
                    else:
                        await interaction.response.send_message(embed=make_embed("You are blacklisted from using bot commands on this server.", discord.Color.red()), ephemeral=True)
                except Exception:
                    pass
                return False

        from Components.Commands.OwnerOnly._storage import is_devmode_enabled
        enabled, reason = is_devmode_enabled()
        if not enabled:
            return True
        if await interaction.client.is_owner(interaction.user):
            return True
        view = DevmodeNoticeLayout(reason)
        try:
            if interaction.response.is_done():
                await interaction.followup.send(view=view, ephemeral=True, allowed_mentions=discord.AllowedMentions.none())
            else:
                await interaction.response.send_message(view=view, ephemeral=True, allowed_mentions=discord.AllowedMentions.none())
        except Exception:
            pass
        return False

    async def on_error(self, interaction: discord.Interaction, error: discord.app_commands.AppCommandError):
        try:
            from Components.Commands.OwnerOnly._monitor import record_error
            cmd_name = interaction.command.name if interaction.command else "Component/Modal"
            error_val = getattr(error, "original", error)
            record_error(f"AppCommand/UI Error [{cmd_name}]", error_val)
            await send_dev_error(interaction.client, f"AppCommand/UI Error [{cmd_name}]", error_val)
        except Exception:
            pass
        try:
            if not interaction.response.is_done():
                await interaction.response.send_message(embed=make_embed(f"An error occurred: `{error}`", discord.Color.red()), ephemeral=True)
        except Exception:
            pass

PREFIX_CACHE = {}

async def get_prefix(bot, message: discord.Message):
    if not message.guild:
        return commands.when_mentioned_or(PREFIX)(bot, message)
        
    guild_id = message.guild.id
    if guild_id in PREFIX_CACHE:
        pfx = PREFIX_CACHE[guild_id]
        if not pfx:
            pfx = PREFIX
        return commands.when_mentioned_or(pfx)(bot, message)
        
    # Fetch from DB
    try:
        from Components.Database.mongodb import get_db
        db = get_db()
        if db is not None:
            doc = db["GuildSettings"].find_one({"_id": guild_id}, {"prefix": 1})
            if doc and "prefix" in doc and doc["prefix"].strip():
                pfx = doc["prefix"].strip()
                PREFIX_CACHE[guild_id] = pfx
                return commands.when_mentioned_or(pfx)(bot, message)
    except Exception:
        pass
        
    # Cache the default so we don't spam DB queries
    PREFIX_CACHE[guild_id] = PREFIX
    return commands.when_mentioned_or(PREFIX)(bot, message)

# Patch commands.Context.send to handle ephemeral kwarg safely for prefix commands
_old_send = commands.Context.send
async def _safe_send(self, *args, **kwargs):
    if self.interaction is None:
        kwargs.pop("ephemeral", None)
    return await _old_send(self, *args, **kwargs)
commands.Context.send = _safe_send

class OrbitBot(commands.Bot):
    def __init__(self):
        import collections
        self.stats_history = collections.deque(maxlen=30)
        try:
            from Components.Commands.OwnerOnly.status import _load_status, _build_activity, _parse_discord_status
            data = _load_status()
            if data and isinstance(data, dict):
                act = _build_activity(data.get("type", "clear"), data.get("text", ""))
                discord_status = _parse_discord_status(data.get("status", "online"))
            else:
                act = None
                discord_status = None
        except Exception:
            act = None
            discord_status = None
            
        owner_ids = set()
        env_owners = os.environ.get("OWNER_IDS") or os.environ.get("BOT_OWNER_ID") or os.environ.get("OWNER")
        if env_owners:
            try:
                parsed = {int(x.strip()) for x in env_owners.split(",") if x.strip().isdigit()}
                owner_ids.update(parsed)
            except Exception:
                pass
            
        super().__init__(
            command_prefix=get_prefix,
            intents=intents,
            help_command=None,
            tree_cls=OrbitCommandTree,
            activity=act,
            status=discord_status,
            owner_ids=owner_ids or None
        )

    async def is_true_owner(self, user: discord.User | discord.Member) -> bool:
        return await super().is_owner(user)

    async def is_owner(self, user: discord.User | discord.Member) -> bool:
        if await super().is_owner(user):
            return True
        try:
            import json, os
            path = os.path.join("Components/Database", "developers.json")
            if os.path.exists(path):
                with open(path, "r") as f:
                    devs = json.load(f)
                if user.id in devs:
                    return True
        except Exception:
            pass
        return False

    @tasks.loop(seconds=2)
    async def live_stats_loop(self):
        try:
            import psutil, os, math
            process = psutil.Process(os.getpid())
            ram_mb = process.memory_info().rss / 1024 ** 2
            
            lat = self.latency
            if math.isinf(lat) or math.isnan(lat):
                ping = 0
            else:
                ping = round(lat * 1000)
                
            self.stats_history.append({
                "servers": len(self.guilds),
                "users": len(self.users),
                "ping": ping,
                "ram": round(ram_mb, 2)
            })
        except Exception as e:
            print(f"Stats loop error: {e}")

    @tasks.loop(minutes=5)
    async def uptime_loop(self):
        try:
            from Components.Database.mongodb import get_db
            import datetime
            db = get_db()
            if db is not None:
                today_str = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d")
                today_dt = datetime.datetime.now(datetime.timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
                
                db_up = 1 if db is not None else 0
                api_up = 1 if not self.is_closed() else 0
                
                db["UptimeStats"].update_one(
                    {"_id": today_str},
                    {
                        "$inc": {
                            "bot_pings": 1,
                            "db_pings": db_up,
                            "api_pings": api_up
                        },
                        "$setOnInsert": {"date": today_dt}
                    },
                    upsert=True
                )
        except Exception as e:
            print(f"Uptime loop error: {e}")

    async def setup_hook(self):
        try:
            self.live_stats_loop.start()
            self.uptime_loop.start()
            print("Background stats tracking started.")
        except Exception as e:
            print(f"Failed to start stats tracking: {e}")

        commands_dir = pathlib.Path("Components/Commands")
        if not commands_dir.exists():
            commands_dir.mkdir(parents=True, exist_ok=True)
            
        try:
            from Components.Commands.Verify._views import PersistentVerifyLayout
            self.add_view(PersistentVerifyLayout())
        except Exception as e:
            print(f"Failed to add PersistentVerifyLayout: {e}")

        try:
            await self.load_extension("Components.Dashboard.Automoderation.automodlistener")
            await self.load_extension("Components.Dashboard.Automoderation.log_listener")
            print("Loaded AutoMod Listener")
        except Exception as e:
            print(f"Failed to load AutoMod Listener: {e}")

        # Load root command group modules first (e.g. Commands/Role/role.py, Commands/Ticket/ticket.py)
        for file_path in commands_dir.rglob("*.py"):
            if file_path.name.startswith("_"):
                continue
            if file_path.stem.lower() == file_path.parent.name.lower():
                extension = ".".join(file_path.with_suffix("").parts)
                try:
                    await self.load_extension(extension)
                    print(f"Loaded Root Group: {extension}")
                except Exception as e:
                    print(f"Failed to load root group {extension}: {e}")

        for file_path in commands_dir.rglob("*.py"):
            if file_path.name.startswith("_"):
                continue
            if file_path.stem in ["image_gen", "transcript_render", "rank_card", "leaderboard_card"]:
                continue
            if file_path.stem.lower() == file_path.parent.name.lower():
                continue
            extension = ".".join(file_path.with_suffix("").parts)
            try:
                await self.load_extension(extension)
                print(f"Loaded: {extension}")
            except Exception as e:
                print(f"Failed to load standard cog {extension}: {e}")

        async def background_sync():
            try:
                synced = await self.tree.sync()
                total_cmds = 0
                for cmd in synced:
                    if hasattr(cmd, 'commands'):
                        total_cmds += len(cmd.commands) + 1
                    else:
                        total_cmds += 1
                print(f"Synced {len(synced)} top-level command group(s) ({total_cmds} total subcommands & commands across all modules)")
            except Exception as e:
                print(f"Failed to sync commands: {e}")
                
        import asyncio
        asyncio.create_task(background_sync())

        _old_view_error = discord.ui.View.on_error
        async def _global_view_error(view_self, interaction: discord.Interaction, error: Exception, item: discord.ui.Item):
            try:
                from Components.Commands.OwnerOnly._monitor import record_error
                source_name = f"UI View Error [{view_self.__class__.__name__} -> {item.__class__.__name__}]"
                record_error(source_name, error)
                await send_dev_error(interaction.client, source_name, error)
            except Exception:
                pass
            await _old_view_error(view_self, interaction, error, item)
        discord.ui.View.on_error = _global_view_error

        _old_modal_error = discord.ui.Modal.on_error
        async def _global_modal_error(modal_self, interaction: discord.Interaction, error: Exception):
            try:
                from Components.Commands.OwnerOnly._monitor import record_error
                source_name = f"UI Modal Error [{modal_self.__class__.__name__}]"
                record_error(source_name, error)
                await send_dev_error(interaction.client, source_name, error)
            except Exception:
                pass
            await _old_modal_error(modal_self, interaction, error)
        discord.ui.Modal.on_error = _global_modal_error

    async def on_error(self, event_method: str, *args, **kwargs):
        try:
            from Components.Commands.OwnerOnly._monitor import record_error
            import sys
            exc_type, exc_value, exc_tb = sys.exc_info()
            if exc_value:
                source_name = f"Event Error [{event_method}]"
                record_error(source_name, exc_value)
                await send_dev_error(self, source_name, exc_value)
        except Exception:
            pass
        await super().on_error(event_method, *args, **kwargs)

    async def on_ready(self):
        print(f"Logged in as {self.user} (ID: {self.user.id})")
        print(f"Prefix: '{PREFIX}'")
        print(f"Loaded cogs: {len(self.cogs)}")

    async def on_message(self, message: discord.Message):
        if not message.author.bot:
            try:
                from Components.Commands.OwnerOnly._monitor import record_message
                record_message()
            except Exception:
                pass
        await super().on_message(message)

    async def on_command_error(self, ctx: commands.Context, error: commands.CommandError):
        if isinstance(error, (commands.CommandNotFound, commands.CheckFailure)):
            return
        if hasattr(error, "original") and isinstance(error.original, discord.app_commands.errors.CommandSignatureMismatch):
            try:
                await ctx.send(embed=make_embed("Command definitions have just been updated! Please try running the command again.", discord.Color.green()), ephemeral=True)
            except Exception:
                pass
            return
        try:
            from Components.Commands.OwnerOnly._monitor import record_error
            error_val = getattr(error, "original", error)
            record_error("Command Error", error_val)
            await send_dev_error(ctx.bot, "Command Error", error_val)
        except Exception:
            pass
        raise error

bot = OrbitBot()

@bot.check
async def global_blacklist_prefix_check(ctx: commands.Context):
    if not ctx.guild:
        return True
    from Components.Commands.Blacklist._storage import is_blacklisted
    if is_blacklisted(ctx.guild.id, ctx.author.id):
        try:
            await ctx.send(embed=make_embed("You are blacklisted from using bot commands on this server.", discord.Color.red()), delete_after=5.0)
        except Exception:
            pass
        return False
    return True

@bot.check
async def global_devmode_prefix_check(ctx: commands.Context):
    from Components.Commands.OwnerOnly._storage import is_devmode_enabled
    enabled, reason = is_devmode_enabled()
    if not enabled:
        return True
    if await ctx.bot.is_owner(ctx.author):
        return True
    view = DevmodeNoticeLayout(reason)
    try:
        await ctx.send(view=view, delete_after=15.0, allowed_mentions=discord.AllowedMentions.none())
    except Exception:
        pass
    return False

async def start_bot_loop():
    import sys
    retry_delay = int(os.environ.get("RETRY_DELAY", 10))
    try:
        await bot.start(TOKEN)
    except discord.errors.LoginFailure as e:
        print(f"FATAL ERROR: Invalid Token. Details: {e}", flush=True)
        os._exit(1)
    except discord.errors.PrivilegedIntentsRequired as e:
        print(f"FATAL ERROR: Privileged Intents missing. Details: {e}", flush=True)
        os._exit(1)
    except Exception as e:
        print(f"Bot crashed / Network error occurred: {e}", flush=True)
        if "429" in str(e) or "1015" in str(e):
            print("Cloudflare 1015 / 429 Rate Limit hit. Discord banned this IP temporarily.", flush=True)
            retry_delay = min(retry_delay * 2, 3600)
        else:
            retry_delay = 10
        
        print(f"Retrying connection in {retry_delay} seconds...", flush=True)
        # Sleep asynchronously to keep the web server alive!
        await asyncio.sleep(retry_delay)
        
        # Cleanly restart the process to reset discord.py session state
        os.environ["RETRY_DELAY"] = str(retry_delay)
        os.execv(sys.executable, [sys.executable] + sys.argv)

async def main():
    import discord
    discord.utils.setup_logging()
    runner = None
    try:
        from aiohttp import web
        from Website.backend.main import setup_web_app
        import os
        app = setup_web_app(bot)
        runner = web.AppRunner(app)
        await runner.setup()
        port = int(os.environ.get("PORT", 10000))
        site = web.TCPSite(runner, "0.0.0.0", port)
        await site.start()
        print(f"Web Dashboard started on 0.0.0.0:{port}", flush=True)
    except Exception as e:
        print(f"Failed to start Web Dashboard: {e}", flush=True)

    # Start the bot in the same event loop, letting it handle its own retries
    await start_bot_loop()
    
    if runner:
        try:
            await runner.cleanup()
        except Exception:
            pass

if __name__ == "__main__":
    if not TOKEN:
        print("Error: No TOKEN found in .env file.")
    else:
        import asyncio
        import os
        try:
            asyncio.run(main())
        except KeyboardInterrupt:
            print("Bot shutdown requested.")
