utf-8import json
import pathlib
from typing import Dict, Any

STORAGE_FILE = pathlib.Path("Storage/mute_roles.json")

def _load_data() -> Dict[str, Any]:
    if not STORAGE_FILE.exists():
        return {}
    try:
        with open(STORAGE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}

def _save_data(data: Dict[str, Any]) -> None:
    STORAGE_FILE.parent.mkdir(parents=True, exist_ok=True)
    try:
        with open(STORAGE_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4)
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
