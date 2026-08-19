import sys
sys.dont_write_bytecode = True

import os
import asyncio
import pathlib
import traceback

import discord
from discord.ext import commands, tasks
import discord.ext.commands.core as core

from Commands._utils import make_embed


# ============================================================
# CUSTOM PERMISSION CHECKS
# ============================================================

def custom_has_permissions(**perms: bool):
    def decorator(func):
        async def predicate(ctx: commands.Context) -> bool:
            # Server owner bypass
            if ctx.guild and ctx.author.id == ctx.guild.owner_id:
                return True

            # Bot owner bypass
            if await ctx.bot.is_owner(ctx.author):
                return True

            # Standard permission check
            ch = ctx.channel
            permissions = ch.permissions_for(ctx.author)

            missing = [
                perm
                for perm, value in perms.items()
                if getattr(permissions, perm) != value
            ]

            if not missing:
                return True

            raise commands.MissingPermissions(missing)

        return commands.check(predicate)(func)

    return decorator


def custom_bot_has_permissions(**perms: bool):
    def decorator(func):
        async def predicate(ctx: commands.Context) -> bool:
            # Intentionally bypassed
            return True

        return commands.check(predicate)(func)

    return decorator


commands.has_permissions = custom_has_permissions
core.has_permissions = custom_has_permissions

commands.bot_has_permissions = custom_bot_has_permissions
core.bot_has_permissions = custom_bot_has_permissions


