import sys
sys.dont_write_bytecode = True
try:
    sys.stdout.reconfigure(line_buffering=True)
    sys.stderr.reconfigure(line_buffering=True)
except Exception:
    pass

import os
import asyncio
import pathlib
import discord
from discord.ext import commands, tasks
import discord.ext.commands.core as core
from Components.Commands._utils import make_embed
from Components.emojis import Emojis

def custom_has_permissions(**perms: bool):
    def decorator(func):
        async def predicate(ctx: commands.Context) -> bool:
            if ctx.guild and ctx.author.id == ctx.guild.owner_id:
                return True
            if await ctx.bot.is_owner(ctx.author):
                return True
            
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

import aiohttp
import discord.http

_orig_http_request = discord.http.HTTPClient.request

async def _resilient_http_request(self, *args, **kwargs):
    for attempt in range(4):
        try:
            return await _orig_http_request(self, *args, **kwargs)
        except (aiohttp.ClientOSError, BrokenPipeError, ConnectionResetError, aiohttp.ServerDisconnectedError) as err:
            if attempt < 3:
                files = kwargs.get("files")
                if files:
                    for f in files:
                        try:
                            f.reset()
                        except Exception:
                            pass
                await asyncio.sleep(0.5 * (attempt + 1))
                continue
            raise

discord.http.HTTPClient.request = _resilient_http_request

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
            title="System Error Captured", 
            description=f"**Source:** {source}\n**Message:** {msg}", 
            color=discord.Color.red()
        )
        embed.add_field(name="Traceback", value=f"```python\n{err_str}\n```", inline=False)
        await channel.send(embed=embed)
    except Exception:
        pass

class OrbitCommandTree(discord.app_commands.CommandTree):
    async def interaction_check(self, interaction: discord.Interaction) -> bool:
        if interaction.guild:
            from Components.Commands.Blacklist._storage import is_blacklisted
            if is_blacklisted(interaction.guild.id, interaction.user.id):
                try:
                    if interaction.response.is_done():
                        await interaction.followup.send(embed=make_embed(f"You are blacklisted from using bot commands on this server.", discord.Color.red()), ephemeral=True)
                    else:
                        await interaction.response.send_message(embed=make_embed(f"You are blacklisted from using bot commands on this server.", discord.Color.red()), ephemeral=True)
                except Exception:
                    pass
                return False

        from Components.Commands.OwnerOnly._storage import is_devmode_enabled
        enabled, reason = is_devmode_enabled()
        if not enabled:
            return True
        if await interaction.client.is_owner(interaction.user):
            return True
        embed = discord.Embed(
            title="Orbit Developer Mode Active",
            description=f"**Status:** Developer Mode Activated (`Restricted Access`)\n**Reason:** {reason}\n\n*All regular bot interactions are temporarily paused while our developer deploys updates or performs maintenance. Please check back shortly!*",
            color=discord.Color.gold()
        )
        try:
            if interaction.response.is_done():
                await interaction.followup.send(embed=embed, ephemeral=True, allowed_mentions=discord.AllowedMentions.none())
            else:
                await interaction.response.send_message(embed=embed, ephemeral=True, allowed_mentions=discord.AllowedMentions.none())
        except Exception:
            pass
        return False

    async def on_error(self, interaction: discord.Interaction, error: discord.app_commands.AppCommandError):
        error_val = getattr(error, "original", error)
        if isinstance(error_val, discord.NotFound) or (isinstance(error_val, discord.HTTPException) and error_val.code in (10062, 10015)):
            return
        try:
            from Components.Commands.OwnerOnly._monitor import record_error
            cmd_name = interaction.command.name if interaction.command else "Component/Modal"
            record_error(f"AppCommand/UI Error [{cmd_name}]", error_val)
            await send_dev_error(interaction.client, f"AppCommand/UI Error [{cmd_name}]", error_val)
        except Exception:
            pass
        try:
            if not interaction.response.is_done():
                await interaction.response.send_message(embed=make_embed(f"An error occurred: `{error}`", discord.Color.red()), ephemeral=True)
        except Exception:
            pass



_old_send = commands.Context.send
async def _safe_send(self, *args, **kwargs):
    if self.interaction is None:
        kwargs.pop("ephemeral", None)
    return await _old_send(self, *args, **kwargs)
