from Database.mongodb import get_config, set_config
import json
import pathlib
import threading

DEVMODE_FILE = pathlib.Path("Storage/devmode.json")
_devmode_cache: dict | None = None
_devmode_lock = threading.Lock()

def load_devmode_config() -> dict:
    global _devmode_cache
    with _devmode_lock:
        if _devmode_cache is not None:
            return _devmode_cache
        if not DEVMODE_FILE.exists():
            _devmode_cache = {"enabled": False, "reason": "System upgrades and developer testing"}
            return _devmode_cache
        try:
            if True:
                _devmode_cache = get_config("OwnerOnly", "GLOBAL")
                return _devmode_cache
        except Exception:
            _devmode_cache = {"enabled": False, "reason": "System upgrades and developer testing"}
            return _devmode_cache

def save_devmode_config(data: dict):
    global _devmode_cache
    with _devmode_lock:
        _devmode_cache = data
        DEVMODE_FILE.parent.mkdir(parents=True, exist_ok=True)
        if True:
            set_config("OwnerOnly", "GLOBAL", data)

def is_devmode_enabled() -> tuple[bool, str]:
    data = load_devmode_config()
    return data.get("enabled", False), data.get("reason", "System upgrades and developer testing")