# ============================================================
# ENVIRONMENT
# ============================================================

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    if os.path.exists(".env"):
        with open(".env", "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()

                if (
                    line
                    and not line.startswith("#")
                    and "=" in line
                ):
                    key, value = line.split("=", 1)
                    os.environ[key.strip()] = value.strip()


TOKEN = os.getenv("TOKEN", "").strip()

PREFIX = os.getenv("PREFIX", "-")
PREFIX = PREFIX.replace("=", "").strip()

if not PREFIX:
    PREFIX = "-"


# ============================================================
# DISCORD INTENTS
# ============================================================

intents = discord.Intents.default()

intents.message_content = True
intents.members = True


# ============================================================
# CONFIG
# ============================================================

DEV_ERROR_CHANNEL_ID = 1527101969750167743


# ============================================================
# ERROR REPORTING
# ============================================================

async def send_dev_error(bot, source: str, error):
    try:
        channel = bot.get_channel(DEV_ERROR_CHANNEL_ID)

        if not channel:
            channel = await bot.fetch_channel(DEV_ERROR_CHANNEL_ID)

        if not channel:
            return

        if isinstance(error, Exception):
            tb_lines = traceback.format_exception(
                type(error),
                error,
                error.__traceback__
            )

            err_str = "".join(tb_lines)[:1800]
            msg = str(error)[:300]

        else:
            err_str = str(error)[:1800]
            msg = str(error)[:300]

        embed = discord.Embed(
            title="System Error Captured",
            description=(
                f"**Source:** {source}\n"
                f"**Message:** {msg}"
            ),
            color=discord.Color.red()
        )

        embed.add_field(
            name="Traceback",
            value=f"```python\n{err_str}\n```",
            inline=False
        )

        await channel.send(embed=embed)

    except Exception as e:
        print(
            f"[ERROR] Failed to send developer error report: "
            f"{type(e).__name__}: {e}"
        )


# ============================================================
# DEVELOPER MODE UI
# ============================================================

class DevmodeNoticeLayout(discord.ui.LayoutView):

    def __init__(self, reason: str):
        super().__init__()

        self.container = discord.ui.Container(
            discord.ui.TextDisplay(
                content="### Orbit Developer Mode Active"
            ),

            discord.ui.Separator(
                spacing=discord.SeparatorSpacing.small
            ),

            discord.ui.TextDisplay(
                content=(
                    "**Status:** Developer Mode Activated "
                    "(`Restricted Access`)\n"
                    f"**Reason:** {reason}\n\n"
                    "*-# All regular bot interactions are temporarily "
                    "paused while our developer deploys updates or "
                    "performs maintenance. Please check back shortly!*"
                )
            )
        )

        self.add_item(self.container)


# ============================================================
# COMMAND TREE
# ============================================================

class OrbitCommandTree(discord.app_commands.CommandTree):

    async def interaction_check(
        self,
        interaction: discord.Interaction
    ) -> bool:

        # -----------------------------------------
        # BLACKLIST
        # -----------------------------------------

        if interaction.guild:

            from Commands.Blacklist._storage import is_blacklisted

            if is_blacklisted(
                interaction.guild.id,
                interaction.user.id
            ):
                try:
                    embed = make_embed(
                        "You are blacklisted from using bot commands "
                        "on this server.",
                        discord.Color.red()
                    )

                    if interaction.response.is_done():
                        await interaction.followup.send(
                            embed=embed,
                            ephemeral=True
                        )
                    else:
                        await interaction.response.send_message(
                            embed=embed,
                            ephemeral=True
                        )

                except Exception as e:
                    print(
                        f"[ERROR] Blacklist response failed: "
                        f"{type(e).__name__}: {e}"
                    )

                return False

        # -----------------------------------------
        # DEVELOPER MODE
        # -----------------------------------------

        from Commands.OwnerOnly._storage import is_devmode_enabled

        enabled, reason = is_devmode_enabled()

        if not enabled:
            return True

        if await interaction.client.is_owner(
            interaction.user
        ):
            return True

        view = DevmodeNoticeLayout(reason)

        try:
            if interaction.response.is_done():
                await interaction.followup.send(
                    view=view,
                    ephemeral=True,
                    allowed_mentions=discord.AllowedMentions.none()
                )
            else:
                await interaction.response.send_message(
                    view=view,
                    ephemeral=True,
                    allowed_mentions=discord.AllowedMentions.none()
                )

        except Exception as e:
            print(
                f"[ERROR] Developer mode response failed: "
                f"{type(e).__name__}: {e}"
            )

        return False

    async def on_error(
        self,
        interaction: discord.Interaction,
        error: discord.app_commands.AppCommandError
    ):

        try:
            from Commands.OwnerOnly._monitor import record_error

            cmd_name = (
                interaction.command.name
                if interaction.command
                else "Component/Modal"
            )

            error_val = getattr(
                error,
                "original",
                error
            )

            record_error(
                f"AppCommand/UI Error [{cmd_name}]",
                error_val
            )

            await send_dev_error(
                interaction.client,
                f"AppCommand/UI Error [{cmd_name}]",
                error_val
            )

        except Exception as e:
            print(
                f"[ERROR] AppCommand error logging failed: "
                f"{type(e).__name__}: {e}"
            )

        try:
            if not interaction.response.is_done():

                await interaction.response.send_message(
                    embed=make_embed(
                        f"An error occurred: `{error}`",
                        discord.Color.red()
                    ),
                    ephemeral=True
                )

        except Exception as e:
            print(
                f"[ERROR] Failed to send command error: "
                f"{type(e).__name__}: {e}"
            )


# ============================================================
# PREFIX CACHE
# ============================================================

PREFIX_CACHE = {}


async def get_prefix(
    bot,
    message: discord.Message
):

    if not message.guild:
        return commands.when_mentioned_or(
            PREFIX
        )(bot, message)

    guild_id = message.guild.id

    # Cache
    if guild_id in PREFIX_CACHE:

        pfx = PREFIX_CACHE[guild_id]

        if not pfx:
            pfx = PREFIX

        return commands.when_mentioned_or(
            pfx
        )(bot, message)

    # Database
    try:
        from Database.mongodb import get_db

        db = get_db()

        if db is not None:

            doc = db["GuildSettings"].find_one(
                {"_id": guild_id},
                {"prefix": 1}
            )

            if (
                doc
                and "prefix" in doc
                and isinstance(doc["prefix"], str)
                and doc["prefix"].strip()
            ):

                pfx = doc["prefix"].strip()

                PREFIX_CACHE[guild_id] = pfx

                return commands.when_mentioned_or(
                    pfx
                )(bot, message)

    except Exception as e:
        print(
            f"[WARNING] Failed to load guild prefix: "
            f"{type(e).__name__}: {e}"
        )

    # Default
    PREFIX_CACHE[guild_id] = PREFIX

    return commands.when_mentioned_or(
        PREFIX
    )(bot, message)


# ============================================================
# SAFE CONTEXT.SEND
# ============================================================

_old_send = commands.Context.send


async def _safe_send(
    self,
    *args,
    **kwargs
):

    if self.interaction is None:
        kwargs.pop("ephemeral", None)

    return await _old_send(
        self,
        *args,
        **kwargs
    )


commands.Context.send = _safe_send


# ============================================================
# BOT
# ============================================================

class OrbitBot(commands.Bot):

    def __init__(self):

        import collections

        self.stats_history = collections.deque(
            maxlen=30
        )

        # -----------------------------------------
        # Status
        # -----------------------------------------

        try:

            from Commands.OwnerOnly.status import (
                _load_status,
                _build_activity,
                _parse_discord_status
            )

            data = _load_status()

            if data and isinstance(data, dict):

                act = _build_activity(
                    data.get("type", "clear"),
                    data.get("text", "")
                )

                discord_status = _parse_discord_status(
                    data.get("status", "online")
                )

            else:

                act = None
                discord_status = None

        except Exception as e:

            print(
                f"[WARNING] Failed to load bot status: "
                f"{type(e).__name__}: {e}"
            )

            act = None
            discord_status = None

        # -----------------------------------------
        # Owner IDs
        # -----------------------------------------

        owner_ids = set()

        env_owners = (
            os.environ.get("OWNER_IDS")
            or os.environ.get("BOT_OWNER_ID")
            or os.environ.get("OWNER")
        )

        if env_owners:

            try:

                parsed = {
                    int(x.strip())
                    for x in env_owners.split(",")
                    if x.strip().isdigit()
                }

                owner_ids.update(parsed)

            except Exception as e:

                print(
                    f"[WARNING] Failed to parse owner IDs: "
                    f"{type(e).__name__}: {e}"
                )

        # -----------------------------------------
        # Discord Bot
        # -----------------------------------------

        super().__init__(
            command_prefix=get_prefix,
            intents=intents,
            help_command=None,
            tree_cls=OrbitCommandTree,
            activity=act,
            status=discord_status,
            owner_ids=owner_ids or None
        )

    # ========================================================
    # OWNER
    # ========================================================

    async def is_true_owner(
        self,
        user: discord.User | discord.Member
    ) -> bool:

        return await super().is_owner(user)

    async def is_owner(
        self,
        user: discord.User | discord.Member
    ) -> bool:

        if await super().is_owner(user):
            return True

        try:

            path = os.path.join(
                "Database",
                "developers.json"
            )

            if os.path.exists(path):

                with open(
                    path,
                    "r",
                    encoding="utf-8"
                ) as f:

                    devs = __import__(
                        "json"
                    ).load(f)

                if user.id in devs:
                    return True

        except Exception as e:

            print(
                f"[WARNING] Failed to load developers.json: "
                f"{type(e).__name__}: {e}"
            )

        return False

    # ========================================================
    # LIVE STATS
    # ========================================================

    @tasks.loop(seconds=2)
    async def live_stats_loop(self):

        try:

            import psutil
            import math

            process = psutil.Process(
                os.getpid()
            )

            ram_mb = (
                process.memory_info().rss
                / 1024 ** 2
            )

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

            print(
                f"[ERROR] Stats loop error: "
                f"{type(e).__name__}: {e}"
            )

    @live_stats_loop.before_loop
    async def before_live_stats_loop(self):
        await self.wait_until_ready()

    # ========================================================
    # UPTIME
    # ========================================================

    @tasks.loop(minutes=5)
    async def uptime_loop(self):

        try:

            from Database.mongodb import get_db
            import datetime

            db = get_db()

            if db is not None:

                today_str = (
                    datetime.datetime.now(
                        datetime.timezone.utc
                    ).strftime("%Y-%m-%d")
                )

                today_dt = (
                    datetime.datetime.now(
                        datetime.timezone.utc
                    ).replace(
                        hour=0,
                        minute=0,
                        second=0,
                        microsecond=0
                    )
                )

                db_up = 1
                api_up = 1 if not self.is_closed() else 0

                db["UptimeStats"].update_one(
                    {"_id": today_str},
                    {
                        "$inc": {
                            "bot_pings": 1,
                            "db_pings": db_up,
                            "api_pings": api_up
                        },
                        "$setOnInsert": {
                            "date": today_dt
                        }
                    },
                    upsert=True
                )

        except Exception as e:

            print(
                f"[ERROR] Uptime loop error: "
                f"{type(e).__name__}: {e}"
            )

    @uptime_loop.before_loop
    async def before_uptime_loop(self):
        await self.wait_until_ready()

    # ========================================================
    # SETUP HOOK
    # ========================================================

    async def setup_hook(self):

        # -----------------------------------------
        # Background tasks
        # -----------------------------------------

        try:

            if not self.live_stats_loop.is_running():
                self.live_stats_loop.start()

            if not self.uptime_loop.is_running():
                self.uptime_loop.start()

            print(
                "Background stats tracking started."
            )

        except Exception as e:

            print(
                f"[ERROR] Failed to start stats tracking: "
                f"{type(e).__name__}: {e}"
            )

        # -----------------------------------------
        # Commands directory
        # -----------------------------------------

        commands_dir = pathlib.Path(
            "Commands"
        )

        if not commands_dir.exists():

            commands_dir.mkdir(
                parents=True,
                exist_ok=True
            )

        # -----------------------------------------
        # Persistent verify layout
        # -----------------------------------------

        try:

            from Commands.Verify._views import (
                PersistentVerifyLayout
            )

            self.add_view(
                PersistentVerifyLayout()
            )

        except Exception as e:

            print(
                f"[WARNING] Failed to add "
                f"PersistentVerifyLayout: "
                f"{type(e).__name__}: {e}"
            )

        # -----------------------------------------
        # Root command groups
        # -----------------------------------------

        for file_path in commands_dir.rglob("*.py"):

            if file_path.name.startswith("_"):
                continue

            if (
                file_path.stem.lower()
                == file_path.parent.name.lower()
            ):

                extension = ".".join(
                    file_path.with_suffix("").parts
                )

                try:

                    await self.load_extension(
                        extension
                    )

                    print(
                        f"Loaded Root Group: {extension}"
                    )

                except Exception as e:

                    print(
                        f"Failed to load root group "
                        f"{extension}: "
                        f"{type(e).__name__}: {e}"
                    )

        # -----------------------------------------
        # Remaining modules
        # -----------------------------------------

        for file_path in commands_dir.rglob("*.py"):

            if file_path.name.startswith("_"):
                continue

            if (
                file_path.stem.lower()
                == file_path.parent.name.lower()
            ):
                continue

            extension = ".".join(
                file_path.with_suffix("").parts
            )

            try:

                await self.load_extension(
                    extension
                )

                print(
                    f"Loaded: {extension}"
                )

            except Exception as e:

                print(
                    f"Failed to load standard cog "
                    f"{extension}: "
                    f"{type(e).__name__}: {e}"
                )

        # -----------------------------------------
        # Slash command sync
        # -----------------------------------------

        try:

            synced = await self.tree.sync()

            total_cmds = 0

            for cmd in synced:

                if hasattr(cmd, "commands"):
                    total_cmds += (
                        len(cmd.commands) + 1
                    )
                else:
                    total_cmds += 1

            print(
                f"Synced {len(synced)} top-level "
                f"command group(s) "
                f"({total_cmds} total commands)"
            )

        except Exception as e:

            print(
                f"Failed to sync commands: "
                f"{type(e).__name__}: {e}"
            )

        # -----------------------------------------
        # Global View Error Handler
        # -----------------------------------------

        _old_view_error = discord.ui.View.on_error

        async def _global_view_error(
            view_self,
            interaction,
            error,
            item
        ):

            try:

                from Commands.OwnerOnly._monitor import (
                    record_error
                )

                source_name = (
                    f"UI View Error "
                    f"[{view_self.__class__.__name__} "
                    f"-> {item.__class__.__name__}]"
                )

                record_error(
                    source_name,
                    error
                )

                await send_dev_error(
                    interaction.client,
                    source_name,
                    error
                )

            except Exception as e:

                print(
                    f"[ERROR] View error handler failed: "
                    f"{type(e).__name__}: {e}"
                )

            await _old_view_error(
                view_self,
                interaction,
                error,
                item
            )

        discord.ui.View.on_error = _global_view_error

        # -----------------------------------------
        # Global Modal Error Handler
        # -----------------------------------------

        _old_modal_error = discord.ui.Modal.on_error

        async def _global_modal_error(
            modal_self,
            interaction,
            error
        ):

            try:

                from Commands.OwnerOnly._monitor import (
                    record_error
                )

                source_name = (
                    f"UI Modal Error "
                    f"[{modal_self.__class__.__name__}]"
                )

                record_error(
                    source_name,
                    error
                )

                await send_dev_error(
                    interaction.client,
                    source_name,
                    error
                )

            except Exception as e:

                print(
                    f"[ERROR] Modal error handler failed: "
                    f"{type(e).__name__}: {e}"
                )

            await _old_modal_error(
                modal_self,
                interaction,
                error
            )

        discord.ui.Modal.on_error = _global_modal_error

    # ========================================================
    # GLOBAL ERROR
    # ========================================================

    async def on_error(
        self,
        event_method: str,
        *args,
        **kwargs
    ):

        try:

            from Commands.OwnerOnly._monitor import (
                record_error
            )

            exc_type, exc_value, exc_tb = sys.exc_info()

            if exc_value:

                source_name = (
                    f"Event Error [{event_method}]"
                )

                record_error(
                    source_name,
                    exc_value
                )

                await send_dev_error(
                    self,
                    source_name,
                    exc_value
                )

        except Exception as e:

            print(
                f"[ERROR] Global error handler failed: "
                f"{type(e).__name__}: {e}"
            )

        await super().on_error(
            event_method,
            *args,
            **kwargs
        )

    # ========================================================
    # READY
    # ========================================================

    async def on_ready(self):

        print(
            f"Logged in as {self.user} "
            f"(ID: {self.user.id})"
        )

        print(
            f"Prefix: '{PREFIX}'"
        )

        print(
            f"Loaded cogs: {len(self.cogs)}"
        )

    # ========================================================
    # MESSAGE
    # ========================================================

    async def on_message(
        self,
        message: discord.Message
    ):

        if not message.author.bot:

            try:

                from Commands.OwnerOnly._monitor import (
                    record_message
                )

                record_message()

            except Exception as e:

                print(
                    f"[WARNING] Failed to record message: "
                    f"{type(e).__name__}: {e}"
                )

        await super().on_message(
            message
        )

    # ========================================================
    # PREFIX COMMAND ERROR
    # ========================================================

    async def on_command_error(
        self,
        ctx: commands.Context,
        error: commands.CommandError
    ):

        if isinstance(
            error,
            (
                commands.CommandNotFound,
                commands.CheckFailure
            )
        ):
            return

        if (
            hasattr(error, "original")
            and isinstance(
                error.original,
                discord.app_commands.errors.CommandSignatureMismatch
            )
        ):

            try:

                await ctx.send(
                    embed=make_embed(
                        "Command definitions have just been "
                        "updated! Please try running the command again.",
                        discord.Color.green()
                    ),
                    ephemeral=True
                )

            except Exception as e:

                print(
                    f"[WARNING] Failed to send signature mismatch: "
                    f"{type(e).__name__}: {e}"
                )

            return

        try:

            from Commands.OwnerOnly._monitor import (
                record_error
            )

            error_val = getattr(
                error,
                "original",
                error
            )

            record_error(
                "Command Error",
                error_val
            )

            await send_dev_error(
                ctx.bot,
                "Command Error",
                error_val
            )

        except Exception as e:

            print(
                f"[ERROR] Command error logging failed: "
                f"{type(e).__name__}: {e}"
            )

        raise error


# ============================================================
# CREATE BOT
# ============================================================

def create_bot():

    """
    Creates a completely fresh bot instance.

    IMPORTANT:
    This function is called again after a connection failure
    so that a previously closed aiohttp session is never reused.
    """

    bot = OrbitBot()

    # -----------------------------------------
    # Global blacklist check
    # -----------------------------------------

    @bot.check
    async def global_blacklist_prefix_check(
        ctx: commands.Context
    ):

        if not ctx.guild:
            return True

        from Commands.Blacklist._storage import (
            is_blacklisted
        )

        if is_blacklisted(
            ctx.guild.id,
            ctx.author.id
        ):

            try:

                await ctx.send(
                    embed=make_embed(
                        "You are blacklisted from using "
                        "bot commands on this server.",
                        discord.Color.red()
                    ),
                    delete_after=5.0
                )

            except Exception as e:

                print(
                    f"[WARNING] Blacklist message failed: "
                    f"{type(e).__name__}: {e}"
                )

            return False

        return True

    # -----------------------------------------
    # Developer mode check
    # -----------------------------------------

    @bot.check
    async def global_devmode_prefix_check(
        ctx: commands.Context
    ):

        from Commands.OwnerOnly._storage import (
            is_devmode_enabled
        )

        enabled, reason = (
            is_devmode_enabled()
        )

        if not enabled:
            return True

        if await ctx.bot.is_owner(
            ctx.author
        ):
            return True

        view = DevmodeNoticeLayout(
            reason
        )

        try:

            await ctx.send(
                view=view,
                delete_after=15.0,
                allowed_mentions=discord.AllowedMentions.none()
            )

        except Exception as e:

            print(
                f"[WARNING] Developer mode message failed: "
                f"{type(e).__name__}: {e}"
            )

        return False

    return bot


# ============================================================
# WEB SERVER
# ============================================================

async def start_web_server():

    from aiohttp import web

    port = int(
        os.environ.get(
            "PORT",
            "10000"
        )
    )

    try:

        from Website.backend.main import (
            setup_web_app
        )

        # Dashboard expects a bot argument.
        # We pass None because the web server must start
        # independently from Discord.
        app = setup_web_app(None)

    except Exception as e:

        print(
            f"[ERROR] Failed to setup Web Dashboard: "
            f"{type(e).__name__}: {e}"
        )

        traceback.print_exc()

        app = web.Application()

    # -----------------------------------------
    # Render Health Check
    # -----------------------------------------

    async def health(request):
        return web.Response(
            text="OK",
            status=200
        )

    # Only add if it doesn't already exist
    try:

        app.router.add_get(
            "/health",
            health
        )

    except RuntimeError:

        # Route table already frozen or route exists.
        pass

    # -----------------------------------------
    # Start HTTP server
    # -----------------------------------------

    runner = web.AppRunner(
        app
    )

    await runner.setup()

    site = web.TCPSite(
        runner,
        "0.0.0.0",
        port
    )

    await site.start()

    print(
        f"Web server started on "
        f"0.0.0.0:{port}"
    )

    return runner


# ============================================================
# MAIN
# ============================================================

async def main():

    if not TOKEN:

        print(
            "[FATAL] No TOKEN found."
        )

        print(
            "Set TOKEN in Render Environment Variables."
        )

        return

    # -----------------------------------------
    # Start Render web server FIRST
    # -----------------------------------------

    try:

        await start_web_server()

    except Exception as e:

        print(
            f"[FATAL] Web server failed to start: "
            f"{type(e).__name__}: {e}"
        )

        traceback.print_exc()

        return

    # -----------------------------------------
    # Discord retry loop
    # -----------------------------------------

    retry_delay = 10

    while True:

        bot = None

        try:

            print(
                "Creating fresh Discord bot instance..."
            )

            bot = create_bot()

            print(
                "Connecting to Discord..."
            )

            await bot.start(
                TOKEN
            )

            # If bot.start() returns normally,
            # Discord connection has ended.

            print(
                "Discord bot stopped normally."
            )

            break

        except asyncio.CancelledError:

            print(
                "Main task cancelled."
            )

            raise

        except discord.LoginFailure as e:

            print(
                "[FATAL] Discord login failed."
            )

            print(
                f"Reason: {e}"
            )

            print(
                "Check the TOKEN environment variable "
                "on Render."
            )

            break

        except discord.PrivilegedIntentsRequired as e:

            print(
                "[FATAL] Discord requires privileged intents."
            )

            print(
                f"Reason: {e}"
            )

            print(
                "Enable Message Content Intent and "
                "Server Members Intent in the Discord "
                "Developer Portal."
            )

            break

        except (
            discord.HTTPException,
            discord.GatewayNotFound,
            discord.ConnectionClosed,
            OSError,
            asyncio.TimeoutError
        ) as e:

            print(
                f"[NETWORK ERROR] "
                f"{type(e).__name__}: {e}"
            )

            print(
                f"Retrying connection in "
                f"{retry_delay} seconds..."
            )

            # ---------------------------------
            # IMPORTANT:
            # Close old bot/session completely
            # ---------------------------------

            if bot is not None:

                try:

                    if not bot.is_closed():

                        await bot.close()

                        print(
                            "Old Discord bot session closed."
                        )

                except Exception as close_error:

                    print(
                        f"[WARNING] Failed to close old "
                        f"bot session: "
                        f"{type(close_error).__name__}: "
                        f"{close_error}"
                    )

            await asyncio.sleep(
                retry_delay
            )

            retry_delay = min(
                retry_delay * 2,
                300
            )

        except Exception as e:

            print(
                f"[UNEXPECTED ERROR] "
                f"{type(e).__name__}: {e}"
            )

            traceback.print_exc()

            # ---------------------------------
            # Always close old session
            # ---------------------------------

            if bot is not None:

                try:

                    if not bot.is_closed():

                        await bot.close()

                        print(
                            "Old Discord bot session closed."
                        )

                except Exception as close_error:

                    print(
                        f"[WARNING] Failed to close bot: "
                        f"{type(close_error).__name__}: "
                        f"{close_error}"
                    )

            print(
                f"Retrying connection in "
                f"{retry_delay} seconds..."
            )

            await asyncio.sleep(
                retry_delay
            )

            retry_delay = min(
                retry_delay * 2,
                300
            )

        else:

            # Successful connection that later stopped.
            # Wait and create a fresh bot.

            print(
                "Discord connection ended."
            )

            if bot is not None:

                try:

                    if not bot.is_closed():
                        await bot.close()

                except Exception:
                    pass

            print(
                f"Restarting Discord connection in "
                f"{retry_delay} seconds..."
            )

            await asyncio.sleep(
                retry_delay
            )


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    if not TOKEN:

        print(
            "=========================================="
        )

        print(
            "ERROR: No TOKEN found."
        )

        print(
            "Set TOKEN in your Render Environment Variables."
        )

        print(
            "=========================================="
        )

    else:

        try:

            asyncio.run(
                main()
            )

        except KeyboardInterrupt:

            print(
                "Bot stopped by user."
            )

        except Exception as e:

            print(
                f"[FATAL] Application crashed: "
                f"{type(e).__name__}: {e}"
            )

            traceback.print_exc()
            