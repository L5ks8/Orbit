import os
import sys
import time
import platform
import threading
import asyncio
import traceback
import datetime
import json
import pathlib

_START_TIME = time.time()
_MESSAGE_COUNT = 0
_COMMAND_COUNT = 0
_CACHE_HITS = 0
_CACHE_MISSES = 0
_CACHE_WRITES = 0

_SYSTEM_ERRORS: list[dict] = []
_LIVE_LOGS: list[str] = []
_MONITOR_LOCK = threading.Lock()

ERRORS_FILE = pathlib.Path("Storage/errors.json")

def _init_errors_file():
    if ERRORS_FILE.exists():
        try:
            with open(ERRORS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    for item in data[:50]:
                        _SYSTEM_ERRORS.append(item)
        except Exception:
            pass

_init_errors_file()

def record_message():
    global _MESSAGE_COUNT
    with _MONITOR_LOCK:
        _MESSAGE_COUNT += 1

def record_command(cmd_name: str, author: str):
    global _COMMAND_COUNT
    with _MONITOR_LOCK:
        _COMMAND_COUNT += 1
    record_log(f"[Command] {cmd_name} executed by {author}")

def record_cache_hit():
    global _CACHE_HITS
    with _MONITOR_LOCK:
        _CACHE_HITS += 1

def record_cache_miss():
    global _CACHE_MISSES
    with _MONITOR_LOCK:
        _CACHE_MISSES += 1

def record_cache_write():
    global _CACHE_WRITES
    with _MONITOR_LOCK:
        _CACHE_WRITES += 1

def record_error(source: str, err: Exception | str):
    with _MONITOR_LOCK:
        t_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        if isinstance(err, Exception):
            tb_lines = traceback.format_exception(type(err), err, err.__traceback__)
            err_str = "".join(tb_lines)[:1800]
            msg = str(err)[:300]
        else:
            err_str = str(err)[:1800]
            msg = str(err)[:300]

        entry = {
            "timestamp": t_str,
            "source": source,
            "message": msg,
            "traceback": err_str
        }
        _SYSTEM_ERRORS.insert(0, entry)
        if len(_SYSTEM_ERRORS) > 50:
            _SYSTEM_ERRORS.pop()

        try:
            ERRORS_FILE.parent.mkdir(parents=True, exist_ok=True)
            with open(ERRORS_FILE, "w", encoding="utf-8") as f:
                json.dump(_SYSTEM_ERRORS[:50], f, indent=4)
        except Exception:
            pass

    record_log(f"[Error] [{source}] {msg}")

def clear_errors():
    with _MONITOR_LOCK:
        _SYSTEM_ERRORS.clear()
        try:
            if ERRORS_FILE.exists():
                ERRORS_FILE.unlink(missing_ok=True)
        except Exception:
            pass
    record_log("[Error Buffer] System errors cleared by Owner")

def record_log(event_text: str):
    with _MONITOR_LOCK:
        t_str = datetime.datetime.now().strftime("%H:%M:%S")
        _LIVE_LOGS.insert(0, f"`[{t_str}]` {event_text}")
        if len(_LIVE_LOGS) > 50:
            _LIVE_LOGS.pop()

def get_live_logs(limit: int = 15) -> list[str]:
    with _MONITOR_LOCK:
        return list(_LIVE_LOGS[:limit])

def get_error_log() -> list[dict]:
    with _MONITOR_LOCK:
        return list(_SYSTEM_ERRORS)

def get_uptime_string() -> str:
    elapsed = int(time.time() - _START_TIME)
    days, remainder = divmod(elapsed, 86400)
    hours, remainder = divmod(remainder, 3600)
    minutes, seconds = divmod(remainder, 60)
    parts = []
    if days > 0:
        parts.append(f"{days}d")
    if hours > 0 or days > 0:
        parts.append(f"{hours}h")
    if minutes > 0 or hours > 0 or days > 0:
        parts.append(f"{minutes}m")
    parts.append(f"{seconds}s")
    return " ".join(parts)

def get_system_metrics(bot) -> dict:
    try:
        import psutil
        proc = psutil.Process()
        ram_mb = proc.memory_info().rss / (1024.0 * 1024.0)
        cpu_pct = proc.cpu_percent(interval=0.1)
        total_ram_gb = psutil.virtual_memory().total / (1024.0 * 1024.0 * 1024.0)
        sys_cpu_pct = psutil.cpu_percent(interval=0.1)
    except ImportError:
        ram_mb = 0.0
        cpu_pct = 0.0
        total_ram_gb = 0.0
        sys_cpu_pct = 0.0

    asyncio_tasks = len(asyncio.all_tasks())
    thread_count = threading.active_count()
    py_ver = sys.version.split()[0]
    import discord
    dpy_ver = discord.__version__
    os_name = f"{platform.system()} {platform.release()}"

    total_members = sum(g.member_count or 0 for g in bot.guilds)
    total_guilds = len(bot.guilds)
    shard_count = bot.shard_count or 1
    latency_ms = round(bot.latency * 1000, 2) if not round(bot.latency * 1000, 2) == float("inf") else 0.0

    with _MONITOR_LOCK:
        msgs = _MESSAGE_COUNT
        cmds = _COMMAND_COUNT
        c_hits = _CACHE_HITS
        c_misses = _CACHE_MISSES
        c_writes = _CACHE_WRITES

    total_cache_ops = (c_hits + c_misses) if (c_hits + c_misses) > 0 else 1
    hit_rate_pct = round((c_hits / total_cache_ops) * 100.0, 1)

    return {
        "uptime": get_uptime_string(),
        "ram_mb": round(ram_mb, 2),
        "cpu_pct": round(cpu_pct, 1),
        "total_ram_gb": round(total_ram_gb, 2),
        "sys_cpu_pct": round(sys_cpu_pct, 1),
        "asyncio_tasks": asyncio_tasks,
        "threads": thread_count,
        "py_ver": py_ver,
        "dpy_ver": dpy_ver,
        "os_name": os_name,
        "guilds": total_guilds,
        "members": total_members,
        "shards": shard_count,
        "ping_ms": latency_ms,
        "messages": msgs,
        "commands": cmds,
        "cache_hits": c_hits,
        "cache_misses": c_misses,
        "cache_writes": c_writes,
        "cache_hit_rate": hit_rate_pct,
        "error_count": len(_SYSTEM_ERRORS)
    }