commands.Context.send = _safe_send

class OrbitBot(commands.Bot):
    def __init__(self):
        import time, collections
        self.start_time = time.time()
        self.stats_history = collections.deque(maxlen=30)
        try:
            import psutil, os
            self._proc = psutil.Process(os.getpid())
        except Exception:
            self._proc = None
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
            
        proxy_url = os.environ.get("DISCORD_PROXY")
        proxy = None
        proxy_auth = None
        if proxy_url:
            import urllib.parse
            parsed = urllib.parse.urlparse(proxy_url)
            if parsed.username and parsed.password:
                proxy_auth = aiohttp.BasicAuth(parsed.username, parsed.password)
                proxy = f"{parsed.scheme}://{parsed.hostname}:{parsed.port}"
            else:
                proxy = proxy_url
            print(f"[Proxy] Discord traffic routed through: {proxy}")

        super().__init__(
            command_prefix="-",
            intents=intents,
            help_command=None,
            tree_cls=OrbitCommandTree,
            activity=act,
            status=discord_status,
            owner_ids=owner_ids or None,
            proxy=proxy,
            proxy_auth=proxy_auth
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

    @tasks.loop(seconds=5)
    async def live_stats_loop(self):
        try:
            import math
            ram_mb = 0.0
            if getattr(self, "_proc", None):
                try:
                    ram_mb = self._proc.memory_info().rss / (1024 ** 2)
                except Exception:
                    pass
            
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

    @live_stats_loop.error
    async def live_stats_loop_error(self, error):
        print(f"Internal error in live_stats_loop: {error}")
        await asyncio.sleep(5)
        if not self.live_stats_loop.is_running():
            try:
                self.live_stats_loop.restart()
            except Exception:
                pass

    @tasks.loop(minutes=5)
    async def uptime_loop(self):
        try:
            def _sync_uptime():
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
            await asyncio.to_thread(_sync_uptime)
        except Exception as e:
            print(f"Uptime loop error: {e}")

    @uptime_loop.error
    async def uptime_loop_error(self, error):
        print(f"Internal error in uptime_loop: {error}")
        await asyncio.sleep(5)
        if not self.uptime_loop.is_running():
            try:
                self.uptime_loop.restart()
            except Exception:
                pass

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
            from Components.Systems.Verify._views import PersistentVerifyLayout
            self.add_view(PersistentVerifyLayout())
        except Exception as e:
            print(f"Failed to add PersistentVerifyLayout: {e}")

        systems_to_load = [
            ("Components.Systems.Automoderation.automodlistener", "AutoMod Listener"),
            ("Components.Systems.Automoderation.log_listener", "Log Listener"),
            ("Components.Systems.Roles.joinrolelistener", "JoinRole Listener"),
            ("Components.Systems.WelcomeGoodbye.listener", "Welcome Listener"),
            ("Components.Systems.ReactionRole.reactionrolelistener", "ReactionRole Listener"),
            ("Components.Systems.JoinToCreate.jtclistener", "JTC Listener"),
            ("Components.Systems.Tickets.ticketlistener", "Ticket Listener"),
            ("Components.Systems.Security.security", "Security System"),
            ("Components.Systems.Level.levellistener", "Level Listener"),
            ("Components.Systems.Verify.verifylistener", "Verify Listener"),
            ("Components.Systems.Verify.verify", "Verify Commands"),
            ("Components.Systems.InactiveKick.listener", "Inactive Kick Listener"),
        ]

        print("=== Orbit System Loading ===", flush=True)
        for ext, name in systems_to_load:
            try:
                await self.load_extension(ext)
                print(f"[OK] System: {name}", flush=True)
            except Exception as e:
                import traceback
                print(f"[ERROR] Failed to load {name} ({ext}): {e}\n{traceback.format_exc()}", flush=True)

        print("\n=== Orbit Command Modules Loading ===", flush=True)
        loaded_cmd_modules = []
        failed_cmd_modules = []

        for folder in sorted(commands_dir.iterdir(), key=lambda p: p.name.lower()):
            if not folder.is_dir() or folder.name.startswith("_") or folder.name.startswith("."):
                continue
            if folder.name == "OwnerOnly":
                continue
            init_file = folder / "init.py"
            if init_file.exists():
                extension = f"Components.Commands.{folder.name}.init"
                if extension in self.extensions:
                    continue
                try:
                    await self.load_extension(extension)
                    loaded_cmd_modules.append(folder.name)
                    print(f"[OK] Command Module: {folder.name}", flush=True)
                except Exception as e:
                    import traceback
                    failed_cmd_modules.append(folder.name)
                    print(f"[ERROR] Failed to load command module {folder.name}: {e}\n{traceback.format_exc()}", flush=True)
            else:
                print(f"[WARN] No init.py in {folder.name}", flush=True)

        print(f"\nLoaded {len(loaded_cmd_modules)} Command Modules successfully.", flush=True)
        if failed_cmd_modules:
            print(f"[WARN] Failed modules: {', '.join(failed_cmd_modules)}", flush=True)

        owner_dir = commands_dir / "OwnerOnly"
        if owner_dir.exists():
            print("\n=== Orbit Owner Commands Loading ===", flush=True)
            for file_path in sorted(owner_dir.glob("*.py"), key=lambda p: p.name.lower()):
                if file_path.name.startswith("_") or file_path.name in ["storage.py", "prefix.py", "listener.py", "command.py", "init.py"]:
                    continue
                extension = f"Components.Commands.OwnerOnly.{file_path.stem}"
                if extension in self.extensions:
                    continue
                try:
                    await self.load_extension(extension)
                    print(f"[OK] Owner Command: {file_path.stem}", flush=True)
                except Exception as e:
                    import traceback
                    print(f"[ERROR] Failed to load owner command {file_path.stem}: {e}\n{traceback.format_exc()}", flush=True)

        async def background_sync():
            try:
                print("\n=== Synchronizing Command Tree with Discord... ===", flush=True)
                synced = await self.tree.sync()
                top_cmd_names = []
                total_cmds = 0
                for cmd in synced:
                    if hasattr(cmd, 'commands'):
                        sub_names = [f"/{cmd.name} {sc.name}" for sc in cmd.commands]
                        top_cmd_names.append(f"/{cmd.name} ({len(sub_names)} subcommands)")
                        total_cmds += len(sub_names)
                    else:
                        top_cmd_names.append(f"/{cmd.name}")
                        total_cmds += 1

                print(f"=== Successfully Synced {len(synced)} Top-Level Groups/Commands ({total_cmds} Total) with Discord ===", flush=True)
                print(f"Commands List: {', '.join(sorted(top_cmd_names))}", flush=True)
            except Exception as e:
                import traceback
                print(f"[ERROR] Failed to sync commands with Discord: {e}\n{traceback.format_exc()}", flush=True)

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
        print(f"Loaded cogs: {len(self.cogs)}")
        try:
            from Components.Commands.OwnerOnly.status import _load_status, _build_activity, _parse_discord_status
            status_data = _load_status()
            if status_data:
                act = _build_activity(status_data.get("type", "clear"), status_data.get("text", ""))
                discord_status = _parse_discord_status(status_data.get("status", "online"))
                await self.change_presence(activity=act, status=discord_status)
                print(f"[BotStatus] Applied presence on_ready: type={status_data.get('type')}, status={status_data.get('status')}, text='{status_data.get('text')}'")
        except Exception as e:
            print(f"[BotStatus] Error applying presence on_ready: {e}")

    async def on_message(self, message: discord.Message):
        if not message.author.bot:
            try:
                from Components.Commands.OwnerOnly._monitor import record_message
                record_message()
            except Exception:
                pass
        await self.process_commands(message)

    async def process_commands(self, message: discord.Message):
        if message.author.bot:
            return
        ctx = await self.get_context(message)
        if ctx.command is None:
            return
        cog_name = ctx.command.cog_name or ""
        module_name = getattr(ctx.command.callback, "__module__", "")
        if "OwnerOnly" not in cog_name and "OwnerOnly" not in module_name:
            return
        await self.invoke(ctx)

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
        await asyncio.sleep(retry_delay)
        
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
        runner = web.AppRunner(app, access_log=None)
        await runner.setup()
        port = int(os.environ.get("PORT", 10000))
        site = web.TCPSite(runner, "0.0.0.0", port)
        await site.start()
        print(f"Web Dashboard started on 0.0.0.0:{port}", flush=True)
    except Exception as e:
        print(f"Failed to start Web Dashboard: {e}", flush=True)

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
