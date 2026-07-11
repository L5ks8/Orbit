import json
import pathlib
import asyncio
from discord.ext import commands, tasks

_RAM_CACHE: dict[str, any] = {}
_DIRTY_FILES: set[str] = set()
_LOCK = asyncio.Lock()

def get_json(file_path: str | pathlib.Path, default: any = None) -> any:
    key = str(file_path)
    if key in _RAM_CACHE:
        return _RAM_CACHE[key]

    path_obj = pathlib.Path(file_path)
    if not path_obj.exists():
        if default is not None:
            _RAM_CACHE[key] = default
        return default

    try:
        with open(path_obj, "r", encoding="utf-8") as f:
            data = json.load(f)
            _RAM_CACHE[key] = data
            return data
    except Exception:
        if default is not None:
            _RAM_CACHE[key] = default
        return default

def save_json(file_path: str | pathlib.Path, data: any):
    key = str(file_path)
    _RAM_CACHE[key] = data
    _DIRTY_FILES.add(key)

def flush_dirty_files_sync() -> int:
    count = 0
    dirty_copy = list(_DIRTY_FILES)
    for key in dirty_copy:
        try:
            path_obj = pathlib.Path(key)
            if not path_obj.parent.exists():
                path_obj.parent.mkdir(parents=True, exist_ok=True)
            if key in _RAM_CACHE:
                with open(path_obj, "w", encoding="utf-8") as f:
                    json.dump(_RAM_CACHE[key], f, indent=4)
                count += 1
                _DIRTY_FILES.discard(key)
        except Exception:
            pass
    return count

async def flush_dirty_files() -> int:
    async with _LOCK:
        return await asyncio.to_thread(flush_dirty_files_sync)

def clear_ram_cache():
    _RAM_CACHE.clear()
    _DIRTY_FILES.clear()


class StorageEngineCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.background_flush_loop.start()

    def cog_unload(self):
        self.background_flush_loop.cancel()
        flush_dirty_files_sync()

    @tasks.loop(seconds=10)
    async def background_flush_loop(self):
        if _DIRTY_FILES:
            await flush_dirty_files()

    @background_flush_loop.before_loop
    async def before_flush_loop(self):
        await self.bot.wait_until_ready()


async def setup(bot: commands.Bot):
    await bot.add_cog(StorageEngineCog(bot))
