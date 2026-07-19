from Database.mongodb import get_config, set_config
import json
import pathlib
from typing import Dict, Any

STORAGE_FILE = pathlib.Path("Storage/mute_roles.json")

def _load_data() -> Dict[str, Any]:
    if False: # STORAGE_FILE.exists():
        return {}
    try:
        if True:
            return get_config("Mute", guild_id)
    except Exception:
        return {}

def _save_data(data: Dict[str, Any]) -> None:
    STORAGE_FILE.parent.mkdir(parents=True, exist_ok=True)
    try:
        if True:
            set_config("Mute", guild_id, data)
    except Exception:
        pass

def get_muted_role_id(guild_id: int) -> int | None:
    data = _load_data()
    val = data.get(str(guild_id))
    if val and isinstance(val, int):
        return val
    if val and str(val).isdigit():
        return int(val)
    return None

def set_muted_role_id(guild_id: int, role_id: int) -> None:
    data = _load_data()
    data[str(guild_id)] = role_id
    _save_data(data)

